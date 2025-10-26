import fs from 'fs/promises';
import path from 'path';

export class Task {
  constructor(id, title, description, category, assignedUserId, status = 'pending') {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.assignedUserId = assignedUserId;
    this.status = status; // 'pending' or 'completed'
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Static method to create a new task
  static async create(title, description, category, assignedUserId) {
    try {
      const data = await this.loadData();
      const id = this.generateId();
      const task = new Task(id, title, description, category, assignedUserId);
      
      data.tasks.push(task);
      await this.saveData(data);
      
      return task;
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  // Static method to find task by ID
  static async findById(id) {
    try {
      const data = await this.loadData();
      return data.tasks.find(task => task.id === id) || null;
    } catch (error) {
      throw new Error(`Failed to find task: ${error.message}`);
    }
  }

  // Static method to list all tasks
  static async listAll() {
    try {
      const data = await this.loadData();
      return data.tasks;
    } catch (error) {
      throw new Error(`Failed to list tasks: ${error.message}`);
    }
  }

  // Static method to list tasks by user
  static async listByUser(userId) {
    try {
      const data = await this.loadData();
      return data.tasks.filter(task => task.assignedUserId === userId);
    } catch (error) {
      throw new Error(`Failed to list tasks by user: ${error.message}`);
    }
  }

  // Static method to list tasks by category
  static async listByCategory(category) {
    try {
      const data = await this.loadData();
      return data.tasks.filter(task => task.category === category);
    } catch (error) {
      throw new Error(`Failed to list tasks by category: ${error.message}`);
    }
  }

  // Static method to list tasks by status
  static async listByStatus(status) {
    try {
      const data = await this.loadData();
      return data.tasks.filter(task => task.status === status);
    } catch (error) {
      throw new Error(`Failed to list tasks by status: ${error.message}`);
    }
  }

  // Static method to delete task
  static async delete(id) {
    try {
      const data = await this.loadData();
      const taskIndex = data.tasks.findIndex(task => task.id === id);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      data.tasks.splice(taskIndex, 1);
      await this.saveData(data);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  // Static method to update task
  static async update(id, updates) {
    try {
      const data = await this.loadData();
      const taskIndex = data.tasks.findIndex(task => task.id === id);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      // Update task properties
      if (updates.title) data.tasks[taskIndex].title = updates.title;
      if (updates.description) data.tasks[taskIndex].description = updates.description;
      if (updates.category) data.tasks[taskIndex].category = updates.category;
      if (updates.assignedUserId) data.tasks[taskIndex].assignedUserId = updates.assignedUserId;
      if (updates.status) data.tasks[taskIndex].status = updates.status;
      
      data.tasks[taskIndex].updatedAt = new Date().toISOString();
      
      await this.saveData(data);
      return data.tasks[taskIndex];
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  // Static method to mark task as completed
  static async markCompleted(id) {
    try {
      return await this.update(id, { status: 'completed' });
    } catch (error) {
      throw new Error(`Failed to mark task as completed: ${error.message}`);
    }
  }

  // Static method to mark task as pending
  static async markPending(id) {
    try {
      return await this.update(id, { status: 'pending' });
    } catch (error) {
      throw new Error(`Failed to mark task as pending: ${error.message}`);
    }
  }

  // Static method to assign task to user
  static async assignToUser(id, userId) {
    try {
      return await this.update(id, { assignedUserId: userId });
    } catch (error) {
      throw new Error(`Failed to assign task to user: ${error.message}`);
    }
  }

  // Static method to get task statistics
  static async getStats() {
    try {
      const data = await this.loadData();
      const tasks = data.tasks;
      
      return {
        total: tasks.length,
        pending: tasks.filter(task => task.status === 'pending').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        categories: [...new Set(tasks.map(task => task.category))],
        users: [...new Set(tasks.map(task => task.assignedUserId))]
      };
    } catch (error) {
      throw new Error(`Failed to get task statistics: ${error.message}`);
    }
  }

  // Static method to load data from JSON file
  static async loadData() {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
      const data = await fs.readFile(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty structure
      if (error.code === 'ENOENT') {
        return { users: [], tasks: [] };
      }
      throw error;
    }
  }

  // Static method to save data to JSON file
  static async saveData(data) {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      throw error;
    }
  }

  // Generate unique ID
  static generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Instance method to get task info
  getInfo() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      assignedUserId: this.assignedUserId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Instance method to toggle status
  async toggleStatus() {
    try {
      const newStatus = this.status === 'pending' ? 'completed' : 'pending';
      const updatedTask = await Task.update(this.id, { status: newStatus });
      this.status = updatedTask.status;
      this.updatedAt = updatedTask.updatedAt;
      return updatedTask;
    } catch (error) {
      throw new Error(`Failed to toggle task status: ${error.message}`);
    }
  }
}

