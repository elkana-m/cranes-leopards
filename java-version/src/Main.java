import model.Task;
import model.User;
import service.ToDoListManager;
import util.TaskThread;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Collaborative To-Do List Application (Java Version) ===");

        ToDoListManager manager = new ToDoListManager();

        // --- Add Users ---
        User alice = manager.addUser("Alice", "alice@example.com");
        User bob = manager.addUser("Bob", "bob@example.com");

        // --- Add Tasks ---
        manager.addTask("Learn JavaScript", "Study async/await patterns", "Learning", alice.getId());
        manager.addTask("Build Project", "Create a todo app", "Development", bob.getId());
        manager.addTask("Review Code", "Check for bugs", "Review", bob.getId());

        // --- Start Background Thread ---
        TaskThread thread = new TaskThread(manager);
        thread.start();

        // --- Simulate few updates ---
        try {
            Thread.sleep(5000); // wait 5 secs
            manager.updateTaskStatus(manager.getAllTasks().get(0).getId(), "in-progress");
            Thread.sleep(5000);
            manager.updateTaskStatus(manager.getAllTasks().get(1).getId(), "completed");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // --- Stop Thread and show Summary ---
        thread.stopThread();
        System.out.println("\nFinal Summary:");
        manager.showSummary();
    }
}
