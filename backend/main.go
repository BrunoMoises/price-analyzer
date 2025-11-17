package main

import (
	"encoding/json"
	"net/http"
)

// Simula um produto para testar o frontend
type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func main() {
	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")

		products := []Product{
			{ID: "1", Name: "RTX 4090", Price: 12500.00},
			{ID: "2", Name: "MacBook Pro M3", Price: 18999.00},
		}

		json.NewEncoder(w).Encode(products)
	})

	println("Backend rodando na porta 8080...")
	http.ListenAndServe(":8080", nil)
}