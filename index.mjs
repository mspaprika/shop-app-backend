import express from 'express';
import router from './router.mjs';
import session from 'express-session';
import cors from 'cors';

import { getUsers } from './database.mjs';
import * as auth from './auth.mjs';
import * as userService from './userService.mjs';

import MemoryStoreClass from "memorystore";

const MemoryStore = MemoryStoreClass(session);

const app = express();

app.use(express.json());

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
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.post('/register', userService.register);
app.post('/logout', auth.logout);

app.post('/authenticate', auth.authenticate);
app.use(auth.authorize);

app.use(router);

app.listen(3000, () => {
    console.log('My app listening on port 3000!');
});