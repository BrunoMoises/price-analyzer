package data

import (
	"embed"
	"errors"
	"io/fs"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

var migrationFS embed.FS

func RunMigrations(dbURL string) {
	log.Println("📂 DEBUG: Listando raiz do Embed...")
	rootEntries, _ := migrationFS.ReadDir(".")
	for _, e := range rootEntries {
		log.Println("   - [Raiz]", e.Name(), "(Dir?)", e.IsDir())
		
		if e.IsDir() && e.Name() == "migrations_files" {
			subEntries, _ := migrationFS.ReadDir("migrations_files")
			for _, sub := range subEntries {
				log.Println("     -> [Dentro]", sub.Name())
			}
		}
	}

	subFS, err := fs.Sub(migrationFS, "migrations_files")
	if err != nil {
		log.Fatal("❌ Erro ao criar Sub-FS:", err)
	}

	sourceDriver, err := iofs.New(subFS, ".")
	if err != nil {
		log.Fatal("❌ Erro ao criar driver iofs:", err)
	}

	m, err := migrate.NewWithSourceInstance("iofs", sourceDriver, dbURL)
	if err != nil {
		log.Fatal("❌ Erro ao inicializar instância de migração:", err)
	}

	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatal("❌ Erro ao rodar migrações:", err)
	}

	log.Println("✅ Migrações do Banco de Dados aplicadas com sucesso!")
}