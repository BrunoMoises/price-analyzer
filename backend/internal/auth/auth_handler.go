package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"price-analyzer-backend/internal/data"
	
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleUserInfo struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

const oauthStateString = "randomStateString"

const googleUserInfoAPI = "https://www.googleapis.com/oauth2/v2/userinfo"

func getOauthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  "http://localhost:8080/auth/google/callback", 
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

func generateJWTToken(userID int) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     expirationTime.Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	config := getOauthConfig() 
	url := config.AuthCodeURL(oauthStateString)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	if r.FormValue("state") != oauthStateString {
		http.Error(w, "State inválido.", http.StatusUnauthorized)
		return
	}

	config := getOauthConfig()

	token, err := config.Exchange(context.Background(), r.FormValue("code"))
	if err != nil {
		log.Printf("Erro ao trocar código por token: %v", err)
		http.Error(w, "Falha na autenticação.", http.StatusInternalServerError)
		return
	}

	response, err := http.Get(googleUserInfoAPI + "?access_token=" + token.AccessToken)
	if err != nil {
		http.Error(w, "Falha ao obter info do usuário.", http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	userData, _ := io.ReadAll(response.Body)
	var userInfo GoogleUserInfo
	if err := json.Unmarshal(userData, &userInfo); err != nil {
		http.Error(w, "Falha ao decodificar info do usuário.", http.StatusInternalServerError)
		return
	}

	user, err := data.GetOrCreateUser(userInfo.ID, userInfo.Email, userInfo.Name)
	if err != nil {
		log.Printf("Erro ao salvar/buscar usuário no DB: %v", err)
		http.Error(w, "Falha no DB.", http.StatusInternalServerError)
		return
	}

	jwtToken, err := generateJWTToken(user.ID)
	if err != nil {
		http.Error(w, "Falha ao gerar token de sessão.", http.StatusInternalServerError)
		return
	}

	redirectURL := fmt.Sprintf("http://localhost:3000/?token=%s", jwtToken)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}