package main

import (
	"log"
	"net/http"
	"notes-api/internal/database"
	"notes-api/internal/handlers"
	"notes-api/internal/middleware"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables dari .env file
	godotenv.Load()

	// Connect ke database
	if err := database.Connect(); err != nil {
		log.Fatal("Gagal koneksi database:", err)
	}
	defer database.Close()

	// Inisialisasi Chi router
	r := chi.NewRouter()

	// Middleware
	r.Use(chimiddleware.Logger)    // Log setiap request
	r.Use(chimiddleware.Recoverer) // Recover dari panic

	// CORS middleware
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"}, // Frontend URL
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Routes tanpa auth
	r.Post("/api/register", handlers.Register)
	r.Post("/api/login", handlers.Login)

	// Routes dengan auth (protected)
	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth) // Semua route di grup ini butuh JWT token

		// Folders
		r.Get("/api/folders", handlers.GetFolders)
		r.Post("/api/folders", handlers.CreateFolder)
		r.Put("/api/folders/{id}", handlers.UpdateFolder)
		r.Delete("/api/folders/{id}", handlers.DeleteFolder)

		// Notes
		r.Get("/api/notes", handlers.GetNotes)
		r.Get("/api/notes/{id}", handlers.GetNoteByID)
		r.Get("/api/folders/{id}/notes", handlers.GetNotesByFolder)
		r.Post("/api/notes", handlers.CreateNote)
		r.Put("/api/notes/{id}", handlers.UpdateNote)
		r.Delete("/api/notes/{id}", handlers.DeleteNote)

		// Tags
		r.Get("/api/tags", handlers.GetTags)
		r.Get("/api/tags/{id}/notes", handlers.GetNotesByTag)
		r.Post("/api/tags", handlers.CreateTag)
		r.Delete("/api/tags/{id}", handlers.DeleteTag)

		// Tag assignment
		r.Post("/api/notes/{noteId}/tags/{tagId}", handlers.AssignTagToNote)
		r.Delete("/api/notes/{noteId}/tags/{tagId}", handlers.RemoveTagFromNote)
	})

	// Health check
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Notes API is running!"))
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server berjalan di http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
