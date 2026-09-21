import express, {Request, Response, Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import message from '../models/message';

const router: Router = express.Router();

router.post('/register', async(req: Request, res: Response,): Promise<void> => {
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            res.status(400).json({message: 'All fields are required'});
            return;
        }

        const existingUser = await User.findOne({ $or: [{email}, {username}]});
        if(existingUser){
            res.status(400).json({message: 'Username or email already exists'});
            return;
        }

        const hashedPswd = await bcrypt.hash(password, 10);

        const newUser = new User({
            username, 
            email,
            password: hashedPswd
        });
        await newUser.save();

        res.status(201).json({message: 'User registered successfully'});
    }catch(err){
        const errorMessage = err instanceof Error? err.message : 'server error';
        res.status(500).json({message: 'server error', error: errorMessage});
    }
});

export default router;