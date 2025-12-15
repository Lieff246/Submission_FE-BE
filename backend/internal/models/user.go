package models

import "time"

// User struct untuk representasi data user
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // tidak di-return ke client
	FullName     string    `json:"full_name"`
	CreatedAt    time.Time `json:"created_at"`
}

// RegisterRequest untuk data registrasi user baru
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

// LoginRequest untuk data login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse untuk response setelah login berhasil
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
