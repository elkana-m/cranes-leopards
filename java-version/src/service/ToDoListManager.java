package service;

import model.Task;
import model.User;

import java.util.*;
import java.time.LocalDateTime;

public class ToDoListManager {

    private List<User> users = new ArrayList<>();
    private List<Task> tasks = new ArrayList<>();

    // ----- USER OPERATIONS ----

    public User addUser(String name, String email) {
        User user = new User(name, email);
        users.add(user);
        return user;
    }

    public List<User> getAllUsers() {
        return users;
    }

    public User getUserById(String userId) {
        for (User u : users) {
            if (u.getId().equals(userId)) {
                return u;
            }
        }
        return null;
    }

    // ---- TASK OPERATIONS -----

    public Task addTask(String title, String description, String category, String assignedUserId) {
        Task task = new Task(title, description, category, assignedUserId);
        tasks.add(task);
        return task;
    }

    public List<Task> getAllTasks() {
        return tasks;
    }

    public List<Task> getTasksByUser(String userId) {
        List<Task> userTasks = new ArrayList<>();
        for (Task t : tasks) {
            if (t.getAssignedUserId().equals(userId)) {
                userTasks.add(t);
            }
        }
        return userTasks;
    }

    public boolean updateTaskStatus(String taskId, String newStatus) {
        for (Task t : tasks) {
            if (t.getId().equals(taskId)) {
                t.setStatus(newStatus);
                t.setUpdatedAt(LocalDateTime.now());
                return true;
            }
        }
        return false;
    }

    public boolean deleteTask(String taskId) {
        return tasks.removeIf(t -> t.getId().equals(taskId));
    }

    public void showSummary() {
        System.out.println("\n--- USERS ---");
        for (User u : users) {
            System.out.println(u);
        }

        System.out.println("\n--- TASKS ---");
        for (Task t : tasks) {
            System.out.println(t);
        }
    }
}
