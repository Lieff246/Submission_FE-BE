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

// GetFolders mengambil semua folder milik user
func GetFolders(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	query := "SELECT id, user_id, name, created_at FROM folders WHERE user_id = ? ORDER BY created_at DESC"
	rows, err := database.DB.Query(query, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengambil data folder")
		return
	}
	defer rows.Close()

	folders := []models.Folder{}
	for rows.Next() {
		var folder models.Folder
		if err := rows.Scan(&folder.ID, &folder.UserID, &folder.Name, &folder.CreatedAt); err != nil {
			continue
		}
		folders = append(folders, folder)
	}

	utils.WriteSuccess(w, "Data folder berhasil diambil", folders)
}

// CreateFolder membuat folder baru
func CreateFolder(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var folder models.Folder
	if err := json.NewDecoder(r.Body).Decode(&folder); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}

	if strings.TrimSpace(folder.Name) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Nama folder wajib diisi")
		return
	}

	query := "INSERT INTO folders (user_id, name) VALUES (?, ?)"
	result, err := database.DB.Exec(query, userID, folder.Name)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal membuat folder")
		return
	}

	folderID, _ := result.LastInsertId()
	folder.ID = int(folderID)
	folder.UserID = userID

	utils.WriteSuccess(w, "Folder berhasil dibuat", folder)
}

// UpdateFolder mengupdate nama folder
func UpdateFolder(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	folderID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	var folder models.Folder
	if err := json.NewDecoder(r.Body).Decode(&folder); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}

	if strings.TrimSpace(folder.Name) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Nama folder wajib diisi")
		return
	}

	query := "UPDATE folders SET name = ? WHERE id = ? AND user_id = ?"
	result, err := database.DB.Exec(query, folder.Name, folderID, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal mengupdate folder")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WriteError(w, http.StatusNotFound, "Folder tidak ditemukan")
		return
	}

	utils.WriteSuccess(w, "Folder berhasil diupdate", nil)
}

// DeleteFolder menghapus folder
func DeleteFolder(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	folderID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	query := "DELETE FROM folders WHERE id = ? AND user_id = ?"
	result, err := database.DB.Exec(query, folderID, userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Gagal menghapus folder")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WriteError(w, http.StatusNotFound, "Folder tidak ditemukan")
		return
	}

	utils.WriteSuccess(w, "Folder berhasil dihapus", nil)
}
