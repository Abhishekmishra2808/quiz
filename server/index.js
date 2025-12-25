import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

// Allow all origins in production, restrict in development
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, "https://quizora.vercel.app", "https://quizora.netlify.app"]
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins.filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Hugging Face API token
const HF_TOKEN = process.env.HF_TOKEN;

// In-memory storage for rooms
const rooms = new Map();

// Helper: Generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Helper: Generate quiz questions using Hugging Face API (via Novita router with Llama)
async function generateQuestions(topic, difficulty) {
    const difficultyGuide = {
        'Easy': 'basic facts, common knowledge, straightforward questions',
        'Medium': 'requires some knowledge, moderate complexity',
        'Hard': 'detailed knowledge, tricky options, expert level'
    };

    const prompt = `You are a quiz master. Generate exactly 5 multiple-choice trivia questions about "${topic}".
Difficulty: ${difficulty} (${difficultyGuide[difficulty] || 'moderate'})

Requirements:
- Each question must be SPECIFICALLY about ${topic} with real facts
- Include 4 answer options
- Only ONE correct answer per question
- Make incorrect options plausible but clearly wrong

IMPORTANT: Respond with ONLY a valid JSON array, nothing else before or after:
[
  {"question": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswerIndex": 0}
]`;

    try {
        console.log(`\n📝 Generating questions for topic: "${topic}" (${difficulty})`);
        
        // Use Novita router with Llama 3.1
        const response = await fetch('https://router.huggingface.co/novita/v3/openai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.1-8b-instruct',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a quiz generator that outputs ONLY valid JSON arrays. No explanations, no markdown, just the JSON array.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const fullResponse = data.choices?.[0]?.message?.content || '';
        
        console.log('📥 Raw AI Response:', fullResponse.substring(0, 500));

        // Extract JSON array from response
        let jsonStr = '';
        
        // Find the JSON array
        const jsonMatch = fullResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        } else {
            const startIdx = fullResponse.indexOf('[');
            const endIdx = fullResponse.lastIndexOf(']');
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                jsonStr = fullResponse.substring(startIdx, endIdx + 1);
            }
        }

        if (!jsonStr) {
            throw new Error('No JSON array found in response');
        }

        // Clean up common JSON issues
        jsonStr = jsonStr
            .replace(/,\s*}/g, '}')
            .replace(/,\s*\]/g, ']')
            .replace(/[\x00-\x1F\x7F]/g, ' ')
            .trim();

        console.log('🔧 Cleaned JSON:', jsonStr.substring(0, 300));
        
        const questions = JSON.parse(jsonStr);
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Parsed result is not a valid array');
        }

        // Validate and fix each question
        const validQuestions = questions
            .filter(q => q.question && Array.isArray(q.options) && q.options.length >= 4)
            .map(q => ({
                question: String(q.question).trim(),
                options: q.options.slice(0, 4).map(opt => String(opt).trim()),
                correctAnswerIndex: Math.min(Math.max(0, parseInt(q.correctAnswerIndex) || 0), 3)
            }));

        if (validQuestions.length === 0) {
            throw new Error('No valid questions after validation');
        }

        console.log(`✅ Successfully generated ${validQuestions.length} questions`);
        return validQuestions.slice(0, 5);

    } catch (error) {
        console.error('❌ Error generating questions:', error.message);
        console.log('⚠️ Falling back to backup questions...');
        return getFallbackQuestions(topic);
    }
}

