package data

import (
	"embed"
	"errors"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

var migrationFS embed.FS

func RunMigrations(migrationFiles embed.FS, dbURL string) {
	sourceDriver, err := iofs.New(migrationFS, "migrations_files")
	if err != nil {
		log.Fatal("Erro ao criar driver de migração:", err)
	}

	m, err := migrate.NewWithSourceInstance("iofs", sourceDriver, dbURL)
	if err != nil {
		log.Fatal("Erro ao inicializar migração:", err)
	}

	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatal("Erro ao rodar migrações:", err)
	}

	log.Println("✅ Migrações do Banco de Dados aplicadas com sucesso!")
}