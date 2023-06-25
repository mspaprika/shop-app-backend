import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.LOCAL_HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

export async function getUsers() {
    const users = await pool.query('SELECT * FROM users');
    return users[0];
}

export async function getUserByToken(token) {
    const userObj = await pool.query('SELECT * FROM users WHERE token = ?', [token]);
    const user = userObj[0][0];
    return user;
}

export async function getUserById(id) {
    const userObj = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    const user = userObj[0][0];
    return user;
}

export async function getUserByName(name) {
    const userObj = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
    const user = userObj[0][0];
    return user;
}

export async function setUserToken(userId, token) {
    try {
        await pool.query('UPDATE users SET token = ? WHERE id = ?', [token, userId]);
    }
    catch (error) {
        console.log(error);
    }
}

export async function removeUserToken(userId) {
    try {
        await pool.query('UPDATE users SET token = NULL WHERE id = ?', [userId]);
    }
    catch (error) {
        console.log(error);
    }
}

export async function addUser(name, password) {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        await pool.query('INSERT INTO users (name, password) VALUES (?, ?)',
            [name, hashedPassword]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export default pool;

