package models

import "time"

// Note struct untuk representasi catatan
type Note struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	FolderID   *int      `json:"folder_id"` // pointer karena bisa NULL
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	IsFavorite bool      `json:"is_favorite"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// NoteWithTags untuk note yang sudah include tags-nya
type NoteWithTags struct {
	Note
	Tags []Tag `json:"tags"`
}
