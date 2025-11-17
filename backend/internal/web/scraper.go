package web

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func ScrapeProduct(url string) (string, string, float64, error) {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr, Timeout: 15 * time.Second}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", "", 0, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("Referer", "https://www.google.com/")
	req.Header.Set("Upgrade-Insecure-Requests", "1")

	res, err := client.Do(req)
	if err != nil {
		return "", "", 0, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return "", "", 0, fmt.Errorf("site retornou status: %d", res.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return "", "", 0, err
	}

	image, _ := doc.Find("meta[property='og:image']").Attr("content")
	if image == "" {
		image, _ = doc.Find("meta[name='twitter:image']").Attr("content")
	}

	title, _ := doc.Find("meta[property='og:title']").Attr("content")
	if title == "" {
		title = doc.Find("title").Text()
	}
	title = strings.TrimSpace(title)

	price := 0.0
	
	metaPrice, exists := doc.Find("meta[itemprop='price']").Attr("content")
	if exists {
		if p, err := strconv.ParseFloat(metaPrice, 64); err == nil {
			price = p
		}
	}

	if price == 0 {
		if strings.Contains(url, "mercadolivre.com.br") {
			priceStr := doc.Find(".andes-money-amount__fraction").First().Text()
			price = cleanPrice(priceStr)
		} else if strings.Contains(url, "amazon.com.br") {
			priceStr := doc.Find(".a-price-whole").First().Text()
			price = cleanPrice(priceStr)
		} else if strings.Contains(url, "kabum.com.br") {
			priceStr := doc.Find(".finalPrice").First().Text()
			price = cleanPrice(priceStr)
		}
	}

	if image == "" {
		image = "https://placehold.co/600x400?text=Sem+Imagem"
	}

	if title == "" {
		title = "Produto Desconhecido"
	}

	return title, image, price, nil
}

func cleanPrice(raw string) float64 {
	if raw == "" {
		return 0.0
	}
	clean := strings.ReplaceAll(raw, ".", "")
	clean = strings.ReplaceAll(clean, ",", ".")
	
	var numberBuilder strings.Builder
	for _, r := range clean {
		if (r >= '0' && r <= '9') || r == '.' {
			numberBuilder.WriteRune(r)
		}
	}
	
	val, err := strconv.ParseFloat(numberBuilder.String(), 64)
	if err != nil {
		return 0.0
	}
	return val
}