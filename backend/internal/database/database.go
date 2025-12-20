package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

// Connect membuat koneksi ke MySQL database
func Connect() error {
	// Coba gunakan DATABASE_URL dulu (Railway auto-inject)
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL != "" {
		var err error
		DB, err = sql.Open("mysql", databaseURL)
		if err != nil {
			return fmt.Errorf("error membuka koneksi database: %v", err)
		}
		if err = DB.Ping(); err != nil {
			return fmt.Errorf("error ping database: %v", err)
		}
		log.Println("✅ Koneksi database MySQL berhasil (DATABASE_URL)")
		return nil
	}

	// Fallback ke manual config
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	// Format connection string untuk MySQL
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	// Buka koneksi ke database
	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("error membuka koneksi database: %v", err)
	}

	// Test koneksi
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("error ping database: %v", err)
	}

	log.Println("✅ Koneksi database MySQL berhasil")
	return nil
}

// Close menutup koneksi database
func Close() {
	if DB != nil {
		DB.Close()
		log.Println("Koneksi database ditutup")
	}
}
