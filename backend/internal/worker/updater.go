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
			
			products, err := data.GetAllProducts()
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
							
							err := notifier.SendTelegram(msg)
							if err == nil {
								log.Printf("🔔 Notificação enviada para %s", p.Name)
								data.UpdateLastAlert(p.ID) 
							} else {
								log.Printf("❌ Falha ao enviar Telegram: %v", err)
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