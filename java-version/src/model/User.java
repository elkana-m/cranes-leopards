package model;

import java.time.LocalDateTime;

public class User {
    private String id;
    private String name;
    private String email;
    private LocalDateTime createdAt;

    public User(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = LocalDateTime.now();
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }

    @Override
    public String toString() {
        return String.format("User[id=%s, name=%s, email=%s]", id, name, email);
    }
}
