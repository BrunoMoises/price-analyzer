package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Product struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	ImageURL string  `json:"image_url"`
}

type AddProductRequest struct {
	URL string `json:"url"`
}

var products []Product

func main() {
	products = append(products, Product{ID: "1", Name: "RTX 4090", Price: 12500.00, ImageURL: "https://m.media-amazon.com/images/I/712+A5gHq+L._AC_SX679_.jpg"})

	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)

		if r.Method == "GET" {
			json.NewEncoder(w).Encode(products)
			return
		}

		if r.Method == "POST" {
			var req AddProductRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			fmt.Println("Scraping URL:", req.URL)
			title, image, price, err := ScrapeProduct(req.URL)
			if err != nil {
				http.Error(w, "Erro ao acessar o site: "+err.Error(), http.StatusInternalServerError)
				return
			}

			newProduct := Product{
				ID:       fmt.Sprintf("%d", time.Now().Unix()),
				Name:     title,
				ImageURL: image,
				Price:    price,
			}

			products = append(products, newProduct)

			json.NewEncoder(w).Encode(newProduct)
		}
	})

	fmt.Println("Server running on :8080")
	http.ListenAndServe(":8080", nil)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}