package data

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

type User struct {
	ID       int    `db:"id" json:"id"`
	GoogleID string `db:"google_id" json:"google_id"`
	Email    string `db:"email" json:"email"`
	Name     string `db:"name" json:"name"`
	AvatarURL string `db:"avatar_url" json:"avatar_url"`
	TelegramChatID string `db:"telegram_chat_id" json:"telegram_chat_id"`
}

type Product struct {
	ID             int          `db:"id" json:"id"`
	UserID         int          `db:"user_id" json:"user_id"`
	Name           string       `db:"name" json:"name"`
	URL            string       `db:"url" json:"url"`
	ImageURL       string       `db:"image_url" json:"image_url"`
	CurrentPrice   float64      `db:"current_price" json:"price"`
	CreatedAt      time.Time    `db:"created_at" json:"created_at"`
	TargetPrice    float64      `db:"target_price" json:"target_price"`
	LastAlertAt    sql.NullTime `db:"last_alert_at" json:"-"`
	TelegramChatID string       `db:"telegram_chat_id" json:"-"`
}

type PricePoint struct {
	Price     float64   `db:"price" json:"price"`
	ScrapedAt time.Time `db:"scraped_at" json:"date"`
}

const productCacheTTL = 10 * time.Minute

func GetOrCreateUser(googleID, email, name, avatarURL string) (User, error) {
	var user User
	user.GoogleID = googleID
	user.Email = email
	user.Name = name
	user.AvatarURL = avatarURL

	query := `
		INSERT INTO users (google_id, email, name, avatar_url) 
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (google_id) 
		DO UPDATE SET 
			email = EXCLUDED.email, 
			name = EXCLUDED.name, 
			avatar_url = EXCLUDED.avatar_url
		RETURNING id`
	
	err := DB.QueryRow(query, googleID, email, name, avatarURL).Scan(&user.ID)
	
	if err != nil {
		return User{}, err
	}

	return user, nil
}

func GetUserByID(userID int) (User, error) {
    var user User
    query := `SELECT id, google_id, email, name, avatar_url, telegram_chat_id FROM users WHERE id = $1`
    err := DB.Get(&user, query, userID)
    return user, err
}

func CreateProduct(p Product) (int, error) {
	var id int
	query := `
		INSERT INTO products (name, url, image_url, current_price, user_id) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id`

	err := DB.QueryRow(query, p.Name, p.URL, p.ImageURL, p.CurrentPrice, p.UserID).Scan(&id)
	
	if err == nil {
		InvalidateUserCache(p.UserID)
	}
	
	return id, err
}

func GetAllProducts(userID int) ([]Product, error) {
	if RDB != nil {
		cacheKey := fmt.Sprintf("products:user:%d", userID)
		val, err := RDB.Get(context.Background(), cacheKey).Result()
		
		if err == nil {
			var products []Product
			if json.Unmarshal([]byte(val), &products) == nil {
				return products, nil
			}
		}
	}

	var products []Product
	query := `SELECT id, user_id, name, url, image_url, current_price, created_at, target_price, last_alert_at
			  FROM products 
			  WHERE user_id = $1
			  ORDER BY created_at DESC`

	err := DB.Select(&products, query, userID)
	if err != nil {
		return nil, err
	}

	if RDB != nil && len(products) > 0 {
		if data, err := json.Marshal(products); err == nil {
			cacheKey := fmt.Sprintf("products:user:%d", userID)
			RDB.Set(context.Background(), cacheKey, data, productCacheTTL)
		}
	}

	return products, err
}

func GetAllProductsForWorker() ([]Product, error) {
	products := []Product{}

	query := `
		SELECT p.id, p.user_id, p.name, p.url, p.image_url, p.current_price, 
               p.created_at, p.target_price, p.last_alert_at,
               u.telegram_chat_id
		FROM products p
        JOIN users u ON p.user_id = u.id
		ORDER BY p.created_at DESC`

	err := DB.Select(&products, query)
	return products, err
}

func UpdatePrice(productID int, newPrice float64) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec("INSERT INTO price_history (product_id, price) VALUES ($1, $2)", productID, newPrice)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("UPDATE products SET current_price = $1, updated_at = NOW() WHERE id = $2", newPrice, productID)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func GetProductHistory(productID int, userID int) ([]PricePoint, error) {
	history := []PricePoint{}
	
	query := `
		SELECT ph.price, ph.scraped_at 
		FROM price_history ph
		JOIN products p ON ph.product_id = p.id
		WHERE ph.product_id = $1 AND p.user_id = $2
		ORDER BY ph.scraped_at ASC`

	err := DB.Select(&history, query, productID, userID)
	return history, err
}

func GetProductByID(id int, userID int) (Product, error) {
	var p Product
	query := `SELECT id, user_id, name, url, image_url, current_price, created_at, target_price 
			  FROM products WHERE id = $1 AND user_id = $2`
	err := DB.Get(&p, query, id, userID)
	return p, err
}

func UpdateLastAlert(productID int) error {
	_, err := DB.Exec("UPDATE products SET last_alert_at = NOW() WHERE id = $1", productID)
	return err
}

func UpdateTargetPrice(productID int, userID int, targetPrice float64) error {
	query := `UPDATE products SET target_price = $1, last_alert_at = NULL WHERE id = $2 AND user_id = $3`
	_, err := DB.Exec(query, targetPrice, productID, userID)
	
	if err == nil {
		InvalidateUserCache(userID)
	}
	return err
}

func DeleteProduct(productID int, userID int) error {
	_, err := DB.Exec("DELETE FROM products WHERE id = $1 AND user_id = $2", productID, userID)
	
	if err == nil {
		InvalidateUserCache(userID)
	}
	return err
}

func InvalidateUserCache(userID int) {
	if RDB != nil {
		key := fmt.Sprintf("products:user:%d", userID)
		RDB.Del(context.Background(), key)
	}
}

func UpdateUserTelegram(userID int, chatID string) error {
    _, err := DB.Exec("UPDATE users SET telegram_chat_id = $1 WHERE id = $2", chatID, userID)
    return err
}