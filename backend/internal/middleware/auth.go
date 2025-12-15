package middleware

import (
	"context"
	"net/http"
	"notes-api/internal/utils"
	"strings"
)

// Key untuk menyimpan user ID di context
type contextKey string

const UserIDKey contextKey = "userID"

// Auth middleware untuk validasi JWT token
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Ambil token dari header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.WriteError(w, http.StatusUnauthorized, "Token tidak ditemukan")
			return
		}

		// Format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.WriteError(w, http.StatusUnauthorized, "Format token salah")
			return
		}

		tokenString := parts[1]

		// Validasi token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			utils.WriteError(w, http.StatusUnauthorized, "Token tidak valid")
			return
		}

		// Simpan user ID ke context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)

		// Lanjut ke handler berikutnya
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserID mengambil user ID dari context
func GetUserID(r *http.Request) int {
	userID, ok := r.Context().Value(UserIDKey).(int)
	if !ok {
		return 0
	}
	return userID
}
