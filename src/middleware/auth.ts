import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request{
    user?:{
        userId: string;
        username: string;
    }
}

export const AuthenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void =>{
    const authHeader = req.header('Authorization');

    if(!authHeader){
        res.status(401).json({message: 'Access denied. No token provided'});
        return;
    }

    try{
        const token = authHeader.replace('Bearer ', ' ');
        const verified = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
            username: string;
        };

        req.user = verified;

        next();
    }catch(err){
        res.status(400).json({message: 'Invalid or expired token'});
    }
}