package model;

import java.time.LocalDateTime;

public class Task {
    private String id;
    private String title;
    private String description;
    private String category;
    private String assignedUserId;
    private String status; // pending | completed
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Task(String id, String title, String description, String category, String assignedUserId, String status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.assignedUserId = assignedUserId;
        this.status = status != null ? status : "pending";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getAssignedUserId() { return assignedUserId; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setTitle(String title) {
        this.title = title;
        this.updatedAt = LocalDateTime.now();
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void setCategory(String category) {
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return String.format("Task[id=%s, title=%s, category=%s, userId=%s, status=%s]",
                id, title, category, assignedUserId, status);
    }
}
