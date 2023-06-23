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

export async function login(name, password) {

    const userObj = await pool.query('SELECT * FROM users WHERE name = ?', [name]);

    const user = userObj[0][0];

    if (user == null) {
        return false;
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            return user.id;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function addUser(name, password) {
    try {
        console.log(name, password)
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

