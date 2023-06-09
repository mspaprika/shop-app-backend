import express from 'express';
import router from './router.mjs';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/database.mjs';
import cookieParser from 'cookie-parser';

dotenv.config();

import * as auth from './user/auth.mjs';
import * as userService from './user/userService.mjs';

import MemoryStoreClass from "memorystore";

const MemoryStore = MemoryStoreClass(session);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("trust proxy", true);

const corsOptions = {
    origin: true,
    credentials: true
};
app.use(cors(corsOptions));

const sessionCookie = {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none'
};

app.use(session({
    cookie: sessionCookie,
    store: new MemoryStore({
        checkPeriod: 1 * 60 * 60 * 1000 // prune expired entries every hour
    }),
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false
}));

app.post('/register', userService.register);
app.post('/logout', auth.logout);

app.post('/authenticate', auth.authenticate);
app.use(auth.authorize);

app.use(router);

pool.on('connection', function (connection) {
    console.log('DB Connection established');

    connection.on('error', function (err) {
        console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function (err) {
        console.error(new Date(), 'MySQL close', err);
    });
});

app.listen(3000, () => {
    console.log('My app listening on port 3000!');
});