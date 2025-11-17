package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"price-analyzer-backend/internal/data"
	"price-analyzer-backend/internal/web"
)

type AddRequest struct {
	URL string `json:"url"`
}

func main() {
	err := godotenv.Load() 
	if err != nil {
		log.Println("Aviso: Arquivo .env não encontrado, usando variáveis de ambiente do OS.")
	}

	log.Println("Iniciando servidor...")
	data.ConnectDB()

	http.HandleFunc("/products", handleProducts)

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Servidor rodando na porta %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleProducts(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" { return }

	if r.Method == "GET" {
		products, err := data.GetAllProducts()
		if err != nil {
			http.Error(w, "Erro ao buscar produtos", 500)
			log.Println(err)
			return
		}
		json.NewEncoder(w).Encode(products)
		return
	}

	if r.Method == "POST" {
		var req AddRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "JSON inválido", 400)
			return
		}

		title, image, price, err := web.ScrapeProduct(req.URL)
		if err != nil {
			http.Error(w, "Erro no scraper: "+err.Error(), 500)
			return
		}

		newProduct := data.Product{
			Name:         title,
			URL:          req.URL,
			ImageURL:     image,
			CurrentPrice: price,
		}

		id, err := data.CreateProduct(newProduct)
		if err != nil {
			http.Error(w, "Erro ao salvar no banco: "+err.Error(), 500)
			return
		}

		data.UpdatePrice(id, price)

		newProduct.ID = id
		json.NewEncoder(w).Encode(newProduct)
	}
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}