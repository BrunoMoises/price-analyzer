package data

import (
	"errors"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(dbURL string) {
	if _, err := os.Stat("./migrations"); os.IsNotExist(err) {
		log.Fatal("❌ Erro fatal: Pasta ./migrations não encontrada no container!")
	}

	m, err := migrate.New("file://migrations", dbURL)
	if err != nil {
		log.Fatal("Erro ao inicializar migração:", err)
	}

	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatal("Erro ao rodar migrações:", err)
	}

	log.Println("✅ Migrações do Banco de Dados aplicadas com sucesso!")
}
