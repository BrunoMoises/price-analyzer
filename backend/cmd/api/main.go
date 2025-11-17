package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"fmt"

	"github.com/joho/godotenv"

	"price-analyzer-backend/internal/data"
	"price-analyzer-backend/internal/web"
	"price-analyzer-backend/internal/worker"
)

type AddRequest struct {
	URL string `json:"url"`
}

type AlertRequest struct {
	ID          int     `json:"id"`
	TargetPrice float64 `json:"target_price"`
}

func main() {
	err := godotenv.Load() 
	if err != nil {
		log.Println("Aviso: Arquivo .env não encontrado, usando variáveis de ambiente do OS.")
	}

	log.Println("Iniciando servidor...")
	data.ConnectDB()

	worker.StartPriceMonitor()

	http.HandleFunc("/products", handleProducts)
	http.HandleFunc("/product", handleProductDetails)
	http.HandleFunc("/product/info", handleProductInfo)
	http.HandleFunc("/product/alert", handleAlertSetup)

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

func handleProductDetails(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    if r.Method == "OPTIONS" { return }

    idStr := r.URL.Query().Get("id")
    if idStr == "" {
        http.Error(w, "ID é obrigatório", 400)
        return
    }

    var id int
    fmt.Sscanf(idStr, "%d", &id)

    history, err := data.GetProductHistory(id)
    if err != nil {
        http.Error(w, "Erro ao buscar histórico: "+err.Error(), 500)
        return
    }

    json.NewEncoder(w).Encode(history)
}

func handleProductInfo(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" { return }

	idStr := r.URL.Query().Get("id")
	var id int
	fmt.Sscanf(idStr, "%d", &id)

	product, err := data.GetProductByID(id)
	if err != nil {
		http.Error(w, "Produto não encontrado", 404)
		return
	}

	json.NewEncoder(w).Encode(product)
}

func handleAlertSetup(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Método não permitido", 405)
		return
	}

	type AlertRequest struct {
		ID          int     `json:"id"`
		TargetPrice float64 `json:"target_price"`
	}

	var req AlertRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", 400)
		return
	}

	err := data.UpdateTargetPrice(req.ID, req.TargetPrice)
	if err != nil {
		http.Error(w, "Erro ao atualizar alerta: "+err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}