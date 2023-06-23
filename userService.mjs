import { addUser } from './database.mjs';


export async function register(req, res) {
    try {
        const { name, password } = req.body;
        console.log(name, password)
        if (name && password) {
            if (await addUser(name, password)) {
                res.status(201).send('Success!');
            } else {
                res.send('Something went wrong!');
            }
        } else {
            res.send('Bad credentials!');
        };
    } catch (error) {
        res.send('Something went wrong!');
    }
}