package worker

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"price-analyzer-backend/internal/data"
	"price-analyzer-backend/internal/notifier"
)

type TelegramUpdate struct {
	UpdateID int `json:"update_id"`
	Message  struct {
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		Text string `json:"text"`
		From struct {
			Username string `json:"username"`
		} `json:"from"`
	} `json:"message"`
}

type TelegramResponse struct {
	Ok     bool             `json:"ok"`
	Result []TelegramUpdate `json:"result"`
}

func StartTelegramListener() {
	go func() {
		offset := 0
		token := os.Getenv("TELEGRAM_TOKEN")
		if token == "" {
			log.Println("⚠️ Telegram Token não encontrado. Listener desativado.")
			return
		}

		log.Println("👂 Telegram Listener iniciado...")

		for {
			url := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=30", token, offset)
			resp, err := http.Get(url)
			
			if err != nil {
				log.Println("Erro no Telegram Listener:", err)
				time.Sleep(10 * time.Second)
				continue
			}

			var result TelegramResponse
			if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
				resp.Body.Close()
				continue
			}
			resp.Body.Close()

			for _, update := range result.Result {
				offset = update.UpdateID + 1
				
				processMessage(update)
			}
			
			time.Sleep(1 * time.Second)
		}
	}()
}

func processMessage(update TelegramUpdate) {
	text := update.Message.Text
	chatID := fmt.Sprintf("%d", update.Message.Chat.ID)

	if strings.HasPrefix(text, "/start connect_") {
		userIDStr := strings.TrimPrefix(text, "/start connect_")
		userID, err := strconv.Atoi(userIDStr)
		
		if err == nil && userID > 0 {
			err := data.UpdateUserTelegram(userID, chatID)
			
			if err == nil {
				msg := fmt.Sprintf("✅ **Pronto!** Seu Telegram foi vinculado com sucesso.\n\nVocê receberá alertas aqui.")
				notifier.SendTelegram(msg, chatID)
				log.Printf("🔗 Usuário %d vinculado ao Telegram %s", userID, chatID)
			} else {
				notifier.SendTelegram("❌ Erro ao vincular conta. Tente novamente.", chatID)
			}
		}
	}
}