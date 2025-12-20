package handlers

import (
	"encoding/json"
	"net/http"
	"notes-api/internal/database"
	"notes-api/internal/middleware"
	"notes-api/internal/models"
	"notes-api/internal/utils"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

// GetTags mengambil semua tag milik user
func GetTags(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	query := "SELECT t.id, t.user_id, t.name, t.created_at, COUNT(nt.note_id) as note_count FROM tags t LEFT JOIN note_tags nt ON t.id = nt.tag_id AND nt.note_id IN (SELECT id FROM notes WHERE user_id = ?) WHERE t.user_id = ? GROUP BY t.id ORDER BY t.name ASC"
	rows, err := database.DB.Query(query, userID, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengambil data tag")
		return
	}
	defer rows.Close()

	tags := []models.Tag{}
	for rows.Next() {
		var tag models.Tag
		if err := rows.Scan(&tag.ID, &tag.UserID, &tag.Name, &tag.CreatedAt, &tag.NoteCount); err != nil {
			continue
		}
		tags = append(tags, tag)
	}

	utils.WriteSuccess(w, "Data tag berhasil diambil", tags)
}

// CreateTag membuat tag baru
func CreateTag(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var tag models.Tag
	if err := json.NewDecoder(r.Body).Decode(&tag); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}

	if strings.TrimSpace(tag.Name) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Nama tag wajib diisi")
		return
	}

	query := "INSERT INTO tags (user_id, name) VALUES (?, ?)"
	result, err := database.DB.Exec(query, userID, tag.Name)
	if err != nil {
		if strings.Contains(err.Error(), "Duplicate entry") {
			utils.WriteError(w, http.StatusConflict, "Tag sudah ada")
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, "Gagal membuat tag")
		return
	}

	tagID, _ := result.LastInsertId()
	tag.ID = int(tagID)
	tag.UserID = userID

	utils.WriteSuccess(w, "Tag berhasil dibuat", tag)
}

// DeleteTag menghapus tag
func DeleteTag(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	tagID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	query := "DELETE FROM tags WHERE id = ? AND user_id = ?"
	result, err := database.DB.Exec(query, tagID, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal menghapus tag")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WriteError(w, http.StatusNotFound, "Tag tidak ditemukan")
		return
	}

	utils.WriteSuccess(w, "Tag berhasil dihapus", nil)
}

// AssignTagToNote menambahkan tag ke catatan
func AssignTagToNote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	noteID, _ := strconv.Atoi(chi.URLParam(r, "noteId"))
	tagID, _ := strconv.Atoi(chi.URLParam(r, "tagId"))

	// Cek apakah note milik user
	var count int
	checkNote := "SELECT COUNT(*) FROM notes WHERE id = ? AND user_id = ?"
	database.DB.QueryRow(checkNote, noteID, userID).Scan(&count)
	if count == 0 {
		utils.WriteError(w, http.StatusNotFound, "Catatan tidak ditemukan")
		return
	}

	// Cek apakah tag milik user
	checkTag := "SELECT COUNT(*) FROM tags WHERE id = ? AND user_id = ?"
	database.DB.QueryRow(checkTag, tagID, userID).Scan(&count)
	if count == 0 {
		utils.WriteError(w, http.StatusNotFound, "Tag tidak ditemukan")
		return
	}

	// Insert relasi
	query := "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)"
	_, err := database.DB.Exec(query, noteID, tagID)
	if err != nil {
		if strings.Contains(err.Error(), "Duplicate entry") {
			utils.WriteError(w, http.StatusConflict, "Tag sudah ditambahkan ke catatan ini")
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, "Gagal menambahkan tag ke catatan")
		return
	}

	utils.WriteSuccess(w, "Tag berhasil ditambahkan ke catatan", nil)
}

// RemoveTagFromNote menghapus tag dari catatan
func RemoveTagFromNote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	noteID, _ := strconv.Atoi(chi.URLParam(r, "noteId"))
	tagID, _ := strconv.Atoi(chi.URLParam(r, "tagId"))

	// Cek apakah note milik user
	var count int
	checkNote := "SELECT COUNT(*) FROM notes WHERE id = ? AND user_id = ?"
	database.DB.QueryRow(checkNote, noteID, userID).Scan(&count)
	if count == 0 {
		utils.WriteError(w, http.StatusNotFound, "Catatan tidak ditemukan")
		return
	}

	// Hapus relasi
	query := "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?"
	result, err := database.DB.Exec(query, noteID, tagID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal menghapus tag dari catatan")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WriteError(w, http.StatusNotFound, "Tag tidak ditemukan di catatan ini")
		return
	}

	utils.WriteSuccess(w, "Tag berhasil dihapus dari catatan", nil)
}
