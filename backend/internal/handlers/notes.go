package handlers

import (
	"database/sql"
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

// GetNotes mengambil semua catatan milik user
func GetNotes(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	// Optional: filter by folder_id atau is_favorite
	folderID := r.URL.Query().Get("folder_id")
	favorite := r.URL.Query().Get("favorite")
	search := r.URL.Query().Get("search")

	query := "SELECT n.id, n.user_id, n.folder_id, f.name as folder_name, n.title, n.content, n.is_favorite, n.created_at, n.updated_at FROM notes n LEFT JOIN folders f ON n.folder_id = f.id AND f.user_id = n.user_id WHERE n.user_id = ?"
	args := []interface{}{userID}

	if folderID != "" {
		query += " AND folder_id = ?"
		args = append(args, folderID)
	}

	if favorite == "true" {
		query += " AND is_favorite = true"
	}

	if search != "" {
		query += " AND (title LIKE ? OR content LIKE ?)"
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern)
	}

	query += " ORDER BY created_at DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengambil data catatan")
		return
	}
	defer rows.Close()

	notes := []models.Note{}
	for rows.Next() {
		var note models.Note
		var folderID sql.NullInt64
		var folderName sql.NullString
		err := rows.Scan(&note.ID, &note.UserID, &folderID, &folderName, &note.Title, &note.Content, &note.IsFavorite, &note.CreatedAt, &note.UpdatedAt)
		if err != nil {
			continue
		}

		if folderID.Valid {
			fid := int(folderID.Int64)
			note.FolderID = &fid
		}
		if folderName.Valid {
			note.FolderName = folderName.String
		}

		// Ambil tags untuk note ini
		tags, err := getTagsForNote(note.ID, userID)
		if err == nil {
			note.Tags = tags
		}

		notes = append(notes, note)
	}

	utils.WriteSuccess(w, "Data catatan berhasil diambil", notes)
}

// GetNoteByID mengambil detail satu catatan
func GetNoteByID(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	noteID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	var note models.Note
	var folderID sql.NullInt64

	query := "SELECT id, user_id, folder_id, title, content, is_favorite, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?"
	err := database.DB.QueryRow(query, noteID, userID).Scan(&note.ID, &note.UserID, &folderID, &note.Title, &note.Content, &note.IsFavorite, &note.CreatedAt, &note.UpdatedAt)

	if err == sql.ErrNoRows {
		utils.WriteError(w, http.StatusNotFound, "Catatan tidak ditemukan")
		return
	}
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengambil data catatan")
		return
	}

	if folderID.Valid {
		fid := int(folderID.Int64)
		note.FolderID = &fid
	}

	// Ambil tags untuk note ini
	tags, err := getTagsForNote(noteID, userID)
	if err == nil {
		note.Tags = tags
	}

	utils.WriteSuccess(w, "Data catatan berhasil diambil", note)
}

// GetNotesByFolder mengambil semua catatan dalam folder tertentu
func GetNotesByFolder(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	folderID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	// Verifikasi bahwa folder milik user
	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM folders WHERE id = ? AND user_id = ?", folderID, userID).Scan(&count)
	if err != nil || count == 0 {
		utils.WriteError(w, http.StatusNotFound, "Folder tidak ditemukan")
		return
	}

	// Ambil catatan dalam folder
	query := "SELECT n.id, n.user_id, n.folder_id, f.name as folder_name, n.title, n.content, n.is_favorite, n.created_at, n.updated_at FROM notes n LEFT JOIN folders f ON n.folder_id = f.id AND f.user_id = n.user_id WHERE n.user_id = ? AND n.folder_id = ? ORDER BY n.created_at DESC"
	rows, err := database.DB.Query(query, userID, folderID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengambil data catatan")
		return
	}
	defer rows.Close()

	notes := []models.Note{}
	for rows.Next() {
		var note models.Note
		var folderID sql.NullInt64
		var folderName sql.NullString
		err := rows.Scan(&note.ID, &note.UserID, &folderID, &folderName, &note.Title, &note.Content, &note.IsFavorite, &note.CreatedAt, &note.UpdatedAt)
		if err != nil {
			continue
		}

		if folderID.Valid {
			fid := int(folderID.Int64)
			note.FolderID = &fid
		}
		if folderName.Valid {
			note.FolderName = folderName.String
		}

		// Ambil tags untuk note ini
		tags, err := getTagsForNote(note.ID, userID)
		if err == nil {
			note.Tags = tags
		}

		notes = append(notes, note)
	}

	utils.WriteSuccess(w, "Data catatan berhasil diambil", notes)
}

