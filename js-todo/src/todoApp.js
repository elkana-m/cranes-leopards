#!/usr/bin/env node

import readline from 'readline';
import { TaskManager } from './TaskManager.js';

class TodoApp {
  constructor() {
    this.taskManager = new TaskManager();
    this.currentUser = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🚀 Welcome to the Multi-User To-Do List Application!');
    console.log('==================================================');
    
    await this.showMainMenu();
  }

  async showMainMenu() {
    console.log('\n📋 Main Menu:');
    console.log('1. User Management');
    console.log('2. Task Management');
    console.log('3. View Statistics');
    console.log('4. Exit');
    
    const choice = await this.askQuestion('\nEnter your choice (1-4): ');
    
    switch (choice.trim()) {
      case '1':
        await this.userManagementMenu();
        break;
      case '2':
        await this.taskManagementMenu();
        break;
      case '3':
        await this.showStatistics();
        break;
      case '4':
        console.log('👋 Goodbye!');
        this.rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid choice. Please try again.');
        await this.showMainMenu();
    }
  }

  async userManagementMenu() {
    console.log('\n👤 User Management:');
    console.log('1. Create User');
    console.log('2. List Users');
    console.log('3. Switch User');
    console.log('4. Update User');
    console.log('5. Delete User');
    console.log('6. Back to Main Menu');
    
    const choice = await this.askQuestion('\nEnter your choice (1-6): ');
    
    switch (choice.trim()) {
      case '1':
        await this.createUser();
        break;
      case '2':
        await this.listUsers();
        break;
      case '3':
        await this.switchUser();
        break;
      case '4':
        await this.updateUser();
        break;
      case '5':
        await this.deleteUser();
        break;
      case '6':
        await this.showMainMenu();
        break;
      default:
        console.log('❌ Invalid choice. Please try again.');
        await this.userManagementMenu();
    }
  }

  async taskManagementMenu() {
    if (!this.currentUser) {
      console.log('❌ Please select a user first.');
      await this.showMainMenu();
      return;
    }

    console.log(`\n📝 Task Management (User: ${this.currentUser.name}):`);
    console.log('1. Create Task');
    console.log('2. List My Tasks');
    console.log('3. List All Tasks');
    console.log('4. Update Task');
    console.log('5. Delete Task');
    console.log('6. Mark Task Complete');
    console.log('7. Mark Task Pending');
    console.log('8. Assign Task to User');
    console.log('9. Search Tasks');
    console.log('10. Back to Main Menu');
    
    const choice = await this.askQuestion('\nEnter your choice (1-10): ');
    
    switch (choice.trim()) {
      case '1':
        await this.createTask();
        break;
      case '2':
        await this.listMyTasks();
        break;
      case '3':
        await this.listAllTasks();
        break;
      case '4':
        await this.updateTask();
        break;
      case '5':
        await this.deleteTask();
        break;
      case '6':
        await this.markTaskComplete();
        break;
      case '7':
        await this.markTaskPending();
        break;
      case '8':
        await this.assignTaskToUser();
        break;
      case '9':
        await this.searchTasks();
        break;
      case '10':
        await this.showMainMenu();
        break;
      default:
        console.log('❌ Invalid choice. Please try again.');
        await this.taskManagementMenu();
    }
  }

  async createUser() {
    try {
      const name = await this.askQuestion('Enter user name: ');
      const email = await this.askQuestion('Enter user email: ');
      
      const user = await this.taskManager.createUser(name, email);
      console.log(`✅ User created successfully! ID: ${user.id}`);
    } catch (error) {
      console.log(`❌ Error creating user: ${error.message}`);
    }
    
    await this.userManagementMenu();
  }

  async listUsers() {
    try {
      const users = await this.taskManager.listUsers();
      
      if (users.length === 0) {
        console.log('📭 No users found.');
      } else {
        console.log('\n👥 Users:');
        users.forEach(user => {
          console.log(`  ID: ${user.id}`);
          console.log(`  Name: ${user.name}`);
          console.log(`  Email: ${user.email}`);
          console.log(`  Created: ${user.createdAt}`);
          console.log('  ---');
        });
      }
    } catch (error) {
      console.log(`❌ Error listing users: ${error.message}`);
    }
    
    await this.userManagementMenu();
  }

