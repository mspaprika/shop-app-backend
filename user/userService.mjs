import { addUser } from '../db/database.mjs';


export async function register(req, res) {
    try {
        const { name, password } = req.body;

        if (!name || !password) { return res.send('Missing credentials') }

        if (await addUser(name, password)) { res.status(201).send('Success!') }
        else { res.send('Something went wrong!') }
    }
    catch (error) {
        res.send('Something went wrong!');
    }
}