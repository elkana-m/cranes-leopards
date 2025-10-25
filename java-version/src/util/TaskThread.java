package util;

import service.ToDoListManager;

public class TaskThread extends Thread {

    private ToDoListManager manager;
    private boolean running = true;

    public TaskThread(ToDoListManager manager) {
        this.manager = manager;
    }

    @Override
    public void run() {
        while (running) {
            try {
                Thread.sleep(3000); // every 3 secconds
                System.out.println("\n[Background Thread] Checking task statuses...");
                manager.getAllTasks().forEach(task -> {
                    System.out.println(" - " + task.getTitle() + " [" + task.getStatus() + "]");
                });
            } catch (InterruptedException e) {
                System.out.println("Background thread interrupted.");
                running = false;
            }
        }
    }

    public void stopThread() {
        running = false;
        this.interrupt();
    }
}
