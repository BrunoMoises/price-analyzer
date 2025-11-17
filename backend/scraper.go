package main

import (
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func ScrapeProduct(url string) (string, string, float64, error) {
	res, err := http.Get(url)
	if err != nil {
		return "", "", 0, err
	}
	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return "", "", 0, err
	}

	image, exists := doc.Find("meta[property='og:image']").Attr("content")
	if !exists {
		image, _ = doc.Find("meta[name='twitter:image']").Attr("content")
	}

	title, _ := doc.Find("meta[property='og:title']").Attr("content")
	if title == "" {
		title = doc.Find("title").Text()
	}

	title = strings.TrimSpace(title)

	price := 0.0

	return title, image, price, nil
}