package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func ScrapeProduct(url string) (string, string, float64, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", "", 0, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	res, err := client.Do(req)
	if err != nil {
		return "", "", 0, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return "", "", 0, errors.New("status code diferente de 200: " + res.Status)
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
			return title, image, p, nil
		}
	}

	if strings.Contains(url, "amazon.com.br") {
		priceStr := doc.Find(".a-price.a-text-price.a-size-medium .a-offscreen").First().Text() 
        if priceStr == "" {
             priceStr = doc.Find(".a-price-whole").First().Text()
        }
		price = cleanPrice(priceStr)

	} else if strings.Contains(url, "mercadolivre.com.br") {
		priceContainer := doc.Find(".ui-pdp-price__second-line .andes-money-amount__fraction").First()
		
        if priceContainer.Length() == 0 {
            priceContainer = doc.Find(".andes-money-amount__fraction").First()
        }
        
		price = cleanPrice(priceContainer.Text())

	} else if strings.Contains(url, "kabum.com.br") {
		priceStr := doc.Find(".finalPrice").First().Text()
		price = cleanPrice(priceStr)
	}

	return title, image, price, nil
}

func cleanPrice(raw string) float64 {
	if raw == "" {
		return 0.0
	}
	
    clean := strings.ReplaceAll(raw, "R$", "")
    clean = strings.ReplaceAll(clean, "$", "")
    clean = strings.TrimSpace(clean)
    
	clean = strings.ReplaceAll(clean, ".", "")
	clean = strings.ReplaceAll(clean, ",", ".")

	val, err := strconv.ParseFloat(clean, 64)
	if err != nil {
		return 0.0
	}
	return val
}