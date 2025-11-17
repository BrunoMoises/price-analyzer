package data

import (
	"database/sql"
	"time"
)

type Product struct {
	ID           int          `db:"id" json:"id"`
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

func CreateProduct(p Product) (int, error) {
	var id int
	query := `
		INSERT INTO products (name, url, image_url, current_price) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id`
	
	err := DB.QueryRow(query, p.Name, p.URL, p.ImageURL, p.CurrentPrice).Scan(&id)
	return id, err
}

func GetAllProducts() ([]Product, error) {
	var products []Product
	err := DB.Select(&products, `SELECT id, name, url, image_url, current_price, created_at, target_price, last_alert_at
								FROM products 
								ORDER BY created_at DESC`)
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