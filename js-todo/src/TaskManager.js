import { User } from './User.js';
import { Task } from './Task.js';
import { ConcurrencyManager } from './ConcurrencyManager.js';

export class TaskManager {
  constructor() {
    this.concurrencyManager = new ConcurrencyManager();
  }

  // User Management Methods
  async createUser(name, email) {
    try {
      return await this.concurrencyManager.atomicCreateUser(name, email);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async getUserByName(name) {
    try {
      return await User.findByName(name);
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async listUsers() {
    try {
      return await User.listAll();
    } catch (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      return await this.concurrencyManager.atomicDeleteUser(id);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async updateUser(id, updates) {
    try {
      return await User.update(id, updates);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Task Management Methods
  async createTask(title, description, category, assignedUserId) {
    try {
      return await this.concurrencyManager.atomicCreateTask(title, description, category, assignedUserId);
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async getTaskById(id) {
    try {
      return await Task.findById(id);
    } catch (error) {
      throw new Error(`Failed to get task: ${error.message}`);
    }
  }

  async listTasks() {
    try {
      return await Task.listAll();
    } catch (error) {
      throw new Error(`Failed to list tasks: ${error.message}`);
    }
  }

  async listTasksByUser(userId) {
    try {
      return await Task.listByUser(userId);
    } catch (error) {
      throw new Error(`Failed to list tasks by user: ${error.message}`);
    }
  }

  async listTasksByCategory(category) {
    try {
      return await Task.listByCategory(category);
    } catch (error) {
      throw new Error(`Failed to list tasks by category: ${error.message}`);
    }
  }

  async listTasksByStatus(status) {
    try {
      return await Task.listByStatus(status);
    } catch (error) {
      throw new Error(`Failed to list tasks by status: ${error.message}`);
    }
  }

  async updateTask(id, updates) {
    try {
      return await this.concurrencyManager.atomicUpdateTask(id, updates);
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async deleteTask(id) {
    try {
      return await this.concurrencyManager.atomicDeleteTask(id);
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async markTaskCompleted(id) {
    try {
      return await this.updateTask(id, { status: 'completed' });
    } catch (error) {
      throw new Error(`Failed to mark task as completed: ${error.message}`);
    }
  }

  async markTaskPending(id) {
    try {
      return await this.updateTask(id, { status: 'pending' });
    } catch (error) {
      throw new Error(`Failed to mark task as pending: ${error.message}`);
    }
  }

  async assignTaskToUser(taskId, userId) {
    try {
      return await this.updateTask(taskId, { assignedUserId: userId });
    } catch (error) {
      throw new Error(`Failed to assign task to user: ${error.message}`);
    }
  }

  // Advanced Query Methods
  async searchTasks(query) {
    try {
      const allTasks = await this.listTasks();
      const searchTerm = query.toLowerCase();
      
      return allTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.category.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      throw new Error(`Failed to search tasks: ${error.message}`);
    }
  }

  async getTasksByDateRange(startDate, endDate) {
    try {
      const allTasks = await this.listTasks();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return allTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    } catch (error) {
      throw new Error(`Failed to get tasks by date range: ${error.message}`);
    }
  }

  async getTaskStatistics() {
    try {
      return await Task.getStats();
    } catch (error) {
      throw new Error(`Failed to get task statistics: ${error.message}`);
    }
  }

  async getUserTaskStatistics(userId) {
    try {
      const userTasks = await this.listTasksByUser(userId);
      
      return {
        total: userTasks.length,
        pending: userTasks.filter(task => task.status === 'pending').length,
        completed: userTasks.filter(task => task.status === 'completed').length,
        categories: [...new Set(userTasks.map(task => task.category))]
      };
    } catch (error) {
      throw new Error(`Failed to get user task statistics: ${error.message}`);
    }
  }

  // Bulk Operations
  async bulkCreateTasks(tasks) {
    try {
      const results = [];
      for (const task of tasks) {
        const result = await this.createTask(
          task.title,
          task.description,
          task.category,
          task.assignedUserId
        );
        results.push(result);
      }
      return results;
    } catch (error) {
      throw new Error(`Failed to bulk create tasks: ${error.message}`);
    }
  }

  async bulkUpdateTasks(updates) {
    try {
      const results = [];
      for (const update of updates) {
        const result = await this.updateTask(update.id, update.updates);
        results.push(result);
      }
      return results;
    } catch (error) {
      throw new Error(`Failed to bulk update tasks: ${error.message}`);
    }
  }

  async bulkDeleteTasks(taskIds) {
    try {
      const results = [];
      for (const id of taskIds) {
        const result = await this.deleteTask(id);
        results.push(result);
      }
      return results;
    } catch (error) {
      throw new Error(`Failed to bulk delete tasks: ${error.message}`);
    }
  }

  // Data Export/Import
  async exportData() {
    try {
      return await this.concurrencyManager.atomicGetAllData();
    } catch (error) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  async importData(data) {
    try {
      const dataPath = require('path').join(process.cwd(), 'data', 'tasks.json');
      await this.concurrencyManager.atomicWrite(dataPath, data);
      return true;
    } catch (error) {
      throw new Error(`Failed to import data: ${error.message}`);
    }
  }

  // Utility Methods
  async validateUserExists(userId) {
    try {
      const user = await this.getUserById(userId);
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  async validateTaskExists(taskId) {
    try {
      const task = await this.getTaskById(taskId);
      return task !== null;
    } catch (error) {
      return false;
    }
  }

  async getConcurrencyStatus() {
    return this.concurrencyManager.getLockStatus();
  }

  async cleanup() {
    this.concurrencyManager.cleanupLocks();
  }
}