  async switchUser() {
    try {
      const name = await this.askQuestion('Enter user name to switch to: ');
      const user = await this.taskManager.getUserByName(name);
      
      if (user) {
        this.currentUser = user;
        console.log(`✅ Switched to user: ${user.name}`);
      } else {
        console.log('❌ User not found.');
      }
    } catch (error) {
      console.log(`❌ Error switching user: ${error.message}`);
    }
    
    await this.userManagementMenu();
  }

  async updateUser() {
    try {
      const name = await this.askQuestion('Enter user name to update: ');
      const user = await this.taskManager.getUserByName(name);
      
      if (!user) {
        console.log('❌ User not found.');
        await this.userManagementMenu();
        return;
      }
      
      const newName = await this.askQuestion(`Enter new name (current: ${user.name}): `);
      const newEmail = await this.askQuestion(`Enter new email (current: ${user.email}): `);
      
      const updates = {};
      if (newName.trim()) updates.name = newName.trim();
      if (newEmail.trim()) updates.email = newEmail.trim();
      
      if (Object.keys(updates).length > 0) {
        await this.taskManager.updateUser(user.id, updates);
        console.log('✅ User updated successfully!');
      } else {
        console.log('ℹ️ No changes made.');
      }
    } catch (error) {
      console.log(`❌ Error updating user: ${error.message}`);
    }
    
    await this.userManagementMenu();
  }

  async deleteUser() {
    try {
      const name = await this.askQuestion('Enter user name to delete: ');
      const user = await this.taskManager.getUserByName(name);
      
      if (!user) {
        console.log('❌ User not found.');
        await this.userManagementMenu();
        return;
      }
      
      const confirm = await this.askQuestion(`Are you sure you want to delete user "${user.name}"? (yes/no): `);
      
      if (confirm.toLowerCase() === 'yes') {
        await this.taskManager.deleteUser(user.id);
        console.log('✅ User deleted successfully!');
        
        if (this.currentUser && this.currentUser.id === user.id) {
          this.currentUser = null;
          console.log('ℹ️ You have been logged out.');
        }
      } else {
        console.log('ℹ️ User deletion cancelled.');
      }
    } catch (error) {
      console.log(`❌ Error deleting user: ${error.message}`);
    }
    
    await this.userManagementMenu();
  }