// Fallback questions if AI generation fails - more varied
function getFallbackQuestions(topic) {
    // Pool of template questions - randomly select 5
    const allQuestions = [
        {
            question: `What is considered a key characteristic of ${topic}?`,
            options: ["Its uniqueness", "Its simplicity", "Its complexity", "All of these"],
            correctAnswerIndex: 3
        },
        {
            question: `Which century saw major developments in ${topic}?`,
            options: ["18th century", "19th century", "20th century", "21st century"],
            correctAnswerIndex: 2
        },
        {
            question: `What is the primary purpose of studying ${topic}?`,
            options: ["Entertainment", "Knowledge expansion", "Career advancement", "All of the above"],
            correctAnswerIndex: 3
        },
        {
            question: `How has ${topic} evolved over time?`,
            options: ["Remained static", "Slowly changed", "Rapidly transformed", "Completely reversed"],
            correctAnswerIndex: 2
        },
        {
            question: `What skill is most useful when learning about ${topic}?`,
            options: ["Critical thinking", "Memorization", "Speed reading", "Guessing"],
            correctAnswerIndex: 0
        },
        {
            question: `Which approach is best for understanding ${topic}?`,
            options: ["Theoretical study", "Practical application", "Both combined", "Neither"],
            correctAnswerIndex: 2
        },
        {
            question: `What makes ${topic} relevant in today's world?`,
            options: ["Historical significance", "Modern applications", "Future potential", "All of these"],
            correctAnswerIndex: 3
        },
        {
            question: `Who would benefit most from learning about ${topic}?`,
            options: ["Students only", "Professionals only", "Everyone", "No one"],
            correctAnswerIndex: 2
        }
    ];
    
    // Shuffle and return 5 random questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create room
    socket.on('create-room', ({ playerName }) => {
        const roomCode = generateRoomCode();
        const room = {
            id: roomCode,
            leaderId: socket.id,
            gameState: 'lobby',
            players: {
                [socket.id]: {
                    id: socket.id,
                    name: playerName,
                    avatar: '👑',
                    score: 0,
                    answers: {}
                }
            },
            questions: [],
            currentQuestion: 0,
            topic: '',
            difficulty: '',
            createdAt: Date.now()
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.roomCode = roomCode;

        socket.emit('room-created', { roomCode, roomData: room, userId: socket.id });
        console.log(`Room ${roomCode} created by ${playerName}`);
    });

    // Join room
    socket.on('join-room', ({ roomCode, playerName }) => {
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room does not exist.' });
            return;
        }

        if (room.gameState !== 'lobby') {
            socket.emit('error', { message: 'Game has already started. Cannot join now.' });
            return;
        }

        // Check max players (4 players limit)
        if (Object.keys(room.players).length >= 4) {
            socket.emit('error', { message: 'Room is full. Maximum 4 players allowed.' });
            return;
        }

        // Assign different avatars based on join order
        const avatars = ['👑', '🧑‍🚀', '🎮', '🎯'];
        const avatarIndex = Object.keys(room.players).length;

        // Add player to room
        room.players[socket.id] = {
            id: socket.id,
            name: playerName,
            avatar: avatars[avatarIndex] || '🧑‍🚀',
            score: 0,
            answers: {}
        };

        socket.join(roomCode);
        socket.roomCode = roomCode;

        // Notify everyone in the room
        io.to(roomCode).emit('room-updated', { roomData: room });
        socket.emit('room-joined', { roomCode, roomData: room, userId: socket.id });
        console.log(`${playerName} joined room ${roomCode}`);
    });

    // Start game
    socket.on('start-game', async ({ topic, difficulty }) => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);

        if (!room || room.leaderId !== socket.id) {
            socket.emit('error', { message: 'Only the room leader can start the game.' });
            return;
        }

        // Notify that questions are being generated
        io.to(roomCode).emit('generating-questions');

        try {
            const questions = await generateQuestions(topic, difficulty);
            
            room.topic = topic;
            room.difficulty = difficulty;
            room.questions = questions;
            room.currentQuestion = 0;
            room.gameState = 'in-game';

            // Reset all player answers
            Object.keys(room.players).forEach(pid => {
                room.players[pid].answers = {};
            });

            io.to(roomCode).emit('game-started', { roomData: room });
            console.log(`Game started in room ${roomCode} with topic: ${topic}`);
        } catch (error) {
            console.error('Failed to generate questions:', error);
            socket.emit('error', { message: 'Failed to generate questions. Please try again.' });
        }
    });

    // Submit answer
    socket.on('submit-answer', ({ answerIndex, timeTaken }) => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);

        if (!room || room.gameState !== 'in-game') return;

        const player = room.players[socket.id];
        if (!player) return;

        // Record the answer
        player.answers[room.currentQuestion] = { answerIndex, timeTaken };

        // Broadcast updated room state
        io.to(roomCode).emit('room-updated', { roomData: room });

        // Check if all players have answered
        const allAnswered = Object.values(room.players).every(
            p => p.answers?.[room.currentQuestion] !== undefined
        );

        if (allAnswered) {
            // Calculate scores
            const questionData = room.questions[room.currentQuestion];
            
            Object.keys(room.players).forEach(pid => {
                const p = room.players[pid];
                const answerData = p.answers?.[room.currentQuestion];
                
                if (answerData && answerData.answerIndex === questionData.correctAnswerIndex) {
                    const timeRemaining = Math.max(0, 10 - answerData.timeTaken);
                    let multiplier = 1;
                    
                    if (answerData.timeTaken <= 2) multiplier = 2;
                    else if (answerData.timeTaken <= 5) multiplier = 1.5;
                    else if (answerData.timeTaken <= 9) multiplier = 1;
                    else multiplier = 0.5;
                    
                    p.score += Math.max(Math.round(timeRemaining * multiplier), 1);
                }
            });

            // Send reveal event
            io.to(roomCode).emit('answers-revealed', { roomData: room });

            // Move to next question after delay
            setTimeout(() => {
                if (room.currentQuestion < room.questions.length - 1) {
                    room.currentQuestion++;
                    io.to(roomCode).emit('next-question', { roomData: room });
                } else {
                    room.gameState = 'finished';
                    io.to(roomCode).emit('game-finished', { roomData: room });
                }
            }, 2500);
        }
    });

    // Play again
    socket.on('play-again', () => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);

        if (!room || room.leaderId !== socket.id) return;

        // Reset room state
        room.gameState = 'lobby';
        room.questions = [];
        room.currentQuestion = 0;
        room.topic = '';
        room.difficulty = '';

        Object.keys(room.players).forEach(pid => {
            room.players[pid].score = 0;
            room.players[pid].answers = {};
        });

        io.to(roomCode).emit('room-updated', { roomData: room });
        console.log(`Room ${roomCode} reset for new game`);
    });

    // Handle leave room
    socket.on('leave-room', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        socket.leave(roomCode);
        delete room.players[socket.id];
        socket.roomCode = null;

        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
            rooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (empty)`);
            return;
        }

        // If leader left, assign new leader
        if (room.leaderId === socket.id) {
            const newLeaderId = Object.keys(room.players)[0];
            room.leaderId = newLeaderId;
            room.players[newLeaderId].avatar = '👑';
        }

        io.to(roomCode).emit('room-updated', { roomData: room });
        console.log(`User ${socket.id} left room ${roomCode}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        // Remove player from room
        delete room.players[socket.id];

        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
            rooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (empty)`);
            return;
        }

        // If leader left, assign new leader
        if (room.leaderId === socket.id) {
            const newLeaderId = Object.keys(room.players)[0];
            room.leaderId = newLeaderId;
            room.players[newLeaderId].avatar = '👑';
        }

        io.to(roomCode).emit('room-updated', { roomData: room });
        console.log(`User ${socket.id} disconnected from room ${roomCode}`);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Quiz server running on http://localhost:${PORT}`);
});
