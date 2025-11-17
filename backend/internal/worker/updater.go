package worker

import (
	"fmt"
	"log"
	"time"

	"price-analyzer-backend/internal/data"
	"price-analyzer-backend/internal/notifier"
	"price-analyzer-backend/internal/web"
)

func StartPriceMonitor() {
	go func() {
		for {
			log.Println("🕵️ Worker: Verificando preços...")
			
			products, err := data.GetAllProductsForWorker()
			if err != nil {
				log.Println("❌ Erro ao buscar produtos:", err)
				time.Sleep(10 * time.Minute)
				continue
			}

			for _, p := range products {
				time.Sleep(5 * time.Second)

				_, _, currentPrice, err := web.ScrapeProduct(p.URL)
				if err != nil {
					log.Printf("Erro scraping %s: %v", p.Name, err)
					continue
				}

				if currentPrice > 0 {
					data.UpdatePrice(p.ID, currentPrice)

					if p.TargetPrice > 0 && currentPrice <= p.TargetPrice {
					
						shouldNotify := !p.LastAlertAt.Valid || time.Since(p.LastAlertAt.Time) > 24*time.Hour
						
						if shouldNotify {
							msg := fmt.Sprintf("🚨 *PREÇO CAIU!*\n\n📦 *%s*\n💰 Preço Atual: R$ %.2f\n🎯 Sua Meta: R$ %.2f\n\n[Ver Produto](%s)", 
								p.Name, currentPrice, p.TargetPrice, p.URL)
							
							if p.TelegramChatID != "" {
								err := notifier.SendTelegram(msg, p.TelegramChatID) 
								if err == nil {
									log.Printf("🔔 Notificação enviada para %s (User ID: %d)", p.Name, p.UserID)
									data.UpdateLastAlert(p.ID)
								}
							} else {
								log.Printf("⚠️ Alerta ignorado para %s: Usuário %d sem Telegram configurado.", p.Name, p.UserID)
							}
						}
					}
				}
			}

			log.Println("✅ Worker: Ciclo finalizado. Dormindo...")
			time.Sleep(time.Minute * 5)
		}
	}()
}