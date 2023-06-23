import { login } from './database.mjs';

import dotenv from 'dotenv';

dotenv.config();

export async function authenticate(req, res) {

    try {
        const { name, password } = req.body;

        if (name && password) {
            if (req.session.authenticated) {
                res.json(req.session);
            } else {
                const id = await login(req.body.name, req.body.password);
                if (await login(req.body.name, req.body.password)) {
                    req.session.authenticated = true;
                    req.session.user_id = id;
                    req.session.user = { name, password };
                    res.send('Success!');
                } else {
                    res.send('Bad credentials!');
                }
            }
        } else {
            res.send('Not allowed!');
        };
    } catch (error) {
        console.log(error);
        res.send('Something went wrong!');
    }
};

export async function authorize(req, res, next) {
    const token = req.headers['token'];
    console.log(token);
    if (token === process.env.SECRET_TOKEN) {
        next();
    } else {
        res.send('Not allowed!');
    }
}

export async function logout(req, res) {
    try {
        req.session.user_id = null;
        req.session.authenticated = false;
        req.session.user = null;
        req.session.save(function (err) {
            if (err) return next(err);
            // Replace session token
            req.session.regenerate(function (err) {
                if (err) next(err);
                return res.send({ result: true });
            })
        });
    } catch (error) {
        res.send('Something went wrong!');
    }
}