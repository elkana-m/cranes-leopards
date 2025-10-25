package model;

public class Task {
    private int id;
    private String title;
    private String category;
    private String status; // Pending, In_Progress, Completed
    private String assignedUser;

    public Task(int id, String title, String category, String assignedUser) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.assignedUser = assignedUser;
        this.status = "Pending"; // default status
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public String getStatus() {
        return status;
    }

    public String getAssignedUser() {
        return assignedUser;
    }

    // Setters
    public void setTitle(String title) {
        this.title = title;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Display task summary
    @Override
    public String toString() {
        return String.format("[ID: %d] %s | Category: %s | Status: %s | User: %s",
                id, title, category, status, assignedUser);
    }
}
