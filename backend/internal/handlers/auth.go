package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"notes-api/internal/database"
	"notes-api/internal/models"
	"notes-api/internal/utils"
	"strings"
)

// Daftar domain email yang diizinkan
var allowedEmailDomains = map[string]bool{
	"gmail.com":   true,
	"yahoo.com":   true,
	"hotmail.com": true,
	"outlook.com": true,
	"icloud.com":  true,
	"yahoo.co.id": true,
	"live.com":    true,
	"aol.com":     true,
}

// isValidEmailDomain memeriksa apakah domain email diizinkan
func isValidEmailDomain(email string) bool {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}
	domain := strings.ToLower(parts[1])
	return allowedEmailDomains[domain]
}

// Register handler untuk registrasi user baru
func Register(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}

	// Validasi input
	if strings.TrimSpace(req.Username) == "" || strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Password) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Username, email, dan password wajib diisi")
		return
	}

	// Validasi domain email
	if !isValidEmailDomain(req.Email) {
		utils.WriteError(w, http.StatusBadRequest, "Email harus menggunakan domain yang diizinkan (@gmail.com, @yahoo.com, dll.)")
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal memproses password")
		return
	}

	// Insert ke database
	query := "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)"
	result, err := database.DB.Exec(query, req.Username, req.Email, hashedPassword, req.FullName)
	if err != nil {
		// Cek error duplicate entry (unique constraint)
		if strings.Contains(err.Error(), "Duplicate entry") {
			utils.WriteError(w, http.StatusConflict, "Username atau email sudah digunakan")
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, "Gagal membuat user")
		return
	}

	// Ambil ID user yang baru dibuat
	userID, _ := result.LastInsertId()

	// Return success
	utils.WriteSuccess(w, "Registrasi berhasil", map[string]interface{}{
		"id":       userID,
		"username": req.Username,
		"email":    req.Email,
	})
}

// Login handler untuk login user
func Login(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}

	// Validasi input
	if strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Password) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Email dan password wajib diisi")
		return
	}

	// Validasi domain email
	if !isValidEmailDomain(req.Email) {
		utils.WriteError(w, http.StatusBadRequest, "Email harus menggunakan domain yang diizinkan (@gmail.com, @yahoo.com, dll.)")
		return
	}

	// Cari user di database
	var user models.User
	query := "SELECT id, username, email, password_hash, full_name, created_at FROM users WHERE email = ?"
	err := database.DB.QueryRow(query, req.Email).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.FullName, &user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		utils.WriteError(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengambil data user")
		return
	}

	// Cek password
	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		utils.WriteError(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal membuat token")
		return
	}

	// Return token dan data user
	utils.WriteSuccess(w, "Login berhasil", models.LoginResponse{
		Token: token,
		User:  user,
	})
}
