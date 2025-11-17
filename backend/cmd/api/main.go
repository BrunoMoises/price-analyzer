package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"price-analyzer-backend/internal/auth"
	"price-analyzer-backend/internal/data"
	"price-analyzer-backend/internal/server"
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
	worker.StartTelegramListener()

	http.HandleFunc("/auth/google/login", handleGoogleLogin)
	http.HandleFunc("/auth/google/callback", handleGoogleCallback)
	http.HandleFunc("/auth/me", server.AuthenticateMiddleware(handleMe))
	http.HandleFunc("/user/settings", server.AuthenticateMiddleware(handleUserSettings))

	http.HandleFunc("/products", server.AuthenticateMiddleware(handleProducts))
	http.HandleFunc("/product/info", server.AuthenticateMiddleware(handleProductInfo))
	http.HandleFunc("/product/alert", server.AuthenticateMiddleware(handleAlertSetup))
	http.HandleFunc("/product/delete", server.AuthenticateMiddleware(handleDeleteProduct))
	
	http.HandleFunc("/product", server.AuthenticateMiddleware(handleProductDetails)) 


	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Servidor rodando na porta %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleGoogleLogin(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    auth.HandleGoogleLogin(w, r)
}

func handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    auth.HandleGoogleCallback(w, r)
}

func handleProducts(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" { return }

	userID, ok := server.GetUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "ID de usuário ausente.", http.StatusUnauthorized)
        return
    }

	if r.Method == "GET" {
		products, err := data.GetAllProducts(userID)
		if err != nil {
			http.Error(w, "Erro ao buscar produtos", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(products)
		return
	}

	if r.Method == "POST" {
		var req AddRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "JSON inválido", http.StatusInternalServerError)
			return
		}

		title, image, price, err := web.ScrapeProduct(req.URL)
		if err != nil {
			http.Error(w, "Erro no scraper: "+err.Error(), http.StatusInternalServerError)
			return
		}

		newProduct := data.Product{
			Name:         title,
			URL:          req.URL,
			ImageURL:     image,
			CurrentPrice: price,
            UserID:       userID,
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

func handleProductDetails(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    if r.Method == "OPTIONS" { return }

	userID, ok := server.GetUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "ID de usuário ausente.", http.StatusUnauthorized)
        return
    }

    idStr := r.URL.Query().Get("id")
    if idStr == "" {
        http.Error(w, "ID é obrigatório", 400)
        return
    }

    var id int
    fmt.Sscanf(idStr, "%d", &id)

    history, err := data.GetProductHistory(id, userID) 
    if err != nil {
        http.Error(w, "Erro ao buscar histórico: "+err.Error(), 500)
        return
    }

    json.NewEncoder(w).Encode(history)
}

func handleProductInfo(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" { return }

	userID, ok := server.GetUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "ID de usuário ausente.", http.StatusUnauthorized)
        return
    }

	idStr := r.URL.Query().Get("id")
	var id int
	fmt.Sscanf(idStr, "%d", &id)

	product, err := data.GetProductByID(id, userID) 
	if err != nil {
		http.Error(w, "Produto não encontrado", 404)
		return
	}

    if product.UserID != userID {
        http.Error(w, "Acesso negado.", http.StatusForbidden)
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

	userID, ok := server.GetUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "ID de usuário ausente.", http.StatusUnauthorized)
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

	err := data.UpdateTargetPrice(req.ID, userID, req.TargetPrice)
	if err != nil {
		http.Error(w, "Erro ao atualizar alerta: "+err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}

func handleDeleteProduct(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    if r.Method != "DELETE" {
        http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
        return
    }

    userID, ok := server.GetUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "Falha na autenticação.", http.StatusUnauthorized)
        return
    }

    productIDStr := r.URL.Query().Get("id")
    if productIDStr == "" {
        http.Error(w, "ID do produto ausente.", http.StatusBadRequest)
        return
    }
    
    var productID int
    fmt.Sscanf(productIDStr, "%d", &productID)

    err := data.DeleteProduct(productID, userID)
    
    if err != nil {
        http.Error(w, "Erro ao deletar produto: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func handleMe(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    if r.Method == "OPTIONS" { return }

    userID, ok := server.GetUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "Não autorizado", http.StatusUnauthorized)
        return
    }

    user, err := data.GetUserByID(userID)
    if err != nil {
        http.Error(w, "Usuário não encontrado", 404)
        return
    }

    json.NewEncoder(w).Encode(user)
}

func handleUserSettings(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    if r.Method == "OPTIONS" { w.WriteHeader(http.StatusOK); return }

    userID, ok := server.GetUserIDFromContext(r.Context())
    if !ok {
        http.Error(w, "Não autorizado", http.StatusUnauthorized)
        return
    }

    if r.Method == "POST" {
        type SettingsReq struct {
            TelegramChatID string `json:"telegram_chat_id"`
        }
        var req SettingsReq
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "JSON inválido", 400)
            return
        }

        err := data.UpdateUserTelegram(userID, req.TelegramChatID)
        if err != nil {
            http.Error(w, "Erro ao salvar: "+err.Error(), 500)
            return
        }
        w.WriteHeader(http.StatusOK)
    }
}