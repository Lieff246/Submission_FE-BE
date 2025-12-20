package models

import "time"

// Tag struct untuk label/kategori catatan
type Tag struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	NoteCount int       `json:"note_count"`
}