  async createTask() {
    try {
      const title = await this.askQuestion('Enter task title: ');
      const description = await this.askQuestion('Enter task description: ');
      const category = await this.askQuestion('Enter task category: ');
      
      const task = await this.taskManager.createTask(title, description, category, this.currentUser.id);
      console.log(`✅ Task created successfully! ID: ${task.id}`);
    } catch (error) {
      console.log(`❌ Error creating task: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async listMyTasks() {
    try {
      const tasks = await this.taskManager.listTasksByUser(this.currentUser.id);
      
      if (tasks.length === 0) {
        console.log('📭 No tasks found for you.');
      } else {
        console.log(`\n📋 Your Tasks (${tasks.length}):`);
        tasks.forEach(task => {
          console.log(`  ID: ${task.id}`);
          console.log(`  Title: ${task.title}`);
          console.log(`  Description: ${task.description}`);
          console.log(`  Category: ${task.category}`);
          console.log(`  Status: ${task.status}`);
          console.log(`  Created: ${task.createdAt}`);
          console.log('  ---');
        });
      }
    } catch (error) {
      console.log(`❌ Error listing your tasks: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async listAllTasks() {
    try {
      const tasks = await this.taskManager.listTasks();
      
      if (tasks.length === 0) {
        console.log('📭 No tasks found.');
      } else {
        console.log(`\n📋 All Tasks (${tasks.length}):`);
        tasks.forEach(task => {
          console.log(`  ID: ${task.id}`);
          console.log(`  Title: ${task.title}`);
          console.log(`  Description: ${task.description}`);
          console.log(`  Category: ${task.category}`);
          console.log(`  Status: ${task.status}`);
          console.log(`  Assigned to: ${task.assignedUserId}`);
          console.log(`  Created: ${task.createdAt}`);
          console.log('  ---');
        });
      }
    } catch (error) {
      console.log(`❌ Error listing all tasks: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async updateTask() {
    try {
      const taskId = await this.askQuestion('Enter task ID to update: ');
      const task = await this.taskManager.getTaskById(taskId);
      
      if (!task) {
        console.log('❌ Task not found.');
        await this.taskManagementMenu();
        return;
      }
      
      const newTitle = await this.askQuestion(`Enter new title (current: ${task.title}): `);
      const newDescription = await this.askQuestion(`Enter new description (current: ${task.description}): `);
      const newCategory = await this.askQuestion(`Enter new category (current: ${task.category}): `);
      
      const updates = {};
      if (newTitle.trim()) updates.title = newTitle.trim();
      if (newDescription.trim()) updates.description = newDescription.trim();
      if (newCategory.trim()) updates.category = newCategory.trim();
      
      if (Object.keys(updates).length > 0) {
        await this.taskManager.updateTask(taskId, updates);
        console.log('✅ Task updated successfully!');
      } else {
        console.log('ℹ️ No changes made.');
      }
    } catch (error) {
      console.log(`❌ Error updating task: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async deleteTask() {
    try {
      const taskId = await this.askQuestion('Enter task ID to delete: ');
      const task = await this.taskManager.getTaskById(taskId);
      
      if (!task) {
        console.log('❌ Task not found.');
        await this.taskManagementMenu();
        return;
      }
      
      const confirm = await this.askQuestion(`Are you sure you want to delete task "${task.title}"? (yes/no): `);
      
      if (confirm.toLowerCase() === 'yes') {
        await this.taskManager.deleteTask(taskId);
        console.log('✅ Task deleted successfully!');
      } else {
        console.log('ℹ️ Task deletion cancelled.');
      }
    } catch (error) {
      console.log(`❌ Error deleting task: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async markTaskComplete() {
    try {
      const taskId = await this.askQuestion('Enter task ID to mark as complete: ');
      await this.taskManager.markTaskCompleted(taskId);
      console.log('✅ Task marked as completed!');
    } catch (error) {
      console.log(`❌ Error marking task as complete: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async markTaskPending() {
    try {
      const taskId = await this.askQuestion('Enter task ID to mark as pending: ');
      await this.taskManager.markTaskPending(taskId);
      console.log('✅ Task marked as pending!');
    } catch (error) {
      console.log(`❌ Error marking task as pending: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async assignTaskToUser() {
    try {
      const taskId = await this.askQuestion('Enter task ID to assign: ');
      const userName = await this.askQuestion('Enter user name to assign to: ');
      
      const user = await this.taskManager.getUserByName(userName);
      if (!user) {
        console.log('❌ User not found.');
        await this.taskManagementMenu();
        return;
      }
      
      await this.taskManager.assignTaskToUser(taskId, user.id);
      console.log(`✅ Task assigned to ${user.name}!`);
    } catch (error) {
      console.log(`❌ Error assigning task: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async searchTasks() {
    try {
      const query = await this.askQuestion('Enter search query: ');
      const tasks = await this.taskManager.searchTasks(query);
      
      if (tasks.length === 0) {
        console.log('📭 No tasks found matching your search.');
      } else {
        console.log(`\n🔍 Search Results (${tasks.length}):`);
        tasks.forEach(task => {
          console.log(`  ID: ${task.id}`);
          console.log(`  Title: ${task.title}`);
          console.log(`  Description: ${task.description}`);
          console.log(`  Category: ${task.category}`);
          console.log(`  Status: ${task.status}`);
          console.log('  ---');
        });
      }
    } catch (error) {
      console.log(`❌ Error searching tasks: ${error.message}`);
    }
    
    await this.taskManagementMenu();
  }

  async showStatistics() {
    try {
      const stats = await this.taskManager.getTaskStatistics();
      
      console.log('\n📊 Task Statistics:');
      console.log(`  Total Tasks: ${stats.total}`);
      console.log(`  Pending: ${stats.pending}`);
      console.log(`  Completed: ${stats.completed}`);
      console.log(`  Categories: ${stats.categories.join(', ')}`);
      console.log(`  Users: ${stats.users.length}`);
      
      if (this.currentUser) {
        const userStats = await this.taskManager.getUserTaskStatistics(this.currentUser.id);
        console.log(`\n👤 Your Statistics:`);
        console.log(`  Your Tasks: ${userStats.total}`);
        console.log(`  Your Pending: ${userStats.pending}`);
        console.log(`  Your Completed: ${userStats.completed}`);
        console.log(`  Your Categories: ${userStats.categories.join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ Error showing statistics: ${error.message}`);
    }
    
    await this.showMainMenu();
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Start the application
const app = new TodoApp();
app.start().catch(error => {
  console.error('❌ Application error:', error);
  process.exit(1);
});

