import express from 'express';
import { config } from 'dotenv';
import { getUsers } from './db/database.mjs';

config();

const router = express.Router();

router.get('/users', async (req, res) => {
    const users = await getUsers();
    res.send(users);
});


export default router;