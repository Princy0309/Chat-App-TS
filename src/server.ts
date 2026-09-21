import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import Message from './models/message';

dotenv.config();

const app : Application = express();
const httpServer: http.Server = http.createServer(app);

const io : Server = new Server(httpServer, {
    cors: {origin: "*"}
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/auth', authRoutes);

let onlineUsers = 0;

io.on('connection', async (socket: Socket)=>{
    onlineUsers++;
    io.emit('updateUserCount', onlineUsers);
    console.log('user connected', socket.id, '| online:', onlineUsers);

    try{
        const message = await Message.find()
        .populate('sender', 'username')
        .sort({createdAt: 1});
        socket.emit('loadMessages', message);
    }catch(err){
        console.error('Error fetching chat history', err);
    }
    socket.on('sendMessage', async (data: { text: string; senderId: string }) => {
        try {
            const { text, senderId } = data;

            if (!text || text.trim().length === 0) return;
            if (text.length > 300) {
                socket.emit('errorMessage', 'Message exceeds limit of 300 characters!');
                return;
            }

            const newMessage = new Message({
                sender: senderId,
                text: text.trim(),
                readBy: [senderId]
            });
            await newMessage.save();

            const populated = await Message.findById(newMessage._id).populate('sender', 'username');

            io.emit('receiveMessage', populated);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('markAsRead', async (data: { messageIds: string[]; userId: string }) => {
        try {
            const {messageIds, userId} = data;

            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $addToSet: { readBy: userId } }
            );

            io.emit('messagesRead', { messageIds, readBy: userId });
        } catch (err){
            console.error('Error updating read receipts:', err);
        }
    });

    socket.on('disconnect', () => {
        onlineUsers = Math.max(0, onlineUsers - 1);
        io.emit('updateUserCount', onlineUsers);
        console.log('User disconnected:', socket.id, '| Online:', onlineUsers);
    });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB Atlas connection error:', err);
    });

