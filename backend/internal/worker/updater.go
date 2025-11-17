package worker

import (
	"log"
	"time"

	"price-analyzer-backend/internal/data"
	"price-analyzer-backend/internal/web"
)

func StartPriceMonitor() {
	go func() {
		for {
			log.Println("🕵️ Worker: Iniciando verificação de preços...")
			
			products, err := data.GetAllProducts()
			if err != nil {
				log.Println("❌ Erro ao buscar produtos para atualizar:", err)
				time.Sleep(10 * time.Minute)
				continue
			}

			for _, p := range products {
				time.Sleep(5 * time.Second)

				log.Printf("Atualizando: %s...", p.Name)
				_, _, currentPrice, err := web.ScrapeProduct(p.URL)
				if err != nil {
					log.Printf("Erro ao atualizar %s: %v", p.Name, err)
					continue
				}
				if currentPrice > 0 {
					err := data.UpdatePrice(p.ID, currentPrice)
					if err != nil {
						log.Println("Erro ao salvar novo preço:", err)
					}
				}
			}

			log.Println("✅ Worker: Ciclo finalizado. Dormindo...")
			
			time.Sleep(time.Minute * 5) 
		}
	}()
}