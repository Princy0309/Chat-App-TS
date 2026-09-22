import express, {Application, Request, Response} from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import Message from './models/message';
import message from './models/message';

dotenv.config();

const app: Application = express();
const httpServer: http.Server = http.createServer(app);

const wss = new WebSocketServer({server: httpServer});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/auth', authRoutes);
app.get('/', (req: Request, res: Response)=>{
    res.redirect('/login.html');
})

function broadcast(data: object){
    const payload = JSON.stringify(data);
    wss.clients.forEach((client: WebSocket) => {
        if(client.readyState === WebSocket.OPEN){
            client.send(payload)
        }
    });
}

wss.on('connection', async (ws: WebSocket) => {
    console.log('client connected. Total online : ', wss.clients.size);

    broadcast({type: 'USER_COUNT', count: wss.clients.size});

    try{
        const messages = await Message.find()
        .populate('sender', 'username')
        .sort({createdAt: 1});
        ws.send(JSON.stringify({type: 'CHAT_HISTORY', messages}));
    }catch(err){
        console.error('Error fetching chat history: ', err);
    }

        ws.on('message', async (rawData: string) => {
        try {
            const data = JSON.parse(rawData);

            if (data.type === 'SEND_MESSAGE'){
                const { text, senderId } = data;

                if (!text || text.trim().length === 0) return;
                if (text.length > 300) {
                    ws.send(JSON.stringify({
                        type: 'ERROR',
                        message: 'Message exceeds limit of 300 characters!'
                    }));
                    return;
                }

                const newMessage = new Message({
                    sender: senderId,
                    text: text.trim(),
                    readBy: [senderId]
                });
                await newMessage.save();

                const populated = await Message.findById(newMessage._id).populate('sender', 'username');

                broadcast({ type: 'NEW_MESSAGE', message: populated });
            }

            if (data.type === 'MARK_AS_READ') {
                const { messageIds, userId } = data;

                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    { $addToSet: { readBy: userId } }
                );

                broadcast({
                    type: 'MESSAGES_READ',
                    messageIds,
                    readBy: userId
                });
            }
        } catch (err) {
            console.error('WebSocket message error:', err);
        }
    });


        ws.on('close', () => {
        console.log('Client disconnected. Total online:', wss.clients.size);
        broadcast({ type: 'USER_COUNT', count: wss.clients.size });
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



