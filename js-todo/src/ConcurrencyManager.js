import fs from 'fs/promises';
import path from 'path';

export class ConcurrencyManager {
  constructor() {
    this.locks = new Map();
    this.lockTimeout = 5000; // 5 seconds timeout for locks
  }

  // Acquire a lock for a specific operation
  async acquireLock(lockKey) {
    const startTime = Date.now();
    
    while (this.locks.has(lockKey)) {
      if (Date.now() - startTime > this.lockTimeout) {
        throw new Error(`Lock timeout for key: ${lockKey}`);
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.locks.set(lockKey, Date.now());
    return true;
  }

  // Release a lock
  releaseLock(lockKey) {
    this.locks.delete(lockKey);
  }

  // Execute an operation with a lock
  async executeWithLock(lockKey, operation) {
    await this.acquireLock(lockKey);
    try {
      const result = await operation();
      return result;
    } finally {
      this.releaseLock(lockKey);
    }
  }

  // Atomic file read operation
  async atomicRead(filePath) {
    return await this.executeWithLock(`read_${filePath}`, async () => {
      try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return { users: [], tasks: [] };
        }
        throw error;
      }
    });
  }

  // Atomic file write operation
  async atomicWrite(filePath, data) {
    return await this.executeWithLock(`write_${filePath}`, async () => {
      const tempPath = `${filePath}.tmp`;
      try {
        // Write to temporary file first
        await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
        // Atomic move operation
        await fs.rename(tempPath, filePath);
      } catch (error) {
        // Clean up temp file if it exists
        try {
          await fs.unlink(tempPath);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        throw error;
      }
    });
  }

  // Atomic user creation
  async atomicCreateUser(name, email) {
    const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
    return await this.executeWithLock('create_user', async () => {
      const data = await this.atomicRead(dataPath);
      
      // Check if user already exists
      const existingUser = data.users.find(user => user.name === name);
      if (existingUser) {
        throw new Error('User with this name already exists');
      }
      
      const id = this.generateId();
      const user = {
        id,
        name,
        email,
        createdAt: new Date().toISOString()
      };
      
      data.users.push(user);
      await this.atomicWrite(dataPath, data);
      return user;
    });
  }

  // Atomic task creation
  async atomicCreateTask(title, description, category, assignedUserId) {
    const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
    return await this.executeWithLock('create_task', async () => {
      const data = await this.atomicRead(dataPath);
      
      // Verify user exists
      const user = data.users.find(u => u.id === assignedUserId);
      if (!user) {
        throw new Error('Assigned user not found');
      }
      
      const id = this.generateId();
      const task = {
        id,
        title,
        description,
        category,
        assignedUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.tasks.push(task);
      await this.atomicWrite(dataPath, data);
      return task;
    });
  }

  // Atomic task update
  async atomicUpdateTask(taskId, updates) {
    const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
    return await this.executeWithLock(`update_task_${taskId}`, async () => {
      const data = await this.atomicRead(dataPath);
      
      const taskIndex = data.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      // Update task properties
      if (updates.title) data.tasks[taskIndex].title = updates.title;
      if (updates.description) data.tasks[taskIndex].description = updates.description;
      if (updates.category) data.tasks[taskIndex].category = updates.category;
      if (updates.assignedUserId) {
        // Verify new user exists
        const user = data.users.find(u => u.id === updates.assignedUserId);
        if (!user) {
          throw new Error('Assigned user not found');
        }
        data.tasks[taskIndex].assignedUserId = updates.assignedUserId;
      }
      if (updates.status) data.tasks[taskIndex].status = updates.status;
      
      data.tasks[taskIndex].updatedAt = new Date().toISOString();
      
      await this.atomicWrite(dataPath, data);
      return data.tasks[taskIndex];
    });
  }

  // Atomic task deletion
  async atomicDeleteTask(taskId) {
    const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
    return await this.executeWithLock(`delete_task_${taskId}`, async () => {
      const data = await this.atomicRead(dataPath);
      
      const taskIndex = data.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      data.tasks.splice(taskIndex, 1);
      await this.atomicWrite(dataPath, data);
      return true;
    });
  }

  // Atomic user deletion
  async atomicDeleteUser(userId) {
    const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
    return await this.executeWithLock(`delete_user_${userId}`, async () => {
      const data = await this.atomicRead(dataPath);
      
      const userIndex = data.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Remove user from users array
      data.users.splice(userIndex, 1);
      
      // Remove all tasks assigned to this user
      data.tasks = data.tasks.filter(task => task.assignedUserId !== userId);
      
      await this.atomicWrite(dataPath, data);
      return true;
    });
  }

  // Get all data atomically
  async atomicGetAllData() {
    const dataPath = path.join(process.cwd(), 'data', 'tasks.json');
    return await this.atomicRead(dataPath);
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Clean up expired locks
  cleanupLocks() {
    const now = Date.now();
    for (const [key, timestamp] of this.locks.entries()) {
      if (now - timestamp > this.lockTimeout) {
        this.locks.delete(key);
      }
    }
  }

  // Get lock status for debugging
  getLockStatus() {
    return {
      activeLocks: Array.from(this.locks.keys()),
      lockCount: this.locks.size
    };
  }
}