// GetNotesByTag mengambil semua catatan yang memiliki tag tertentu
func GetNotesByTag(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	tagID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	// Cek apakah tag milik user
	var count int
	checkTag := "SELECT COUNT(*) FROM tags WHERE id = ? AND user_id = ?"
	database.DB.QueryRow(checkTag, tagID, userID).Scan(&count)
	if count == 0 {
		utils.WriteError(w, http.StatusNotFound, "Tag tidak ditemukan")
		return
	}

	// Query notes yang memiliki tag ini
	query := `
		SELECT DISTINCT n.id, n.user_id, n.folder_id, f.name as folder_name, n.title, n.content, n.is_favorite, n.created_at, n.updated_at 
		FROM notes n 
		LEFT JOIN folders f ON n.folder_id = f.id AND f.user_id = n.user_id
		INNER JOIN note_tags nt ON n.id = nt.note_id 
		WHERE nt.tag_id = ? AND n.user_id = ?
		ORDER BY n.created_at DESC
	`

	rows, err := database.DB.Query(query, tagID, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengambil data catatan")
		return
	}
	defer rows.Close()

	notes := []models.Note{}
	for rows.Next() {
		var note models.Note
		var folderID sql.NullInt64
		var folderName sql.NullString
		err := rows.Scan(&note.ID, &note.UserID, &folderID, &folderName, &note.Title, &note.Content, &note.IsFavorite, &note.CreatedAt, &note.UpdatedAt)
		if err != nil {
			continue
		}

		if folderID.Valid {
			fid := int(folderID.Int64)
			note.FolderID = &fid
		}
		if folderName.Valid {
			note.FolderName = folderName.String
		}

		// Ambil tags untuk note ini
		tags, err := getTagsForNote(note.ID, userID)
		if err == nil {
			note.Tags = tags
		}

		notes = append(notes, note)
	}

	utils.WriteSuccess(w, "Data catatan berhasil diambil", notes)
}

// CreateNote membuat catatan baru
func CreateNote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var note models.Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}

	if strings.TrimSpace(note.Title) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Judul catatan wajib diisi")
		return
	}

	query := "INSERT INTO notes (user_id, folder_id, title, content, is_favorite) VALUES (?, ?, ?, ?, ?)"
	result, err := database.DB.Exec(query, userID, note.FolderID, note.Title, note.Content, note.IsFavorite)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal membuat catatan")
		return
	}

	noteID, _ := result.LastInsertId()
	note.ID = int(noteID)
	note.UserID = userID

	utils.WriteSuccess(w, "Catatan berhasil dibuat", note)
}

// UpdateNote mengupdate catatan
func UpdateNote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	noteID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	var note models.Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}

	if strings.TrimSpace(note.Title) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Judul catatan wajib diisi")
		return
	}

	query := "UPDATE notes SET folder_id = ?, title = ?, content = ?, is_favorite = ? WHERE id = ? AND user_id = ?"
	result, err := database.DB.Exec(query, note.FolderID, note.Title, note.Content, note.IsFavorite, noteID, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengupdate catatan")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WriteError(w, http.StatusNotFound, "Catatan tidak ditemukan")
		return
	}

	utils.WriteSuccess(w, "Catatan berhasil diupdate", nil)
}

// DeleteNote menghapus catatan
func DeleteNote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	noteID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	query := "DELETE FROM notes WHERE id = ? AND user_id = ?"
	result, err := database.DB.Exec(query, noteID, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal menghapus catatan")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WriteError(w, http.StatusNotFound, "Catatan tidak ditemukan")
		return
	}

	utils.WriteSuccess(w, "Catatan berhasil dihapus", nil)
}

// getTagsForNote helper function untuk mengambil tags dari sebuah note
func getTagsForNote(noteID, userID int) ([]models.Tag, error) {
	query := `
		SELECT t.id, t.user_id, t.name, t.created_at 
		FROM tags t 
		INNER JOIN note_tags nt ON t.id = nt.tag_id 
		WHERE nt.note_id = ? AND t.user_id = ?
		ORDER BY t.name ASC
	`

	rows, err := database.DB.Query(query, noteID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []models.Tag{}
	for rows.Next() {
		var tag models.Tag
		if err := rows.Scan(&tag.ID, &tag.UserID, &tag.Name, &tag.CreatedAt); err != nil {
			continue
		}
		tags = append(tags, tag)
	}

	return tags, nil
}
