package notifier

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
)

func SendTelegram(message string, chatID string) error {
	token := os.Getenv("TELEGRAM_TOKEN")

	if token == "" || chatID == "" {
		return fmt.Errorf("credenciais do telegram não configuradas")
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	
	params := url.Values{}
	params.Add("chat_id", chatID)
	params.Add("text", message)
	params.Add("parse_mode", "Markdown")

	resp, err := http.PostForm(apiURL, params)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("erro telegram status: %s", resp.Status)
	}

	return nil
}