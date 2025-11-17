package data

import (
	"database/sql"
	"time"
)

type User struct {
    ID        int    `db:"id" json:"id"`
    GoogleID  string `db:"google_id" json:"google_id"`
    Email     string `db:"email" json:"email"`
    Name      string `db:"name" json:"name"`
}

type Product struct {
	ID           int          `db:"id" json:"id"`
	UserID       int          `db:"user_id" json:"user_id"`
	Name         string       `db:"name" json:"name"`
	URL          string       `db:"url" json:"url"`
	ImageURL     string       `db:"image_url" json:"image_url"`
	CurrentPrice float64      `db:"current_price" json:"price"`
	CreatedAt    time.Time    `db:"created_at" json:"created_at"`
	TargetPrice  float64      `db:"target_price" json:"target_price"`
	LastAlertAt  sql.NullTime `db:"last_alert_at" json:"-"`
}

type PricePoint struct {
	Price     float64   `db:"price" json:"price"`
	ScrapedAt time.Time `db:"scraped_at" json:"date"`
}

func GetOrCreateUser(googleID, email, name string) (User, error) {
    var user User
    query := `SELECT id, email, name FROM users WHERE google_id = $1`
    err := DB.Get(&user, query, googleID)

    if err == nil {
        return user, nil
    }
    if err != sql.ErrNoRows {
        return User{}, err
    }

    insertQuery := `INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id`
    var newID int
    err = DB.QueryRow(insertQuery, googleID, email, name).Scan(&newID)
    
    if err == nil {
        user.ID = newID
        user.GoogleID = googleID
        user.Email = email
        user.Name = name
    }
    return user, err
}

func CreateProduct(p Product, userID int) (int, error) {
	var id int
	query := `
		INSERT INTO products (name, url, image_url, current_price, user_id) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id`
	
	err := DB.QueryRow(query, p.Name, p.URL, p.ImageURL, p.CurrentPrice, userID).Scan(&id)
	return id, err
}

func GetAllProducts(userID int) ([]Product, error) {
	var products []Product{}

	query := `SELECT id, name, url, image_url, current_price, created_at, target_price, last_alert_at
								FROM products 
								WHERE user_id = $1
								ORDER BY created_at DESC`

	err := DB.Select(&products, query, userID)
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

func GetProductHistory(productID int) ([]PricePoint, error) {
	history := []PricePoint{}
	
	query := `
		SELECT price, scraped_at 
		FROM price_history 
		WHERE product_id = $1 
		ORDER BY scraped_at ASC`
		
	err := DB.Select(&history, query, productID)
	return history, err
}

func GetProductByID(id int) (Product, error) {
	var p Product
	query := `SELECT id, name, url, image_url, current_price, created_at FROM products WHERE id = $1`
	err := DB.Get(&p, query, id)
	return p, err
}

func UpdateLastAlert(productID int) error {
	_, err := DB.Exec("UPDATE products SET last_alert_at = NOW() WHERE id = $1", productID)
	return err
}

func UpdateTargetPrice(productID int, targetPrice float64) error {
	query := `UPDATE products SET target_price = $1, last_alert_at = NULL WHERE id = $2`
	_, err := DB.Exec(query, targetPrice, productID)
	return err
}

func DeleteProduct(productID int, userID int) error {
    _, err := DB.Exec("DELETE FROM products WHERE id = $1 AND user_id = $2", productID, userID)
    return err
}