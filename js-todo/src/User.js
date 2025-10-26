import fs from 'fs/promises';
import path from 'path';

export class User {

    /**
     * create a new user
     * @param {string} id - The ID of the user
     * @param {string} name - The name of the user
     * @param {string} email - The email of the user
     * @returns {Object} - The user object
     * @throws {Error} - If failed to create user
     */
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = new Date().toISOString();
    }

    /**
     * create a new user
     * @param {string} name - The name of the user
     * @param {string} email - The email of the user
     * @returns {Object} - The user object
     * @throws {Error} - If failed to create user
     */
    static async create(name, email) {
        try {
            const data = await this.loadData();
            const id = this.generateId();
            const user = new User(id, name, email);

            data.users.push(user);
            await this.saveData(data);

            return user;
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    /**
     * find user by name
     * @param {string} name - The name of the user to find
     * @returns {Object} - The user object
     * @throws {Error} - If failed to find user
     */
    static async findByName(name) {
        try {
            const data = await this.loadData();
            return data.users.find(user => user.name === name) || null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    /**
     * find user by ID
     * @param {string} id - The ID of the user to find
     * @returns {Object} - The user object
     * @throws {Error} - If failed to find user
     */
    static async findById(id) {
        try {
            const data = await this.loadData();
            return data.users.find(user => user.id === id) || null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    /**
     * list all users
     * @returns {Array} - Array of users
     * @throws {Error} - If failed to list users
     */
    static async listAll() {
        try {
            const data = await this.loadData();
            return data.users;
        } catch (error) {
            throw new Error(`Failed to list users: ${error.message}`);
        }
    }

    /**
     * update a user by ID
     * @param {string} id - The ID of the user to update
     * @param {Object} updates - The updates to apply to the user
     * @returns {Object} - The updated user object
     * @throws {Error} - If failed to update user
     */
    static async update(id, updates) {
        try {
            const data = await this.loadData();
            const userIndex = data.users.findIndex(user => user.id === id);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Update user properties
            if (updates.name) data.users[userIndex].name = updates.name;
            if (updates.email) data.users[userIndex].email = updates.email;

            await this.saveData(data);
            return data.users[userIndex];
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    /**
     * delete a user by ID
     * @param {string} id - The ID of the user to delete
     * @returns {boolean} - True if user was deleted, false otherwise
     * @throws {Error} - If failed to delete user
     */
    static async delete(id) {
        try {
            const data = await this.loadData();
            const userIndex = data.users.findIndex(user => user.id === id);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Remove user from users array
            data.users.splice(userIndex, 1);

            // Remove all tasks assigned to this user
            data.tasks = data.tasks.filter(task => task.assignedUserId !== id);

            await this.saveData(data);
            return true;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }


    /**
     * load data from JSON file
     * @returns {Object} - The data object
     * @throws {Error} - If failed to load data
     */
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

    /**
     * save data to JSON file
     * @param {Object} data - The data to save
     * @returns {void}
     * @throws {Error} - If failed to save data
     */
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

    // Instance method to get user info
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt
        };
    }

    // Instance method to get user's tasks
    async getTasks() {
        try {
            const data = await User.loadData();
            return data.tasks.filter(task => task.assignedUserId === this.id);
        } catch (error) {
            throw new Error(`Failed to get user tasks: ${error.message}`);
        }
    }
}
