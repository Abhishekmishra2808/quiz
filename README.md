<div align="center">
  <img src="public/Quizora.png" alt="Quizora Logo" width="120" />
  
  # 🧠 Quizora
  
  ### AI-Powered Real-Time Multiplayer Quiz Platform
  
  [![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
  <p align="center">
    <strong>Create quiz rooms on any topic • AI generates unique questions instantly • Battle friends in real-time</strong>
  </p>

  [Live Demo](#) • [Features](#-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack)
</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Question Generation** | Powered by Llama 3.1 via Hugging Face - generates unique quiz questions on any topic |
| ⚡ **Real-Time Multiplayer** | Up to 4 players can compete simultaneously with live score updates |
| 🎯 **Any Topic** | Enter any topic and get instant quiz questions - unlimited possibilities |
| 🏆 **Speed Scoring** | Faster answers = higher multipliers (2x, 1.5x, 1x, 0.5x) |
| 📱 **QR Code Sharing** | Share room codes via QR or direct link for easy joining |
| 🎨 **Beautiful UI** | Modern glassmorphic design with smooth animations |
| 🔒 **No Account Needed** | Jump straight into the action - no signup required |

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x450/0F172A/84CC16?text=Home+Screen" alt="Home Screen" width="45%" />
  <img src="https://via.placeholder.com/800x450/0F172A/6366F1?text=Game+Screen" alt="Game Screen" width="45%" />
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Hugging Face API Token ([Get one here](https://huggingface.co/settings/tokens))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhishekmishra2808/quiz.git
   cd quiz
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   
   Create `server/.env`:
   ```env
   HF_TOKEN=your_huggingface_token_here
   PORT=3001
   ```

5. **Start the server**
   ```bash
   cd server
   node index.js
   ```

6. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🎮 How to Play

1. **Create a Room** - Enter your name and click "Create Room"
2. **Share the Code** - Share the 6-character room code or QR with friends
3. **Choose a Topic** - The host enters any topic (e.g., "Space Exploration", "90s Movies")
4. **Start the Quiz** - AI generates 5 unique questions instantly
5. **Answer Fast!** - You have 10 seconds per question. Faster = more points!
6. **Win!** - Highest score at the end wins 🏆

### Scoring System

| Response Time | Multiplier |
|---------------|------------|
| 0-2 seconds | **2x** 🟢 |
| 2-5 seconds | **1.5x** 🟡 |
| 5-9 seconds | **1x** 🟠 |
| 9-10 seconds | **0.5x** 🔴 |

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **Canvas Confetti** - Winner celebrations 🎉

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **Hugging Face API** - AI question generation (Llama 3.1)

## 📁 Project Structure

```
quizora/
├── public/
│   └── Quizora.png          # Logo
├── server/
│   ├── index.js             # Express + Socket.io server
│   ├── package.json
│   └── .env                  # HF_TOKEN (not committed)
├── src/
│   ├── App.jsx              # Main React component
│   ├── socket.js            # Socket.io client
│   ├── index.css            # Global styles + Tailwind
│   └── main.jsx             # React entry point
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Abhishek Mishra**

- GitHub: [@Abhishekmishra2808](https://github.com/Abhishekmishra2808)

---

<div align="center">
  <p>Made with ❤️ and lots of ☕</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
