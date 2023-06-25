import * as database from '../db/database.mjs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import dotenv from 'dotenv';

dotenv.config();

export async function authenticate(req, res) {

    try {
        const { name, password } = req.body;

        if (!name || !password) { return res.send('Missing credentials') }
        if (req.session.authenticated) { return res.json(req.session) }

        const user = await database.getUserByName(name);

        if (!user) { res.send('Invalid username'); return }
        else if (!bcrypt.compareSync(password, user.password)) { return res.status(401).send('Incorrect password') }
        else {

            req.session.regenerate(async function (err) {
                if (err) { next(err) }

                req.session.authenticated = true;
                req.session.user_id = user.id;

                const token = crypto.randomBytes(64).toString('base64');
                await database.setUserToken(user.id, token);

                req.session.save(function (err) {
                    if (err) { return next(err) }

                    res.send({ token });
                });
            });
        }
    }

    catch (error) {
        console.log(error);
        res.send('Something went wrong!');
    }
};

export async function authorize(req, res, next) {

    const token = req.headers['token'];

    if (token === process.env.SECRET_TOKEN) { return next() }

    let ok = true;

    // session-based auth
    if (!req.session.user_id) { ok = false }

    if (ok) {
        const userId = req.session.user_id;
        const user = await database.getUserById(userId);
        if (!user) { ok = false }
    }

    // token-based auth

    if (!token) { ok = false }

    if (ok) {
        const user = await database.getUserByToken(token);
        if (!user) { ok = false }
    }

    if (ok) { next() }
    else { res.status(401).send('Not allowed!') }
}

export async function logout(req, res) {
    try {

        await database.removeUserToken(req.session.user_id);
        req.session.user_id = null;
        req.session.authenticated = false;

        req.session.save(function (err) {

            if (err) { return next(err) }

            // Replace session token
            req.session.regenerate(function (err) {

                if (err) next(err);
                return res.send({ result: true });
            });
        })
    }
    catch (error) {
        console.log(error);
        res.send('Something went wrong!');
    }
}