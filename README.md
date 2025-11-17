# 🚀 Price Analyzer

A high-performance, real-time price monitoring system designed to track e-commerce product prices. Built to demonstrate **Event-Driven Architecture**, **Concurrency patterns in Go**, and **Modern Frontend practices**.



## 🏗️ Architecture

This project follows a Microservices-ready approach within a Monorepo structure.

* **Backend:** Go (Golang) for high-concurrency scraping and API management.
* **Frontend:** Next.js (React) + Tailwind CSS + Shadcn/UI for a responsive, dark-mode dashboard.
* **Data & Caching:** PostgreSQL for persistence, Redis for high-speed caching.
* **Infrastructure:** Fully dockerized environment with Docker Compose.

## 🛠️ Tech Stack

* **Core:** Go 1.23+, TypeScript, React 19
* **Frameworks:** Gin/Chi (Go), Next.js (Frontend)
* **Database:** PostgreSQL, Redis
* **DevOps:** Docker, Docker Compose
* **Communication:** REST / WebSockets (Planned: gRPC & Kafka)

## ⚡ Key Features

* ✅ **Real-time Updates:** Price changes are pushed instantly to the client.
* ✅ **Concurrent Scraping:** Utilizes Go routines and channels to scrape multiple sources efficiently.
* ✅ **Resilient Architecture:** Designed to handle failures gracefully.
* ✅ **Modern UI:** Clean, accessible, and responsive interface.

## 🚀 Getting Started

Prerequisites: **Docker** and **Docker Compose**.

1. **Clone the repository**
   ```bash
   git clone https://github.com/BrunoMoises/price-analyzer.git
   cd price-analyzer
   ```

2. **Start the Application**

Run the entire stack (Database, Backend, Frontend) with a single command:

   ```bash
   cd infra
   docker-compose up -d
   ```

3. **Access the Dashboard**

Open http://localhost:3000 in your browser.

## 📂 Project Structure

   ```bash
   .
   ├── backend/    # Go API Gateway and Services
   ├── frontend/   # Next.js Application
   └── infra/      # Docker and Configuration files
   ```

## 📝 License

This project is licensed under the MIT License.