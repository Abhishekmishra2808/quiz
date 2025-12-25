import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Users, Crown, Loader, Check, X, Copy, PartyPopper, QrCode, Share2, Smartphone, Sparkles, Home, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import socketService from './socket';

// --- Constants ---
const COLORS = {
    bgPrimary: '#0F172A',
    bgSecondary: '#1E293B',
    accentLime: '#84CC16',
    accentIndigo: '#6366F1',
};

// --- Helper Functions ---
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- Staggered Animation Wrapper ---
const AnimateIn = ({ children, delay = 0, from = 'opacity-0 translate-y-4', to = 'opacity-100 translate-y-0', duration = 'duration-500' }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 10 + delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className={`transition-all ease-out ${duration} ${mounted ? to : from}`}>
            {children}
        </div>
    );
};

// --- Floating Particles Background ---
const FloatingParticles = () => {
    const particles = [
        { emoji: '❓', size: 'text-2xl', pos: 'top-[10%] left-[10%]', delay: '0s' },
        { emoji: '💡', size: 'text-3xl', pos: 'top-[20%] right-[15%]', delay: '1s' },
        { emoji: '🧠', size: 'text-2xl', pos: 'top-[60%] left-[8%]', delay: '2s' },
        { emoji: '⚡', size: 'text-xl', pos: 'top-[70%] right-[10%]', delay: '0.5s' },
        { emoji: '🎯', size: 'text-2xl', pos: 'top-[40%] right-[5%]', delay: '1.5s' },
        { emoji: '✨', size: 'text-xl', pos: 'bottom-[20%] left-[15%]', delay: '2.5s' },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p, i) => (
                <div
                    key={i}
                    className={`absolute ${p.pos} ${p.size} opacity-20 animate-float`}
                    style={{ animationDelay: p.delay, animationDuration: `${4 + i * 0.5}s` }}
                >
                    {p.emoji}
                </div>
            ))}
        </div>
    );
};

// --- Countdown Overlay ---
const CountdownOverlay = ({ count, onComplete }) => {
    useEffect(() => {
        if (count === 0) {
            onComplete?.();
        }
    }, [count, onComplete]);

    if (count === null) return null;

    return (
        <div className="countdown-overlay">
            <div className="countdown-number" key={count}>
                {count === 0 ? 'GO!' : count}
            </div>
        </div>
    );
};


// --- React Components ---

const PlayerCard = ({ player, isLeader, isSelf, score, rank }) => (
    <div className={`p-4 rounded-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] ${isSelf ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'bg-white/5'}`}>
        <div className="flex items-center gap-4">
            {rank && <span className="text-xl font-bold w-8 text-center text-gray-500">{rank}</span>}
            <span className="text-3xl">{player?.avatar || '😊'}</span>
            <span className="font-medium text-lg text-white">{player?.name || 'Loading...'}</span>
        </div>
        <div className="flex items-center gap-4">
            {score !== undefined && <span className="font-bold text-xl text-lime-400">{score} pts</span>}
            {isLeader && <Crown className="w-6 h-6 text-yellow-500" />}
        </div>
    </div>
);

const HomeScreen = ({ setPlayerName, handleJoinRoom, handleCreateRoom, playerName, pendingJoinCode, setPendingJoinCode }) => {
    const [isJoining, setIsJoining] = useState(!!pendingJoinCode);
    const [joinCode, setJoinCode] = useState(pendingJoinCode || '');

    useEffect(() => {
        if (pendingJoinCode) {
            setIsJoining(true);
            setJoinCode(pendingJoinCode);
        }
    }, [pendingJoinCode]);

    const features = [
        { icon: '🧠', title: 'AI-Powered', desc: 'Questions generated instantly' },
        { icon: '⚡', title: 'Instant Play', desc: 'No signup needed' },
        { icon: '🎯', title: 'Any Topic', desc: 'Unlimited possibilities' },
        { icon: '🏆', title: 'Live Battles', desc: 'Compete in real-time' },
    ];

    return (
        <div className="min-h-screen w-full bg-[#0F172A] relative overflow-hidden">
            {/* Grain texture */}
            <div className="grain-overlay"></div>
            
            {/* Ambient Background */}
            <div className="absolute inset-0">
                {/* Gradient orbs - more subtle */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[150px]"></div>
                
                {/* Subtle grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
            </div>

            {/* Floating particles */}
            <FloatingParticles />

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                
                {/* Navigation */}
                <nav className="w-full px-6 lg:px-12 py-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <AnimateIn from="opacity-0 -translate-x-8" to="opacity-100 translate-x-0">
                            <div className="flex items-center gap-3">
                                <img src="/Quizora.png" alt="Quizora" className="w-11 h-11 rounded-2xl shadow-lg shadow-indigo-500/30" />
                                <span className="text-2xl font-bold text-white font-display tracking-tight">Quizora</span>
                            </div>
                        </AnimateIn>
                        <AnimateIn from="opacity-0 translate-x-8" to="opacity-100 translate-x-0">
                            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <div className="w-2.5 h-2.5 bg-lime-400 rounded-full animate-breathe"></div>
                                <span className="text-sm text-gray-300 font-medium">2.4k online</span>
                            </div>
                        </AnimateIn>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-8">
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            
                            {/* Left - Hero Text */}
                            <div className="text-center lg:text-left">
                                <AnimateIn delay={100} from="opacity-0 translate-y-6" to="opacity-100 translate-y-0" duration="duration-700">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mb-6">
                                        <Sparkles className="w-4 h-4 text-lime-400" />
                                        <span className="text-lime-400 text-sm font-semibold">AI-Powered Quiz Platform</span>
                                    </div>
                                </AnimateIn>
                                
                                <AnimateIn delay={200} from="opacity-0 translate-y-6" to="opacity-100 translate-y-0" duration="duration-700">
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 font-display">
                                        Challenge Your
                                        <span className="block mt-2 bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                            Knowledge
                                        </span>
                                    </h1>
                                </AnimateIn>
                                
                                <AnimateIn delay={300} from="opacity-0 translate-y-6" to="opacity-100 translate-y-0" duration="duration-700">
                                    <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                        Create quiz rooms on any topic. AI generates unique questions instantly. 
                                        Battle friends in real-time.
                                    </p>
                                </AnimateIn>

                                {/* Features Grid */}
                                <AnimateIn delay={400} from="opacity-0 translate-y-6" to="opacity-100 translate-y-0" duration="duration-700">
                                    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                                        {features.map((feature, i) => (
                                            <div 
                                                key={feature.title}
                                                className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 cursor-default"
                                            >
                                                <span className="text-2xl">{feature.icon}</span>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{feature.title}</p>
                                                    <p className="text-gray-500 text-xs mt-0.5">{feature.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AnimateIn>
                            </div>

                            {/* Right - Action Card */}
                            <AnimateIn delay={300} from="opacity-0 scale-95 translate-y-8" to="opacity-100 scale-100 translate-y-0" duration="duration-700">
                                <div className="relative">
                                    {/* Card glow effect */}
                                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-lime-500/20 rounded-[2rem] blur-2xl opacity-60"></div>
                                    
                                    {/* Glassmorphic Card */}
                                    <div className="relative glass-card rounded-3xl p-8">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-white mb-2 font-display">Start Playing</h2>
                                            <p className="text-gray-400">Enter your name to begin</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Your display name"
                                                    value={playerName}
                                                    onChange={(e) => setPlayerName(e.target.value)}
                                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all duration-300 text-center text-lg font-medium"
                                                />
                                            </div>

                                            {isJoining && (
                                                <AnimateIn from="opacity-0 -translate-y-2 scale-95" to="opacity-100 translate-y-0 scale-100" duration="duration-300">
                                                    <input
                                                        type="text"
                                                        placeholder="Room code"
                                                        maxLength="6"
                                                        value={joinCode}
                                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-lime-500/50 focus:bg-white/[0.08] transition-all duration-300 text-center font-mono tracking-[0.4em] text-xl uppercase"
                                                    />
                                                </AnimateIn>
                                            )}

                                            <button
                                                onClick={isJoining ? () => handleJoinRoom(joinCode) : handleCreateRoom}
                                                disabled={!playerName || (isJoining && !joinCode.trim())}
                                                className="btn-3d w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                                            >
                                                {isJoining ? (
                                                    <>Join Room <ArrowRight className="w-5 h-5" /></>
                                                ) : (
                                                    <>Create Room <ArrowRight className="w-5 h-5" /></>
                                                )}
                                            </button>

                                            <div className="relative py-4">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/10"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <span className="px-4 bg-[#1E293B] text-gray-500 text-sm rounded-full">or</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setIsJoining(!isJoining)}
                                                className="w-full py-4 px-6 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                            >
                                                {isJoining ? 'Create a new room instead' : 'Join with room code'}
                                            </button>
                                        </div>

                                        {/* Quick stats */}
                                        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-white font-display">∞</p>
                                                <p className="text-xs text-gray-500 mt-1">Topics</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-white font-display">10s</p>
                                                <p className="text-xs text-gray-500 mt-1">Per Question</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-lime-400 font-display">2x</p>
                                                <p className="text-xs text-gray-500 mt-1">Speed Bonus</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimateIn>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="px-6 lg:px-12 py-6">
                    <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
                        <AnimateIn delay={600} from="opacity-0" to="opacity-100" duration="duration-1000">
                            <p>Powered by AI • Real-time multiplayer • No account needed</p>
                        </AnimateIn>
                    </div>
                </footer>
            </div>
        </div>
    );
};;

const LobbyScreen = ({ roomData, userId, handleStartGame, isGenerating, error }) => {
    const isLeader = roomData.leaderId === userId;
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [countdown, setCountdown] = useState(null);
    
    const MAX_PLAYERS = 4;
    const playerCount = Object.keys(roomData.players).length;
    const emptySlots = MAX_PLAYERS - playerCount;
    
    // Generate join URL for QR code
    const joinUrl = `${window.location.origin}?join=${roomData.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(roomData.id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            console.error('Failed to copy!', err);
        });
    };

    const handleShareLink = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join my Quizora game!',
                text: `Join my quiz battle with code: ${roomData.id}`,
                url: joinUrl
            });
        } else {
            navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Avatars with colors for players
    const playerAvatars = ['😎', '🚀', '🎮', '⚡'];
    const avatarColors = [
        'from-indigo-500 to-violet-500',
        'from-emerald-500 to-cyan-500', 
        'from-amber-500 to-orange-500',
        'from-pink-500 to-rose-500'
    ];

    return (
        <div className="min-h-screen w-full bg-[#0F172A] relative overflow-hidden">
            {/* Grain texture */}
            <div className="grain-overlay"></div>
            
            {/* Ambient Background */}
            <div className="absolute inset-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-lime-500/10 rounded-full blur-[150px]"></div>
                <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
            </div>

            {/* Countdown Overlay */}
            <CountdownOverlay count={countdown} />

            <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8">
                {/* Header */}
                <AnimateIn from="opacity-0 -translate-y-4" to="opacity-100 translate-y-0">
                    <div className="max-w-6xl mx-auto mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src="/Quizora.png" alt="Quizora" className="w-11 h-11 rounded-2xl shadow-lg shadow-indigo-500/30" />
                                <span className="text-2xl font-bold text-white font-display tracking-tight">Quizora</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <div className="w-2.5 h-2.5 bg-lime-400 rounded-full animate-breathe"></div>
                                <span className="text-sm text-gray-300 font-medium">Game Lobby</span>
                            </div>
                        </div>
                    </div>
                </AnimateIn>

                <div className="max-w-6xl mx-auto">
                    {/* Main Grid Layout */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        
                        {/* Left Column - Room Code & QR */}
                        <AnimateIn delay={100} from="opacity-0 translate-y-6" to="opacity-100 translate-y-0">
                            <div className="lg:col-span-1 space-y-5">
                                {/* Room Code Card */}
                                <div className="glass-card rounded-2xl p-6">
                                    <div className="text-center">
                                        <p className="text-gray-400 text-sm font-medium mb-4">Room Code</p>
                                        <div 
                                            className="relative inline-flex items-center gap-3 bg-[#0F172A]/80 border border-white/10 px-6 py-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-all duration-300 mb-4 group" 
                                            onClick={handleCopy}
                                        >
                                            <span className="font-mono text-3xl md:text-4xl tracking-[0.3em] text-transparent bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text font-bold">
                                                {roomData.id}
                                            </span>
                                            <button className="text-gray-500 group-hover:text-white transition-colors">
                                                {copied ? <Check className="w-5 h-5 text-lime-400"/> : <Copy className="w-5 h-5" />}
                                            </button>
                                            
                                            {/* Copied tooltip */}
                                            {copied && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-lime-500 text-black text-xs font-bold rounded-lg">
                                                    Copied!
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-3 justify-center">
                                            <button 
                                                onClick={() => setShowQR(!showQR)}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                                    showQR 
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                <QrCode className="w-4 h-4" />
                                                QR
                                            </button>
                                            <button 
                                                onClick={handleShareLink}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-300"
                                            >
                                                <Share2 className="w-4 h-4" />
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* QR Code Section */}
                                    {showQR && (
                                        <AnimateIn from="opacity-0 scale-90" to="opacity-100 scale-100" duration="duration-300">
                                            <div className="mt-6 pt-6 border-t border-white/10">
                                                <div className="bg-white p-4 rounded-2xl mx-auto w-fit shadow-2xl">
                                                    <QRCodeSVG 
                                                        value={joinUrl} 
                                                        size={180}
                                                        level="H"
                                                        includeMargin={false}
                                                    />
                                                </div>
                                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                                    <Smartphone className="w-4 h-4" />
                                                    <span>Scan to join on mobile</span>
                                                </div>
                                            </div>
                                        </AnimateIn>
                                    )}
                                </div>

                                {/* Players Progress */}
                                <div className="glass-card rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-gray-400 text-sm font-medium">Players Joined</span>
                                        <span className="text-white font-bold text-lg">{playerCount}<span className="text-gray-500 font-normal">/{MAX_PLAYERS}</span></span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-700 ease-out rounded-full"
                                            style={{ width: `${(playerCount / MAX_PLAYERS) * 100}%` }}
                                        ></div>
                                    </div>
                                    {emptySlots > 0 && (
                                        <p className="text-gray-500 text-xs mt-3 flex items-center gap-2">
                                            <Loader className="w-3 h-3 animate-spin" />
                                            Waiting for {emptySlots} more player{emptySlots > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </AnimateIn>

                        {/* Center Column - Players Grid */}
                        <AnimateIn delay={200} from="opacity-0 translate-y-6" to="opacity-100 translate-y-0">
                            <div className="lg:col-span-1">
                                <div className="glass-card rounded-2xl p-6 h-full">
                                    <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-6 font-display">
                                        <Users className="w-5 h-5 text-indigo-400" /> 
                                        Players
                                    </h3>
                                    
                                    {/* 2x2 Player Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Render existing players */}
                                        {Object.entries(roomData.players).map(([id, player], index) => (
                                            <AnimateIn key={id} delay={index * 100} from="opacity-0 scale-90" to="opacity-100 scale-100" duration="duration-400">
                                                <div className={`relative p-4 rounded-2xl transition-all duration-300 hover:scale-[1.03] ${
                                                    userId === id 
                                                        ? 'bg-indigo-500/20 ring-2 ring-indigo-500/50' 
                                                        : 'bg-white/5 hover:bg-white/[0.08]'
                                                }`}>
                                                    {/* Host Crown with Glow */}
                                                    {roomData.leaderId === id && (
                                                        <div className="absolute -top-2 -right-2 animate-glow">
                                                            <div className="relative">
                                                                <span className="text-xl">👑</span>
                                                                <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="text-center">
                                                        {/* Avatar with animated ring */}
                                                        <div className="relative w-16 h-16 mx-auto mb-3">
                                                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${avatarColors[index % 4]} animate-ring`}></div>
                                                            <div className="absolute inset-1 rounded-full bg-[#0F172A] flex items-center justify-center">
                                                                <span className="text-3xl">{player?.avatar || playerAvatars[index % 4]}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="font-semibold text-white text-sm truncate">{player?.name || '...'}</p>
                                                        {userId === id && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] text-indigo-400 font-semibold">You</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </AnimateIn>
                                        ))}
                                        
                                        {/* Empty slots with pulse animation */}
                                        {Array.from({ length: emptySlots }).map((_, index) => (
                                            <div 
                                                key={`empty-${index}`}
                                                className="p-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-white/20 transition-all duration-300"
                                            >
                                                <div className="text-center">
                                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                                                        <span className="text-3xl opacity-20">👤</span>
                                                    </div>
                                                    <p className="font-medium text-gray-600 text-sm">Waiting...</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AnimateIn>

                        {/* Right Column - Game Settings */}
                        <AnimateIn delay={300} from="opacity-0 translate-y-6" to="opacity-100 translate-y-0">
                            <div className="lg:col-span-1">
                                <div className="glass-card rounded-2xl p-6 h-full">
                                    {error && (
                                        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm font-medium">
                                            {error}
                                        </div>
                                    )}

                                    {isLeader ? (
                                        <div className="space-y-6">
                                            <h3 className="font-bold text-lg text-white flex items-center gap-2 font-display">
                                                <Sparkles className="w-5 h-5 text-lime-400 sparkle" />
                                                Game Settings
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-400 mb-3">Quiz Topic</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Space Exploration, 90s Movies..."
                                                        value={topic}
                                                        onChange={(e) => setTopic(e.target.value)}
                                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-lime-500/50 focus:bg-white/[0.08] transition-all duration-300 pr-12"
                                                        disabled={isGenerating}
                                                    />
                                                    <Sparkles className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${topic ? 'text-lime-400 sparkle' : 'text-gray-600'}`} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-400 mb-3">Difficulty</label>
                                                <div className="segmented-control p-1">
                                                    {['Easy', 'Medium', 'Hard'].map(level => (
                                                        <button 
                                                            key={level} 
                                                            onClick={() => setDifficulty(level)} 
                                                            disabled={isGenerating}
                                                            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                                                difficulty === level 
                                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                                                    : 'text-gray-400 hover:text-white'
                                                            }`}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <button
                                                    onClick={() => handleStartGame(topic, difficulty)}
                                                    disabled={!topic || playerCount < 1 || isGenerating}
                                                    className={`btn-3d w-full py-4 px-6 bg-gradient-to-r from-lime-500 to-emerald-500 text-black font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg ${topic && !isGenerating ? 'animate-glow' : ''}`}
                                                >
                                                    {isGenerating ? (
                                                        <>
                                                            <Loader className="w-5 h-5 animate-spin" /> 
                                                            <span>AI Generating Quiz...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Start Game</span>
                                                            <ArrowRight className="w-5 h-5" />
                                                        </>
                                                    )}
                                                </button>
                                                
                                                {!topic && (
                                                    <p className="text-gray-500 text-xs text-center mt-3">Enter a topic to enable start</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                            <div className="relative mb-6">
                                                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                    <Loader className="w-10 h-10 animate-spin text-indigo-400" />
                                                </div>
                                                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
                                            </div>
                                            <h3 className="text-white font-bold text-lg mb-2 font-display">Waiting for Host</h3>
                                            <p className="text-gray-500 text-sm max-w-[200px]">The host will choose a topic and start the game</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AnimateIn>
                    </div>

                    {/* Bottom Tips */}
                    <AnimateIn delay={500} from="opacity-0" to="opacity-100">
                        <div className="mt-8 text-center">
                            <p className="text-gray-600 text-sm">
                                💡 <span className="text-gray-500">Share the QR code or room code for friends to join instantly</span>
                            </p>
                        </div>
                    </AnimateIn>
                </div>
            </div>
        </div>
    );
};

const GameScreen = ({ roomData, userId, handleAnswer }) => {
    const currentQuestionIndex = roomData.currentQuestion;
    const questionData = roomData.questions[currentQuestionIndex];
    const playerAnswerData = roomData.players[userId]?.answers?.[currentQuestionIndex];
    const allPlayersAnswered = Object.values(roomData.players).every(p => p.answers?.[currentQuestionIndex]);

    const [timer, setTimer] = useState(10);
    const [isRevealed, setIsRevealed] = useState(false);
    const intervalRef = useRef(null);
    const hasAnsweredRef = useRef(false);
    const currentQuestionRef = useRef(-1);
    const handleAnswerRef = useRef(handleAnswer);

    // Keep handleAnswer ref up to date
    useEffect(() => {
        handleAnswerRef.current = handleAnswer;
    }, [handleAnswer]);

    useEffect(() => {
        setIsRevealed(allPlayersAnswered);
    }, [allPlayersAnswered]);

    // Track if current player has answered
    useEffect(() => {
        hasAnsweredRef.current = !!playerAnswerData;
    }, [playerAnswerData]);

    // Timer effect - starts immediately when question changes or on mount
    useEffect(() => {
        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Check if this is a new question (or first mount)
        const isNewQuestion = currentQuestionRef.current !== currentQuestionIndex;
        
        if (isNewQuestion) {
            currentQuestionRef.current = currentQuestionIndex;
            hasAnsweredRef.current = false; // Reset for new question
            setTimer(10);
            setIsRevealed(false);
        }

        // Start timer immediately
        intervalRef.current = setInterval(() => {
            setTimer(prevTimer => {
                if (prevTimer > 1) {
                    return prevTimer - 1;
                } else {
                    // Time's up - auto-submit if player hasn't answered
                    if (!hasAnsweredRef.current) {
                        hasAnsweredRef.current = true; // Prevent multiple submissions
                        handleAnswerRef.current(null, 10);
                    }
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    return 0;
                }
            });
        }, 1000);

        // Cleanup on unmount or when question changes
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex]); // Only depend on question index

    const onAnswerClick = (optionIndex) => {
        if (playerAnswerData || hasAnsweredRef.current) return;
        hasAnsweredRef.current = true; // Mark as answered immediately
        const timeTaken = Math.max(0, 10 - timer);
        handleAnswer(optionIndex, timeTaken);
    };

    // Function to get current multiplier based on timer
    const getCurrentMultiplier = () => {
        const timeTaken = Math.max(0, 10 - timer);
        if (timeTaken >= 0 && timeTaken <= 2) {
            return 2;
        } else if (timeTaken > 2 && timeTaken <= 5) {
            return 1.5;
        } else if (timeTaken > 5 && timeTaken <= 9) {
            return 1;
        } else {
            return 0.5;
        }
    };

    // Function to get multiplier color
    const getMultiplierColor = () => {
        const multiplier = getCurrentMultiplier();
        if (multiplier === 2) return 'text-green-500';
        if (multiplier === 1.5) return 'text-yellow-500';
        if (multiplier === 1) return 'text-orange-500';
        return 'text-red-500';
    };

    const getButtonClass = (index) => {
        const playerChoice = playerAnswerData?.answerIndex;
        
        if (!isRevealed) {
            // Show blue when option is selected before reveal
            if (playerChoice === index) {
                return 'bg-blue-500 text-white border-2 border-blue-600 scale-105 shadow-lg transform';
            }
            return 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500';
        }
        
        const isCorrect = index === questionData.correctAnswerIndex;
        
        if (isCorrect) {
            return 'bg-green-500 text-white border-2 border-green-600 scale-105 shadow-lg transform';
        }
        
        if (playerChoice === index && !isCorrect) {
            return 'bg-red-500 text-white border-2 border-red-600 shadow-lg';
        }
        
        return 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 opacity-60 border-2 border-gray-400 dark:border-gray-500';
    };

    // Updated button class for dark theme
    const getButtonClassDark = (index) => {
        const playerChoice = playerAnswerData?.answerIndex;
        
        if (!isRevealed) {
            if (playerChoice === index) {
                return 'bg-violet-600 text-white border-2 border-violet-400 scale-105 shadow-lg shadow-violet-500/25';
            }
            return 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-violet-500/50';
        }
        
        const isCorrect = index === questionData.correctAnswerIndex;
        
        if (isCorrect) {
            return 'bg-emerald-600 text-white border-2 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/25';
        }
        
        if (playerChoice === index && !isCorrect) {
            return 'bg-red-600 text-white border-2 border-red-400 shadow-lg shadow-red-500/25';
        }
        
        return 'bg-white/5 text-gray-500 border border-white/5 opacity-50';
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <AnimateIn>
                    <div className="w-full max-w-4xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <img src="/Quizora.png" alt="Quizora" className="w-8 h-8 rounded-lg" />
                                <span className="text-white font-semibold">Quizora</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400 text-sm">{roomData.topic}</span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                                    {roomData.difficulty}
                                </span>
                            </div>
                        </div>

                        {/* Main Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-violet-600/20 rounded-3xl blur-xl"></div>
                            <div className="relative bg-[#12121a] border border-white/10 rounded-2xl p-8 space-y-6">
                                {/* Progress Bar */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 whitespace-nowrap">
                                        {currentQuestionIndex + 1} / {roomData.questions.length}
                                    </span>
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${((currentQuestionIndex + 1) / roomData.questions.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Timer and Multiplier */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-all duration-300 ${
                                            timer <= 3 ? 'border-red-500 text-red-500 animate-pulse' : 'border-cyan-500 text-cyan-400'
                                        }`}>
                                            {timer}
                                        </div>
                                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 linear ${
                                                    timer <= 3 ? 'bg-red-500' : 'bg-cyan-500'
                                                }`} 
                                                style={{ width: `${Math.max(0, (timer/10)*100)}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {!playerAnswerData && !isRevealed && (
                                        <div className={`px-4 py-2 rounded-full border transition-all duration-300 ${
                                            getCurrentMultiplier() === 2 ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' :
                                            getCurrentMultiplier() === 1.5 ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                                            getCurrentMultiplier() === 1 ? 'border-orange-500 text-orange-400 bg-orange-500/10' :
                                            'border-red-500 text-red-400 bg-red-500/10'
                                        }`}>
                                            <span className="text-lg font-bold">{getCurrentMultiplier()}x</span>
                                        </div>
                                    )}
                                </div>

                                {/* Live Scores */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {Object.entries(roomData.players)
                                        .filter(([, player]) => player && player.name)
                                        .sort(([,a], [,b]) => (b.score || 0) - (a.score || 0))
                                        .map(([id, player], index) => (
                                            <div key={id} className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                                                userId === id 
                                                    ? 'bg-violet-500/20 border border-violet-500/30' 
                                                    : 'bg-white/5 border border-white/5'
                                            }`}>
                                                {index === 0 && <span>🥇</span>}
                                                {index === 1 && <span>🥈</span>}
                                                {index === 2 && <span>🥉</span>}
                                                <span className="text-sm text-white">{player.avatar}</span>
                                                <span className="text-sm text-gray-300 max-w-[80px] truncate">{player.name}</span>
                                                <span className="text-sm font-bold text-cyan-400">{player.score || 0}</span>
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Question */}
                                <AnimateIn key={currentQuestionIndex} from="opacity-0 scale-95" to="opacity-100 scale-100" duration="duration-300">
                                    <div className="text-center py-6">
                                        <h2 className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                                            {questionData.question}
                                        </h2>
                                    </div>
                                    
                                    {/* Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {questionData.options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onAnswerClick(index)}
                                                disabled={!!playerAnswerData}
                                                className={`p-5 rounded-xl text-left font-medium transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-between text-lg ${getButtonClassDark(index)}`}
                                            >
                                                <span>{option}</span>
                                                {isRevealed && (
                                                    index === questionData.correctAnswerIndex 
                                                        ? <Check className="w-6 h-6"/> 
                                                        : (playerAnswerData?.answerIndex === index && <X className="w-6 h-6"/>)
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </AnimateIn>
                                
                                {/* Status */}
                                <div className="h-6 text-center text-sm text-gray-500">
                                    {playerAnswerData && !isRevealed && "Waiting for other players..."}
                                    {isRevealed && "Next question coming up..."}
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimateIn>
            </div>
        </div>
    );
};

const ScoreboardScreen = ({ roomData, userId, handlePlayAgain, handleExitToHome }) => {
    const [showContent, setShowContent] = useState(false);
    const [showPodium, setShowPodium] = useState(false);
    const [showStandings, setShowStandings] = useState(false);
    const [showActions, setShowActions] = useState(false);
    
    const sortedPlayers = useMemo(() => {
        return Object.entries(roomData.players)
            .filter(([, player]) => player && player.name)
            .sort(([, a], [, b]) => (b.score || 0) - (a.score || 0));
    }, [roomData.players]);

    const isLeader = roomData.leaderId === userId;
    
    // Get top 3 for podium
    const first = sortedPlayers[0];
    const second = sortedPlayers[1];
    const third = sortedPlayers[2];
    const restPlayers = sortedPlayers.slice(3);

    // Trigger confetti and staggered animations
    useEffect(() => {
        // Fire confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const fireConfetti = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#ffd700', '#ffb700', '#ff9500', '#84CC16', '#22d3ee']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#ffd700', '#ffb700', '#ff9500', '#84CC16', '#22d3ee']
            });

            if (Date.now() < end) {
                requestAnimationFrame(fireConfetti);
            }
        };

        // Big burst at start
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ffb700', '#ff9500', '#84CC16', '#22d3ee', '#a855f7']
        });

        fireConfetti();

        // Staggered content reveal
        setTimeout(() => setShowContent(true), 300);
        setTimeout(() => setShowPodium(true), 800);
        setTimeout(() => setShowStandings(true), 1400);
        setTimeout(() => setShowActions(true), 1800);
    }, []);

    // Find current user's position
    const userPosition = sortedPlayers.findIndex(([id]) => id === userId) + 1;
    const userPlayer = roomData.players[userId];

    return (
        <div className="min-h-screen w-full bg-[#0F172A] relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* God rays effect for winner */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 via-amber-500/10 to-transparent blur-3xl animate-pulse"></div>
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(251,191,36,0.1),transparent,rgba(251,191,36,0.1),transparent)] animate-spin" style={{ animationDuration: '20s' }}></div>
                </div>
                
                {/* Ambient orbs */}
                <div className="absolute top-1/4 left-10 w-[300px] h-[300px] bg-violet-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-10 w-[250px] h-[250px] bg-cyan-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Grain texture */}
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
                {/* Game Over Title */}
                <div className={`text-center mb-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
                    <h1 className="text-5xl md:text-7xl font-black mb-3 tracking-tight">
                        <span className="text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text">
                            GAME OVER
                        </span>
                    </h1>
                    
                    {/* Topic Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                        <span className="text-gray-400 text-sm">
                            {roomData.topic}
                        </span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            roomData.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                            roomData.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {roomData.difficulty}
                        </span>
                    </div>
                </div>

                {/* Podium Section */}
                <div className={`w-full max-w-2xl mb-8 transition-all duration-1000 delay-300 ${showPodium ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex items-end justify-center gap-3 md:gap-6">
                        
                        {/* 2nd Place */}
                        {second && (
                            <div className="flex flex-col items-center">
                                <div className="relative mb-3">
                                    {/* Avatar ring */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 p-[3px]">
                                        <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center">
                                            <span className="text-3xl md:text-4xl">😊</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xl">🥈</div>
                                </div>
                                <p className="text-white font-semibold text-sm md:text-base truncate max-w-[80px] md:max-w-[100px]">{second[1].name}</p>
                                <p className="text-gray-400 text-lg md:text-xl font-bold">{second[1].score}</p>
                                
                                {/* Podium base */}
                                <div className="w-20 md:w-28 h-16 md:h-20 mt-3 rounded-t-lg bg-gradient-to-b from-gray-500/30 to-gray-600/20 border border-gray-500/30 flex items-center justify-center">
                                    <span className="text-3xl md:text-4xl font-black text-gray-500/50">2</span>
                                </div>
                            </div>
                        )}
                        
                        {/* 1st Place - Winner */}
                        {first && (
                            <div className="flex flex-col items-center -mt-6">
                                <div className="relative mb-3">
                                    {/* Glow effect */}
                                    <div className="absolute -inset-3 bg-yellow-500/30 rounded-full blur-xl animate-pulse"></div>
                                    
                                    {/* Crown */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce" style={{ animationDuration: '2s' }}>👑</div>
                                    
                                    {/* Avatar ring */}
                                    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-[4px]">
                                        <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center">
                                            <span className="text-4xl md:text-5xl">🏆</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-2xl">🥇</div>
                                </div>
                                
                                <p className="text-white font-bold text-base md:text-lg truncate max-w-[100px] md:max-w-[120px]">{first[1].name}</p>
                                <p className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text">
                                    {first[1].score}
                                </p>
                                <span className="text-xs text-gray-500 mt-1">points</span>
                                
                                {/* Podium base */}
                                <div className="w-24 md:w-32 h-24 md:h-28 mt-3 rounded-t-lg bg-gradient-to-b from-yellow-500/30 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] animate-shimmer"></div>
                                    <span className="text-4xl md:text-5xl font-black text-yellow-500/50">1</span>
                                </div>
                            </div>
                        )}
                        
                        {/* 3rd Place */}
                        {third && (
                            <div className="flex flex-col items-center">
                                <div className="relative mb-3">
                                    {/* Avatar ring */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 p-[3px]">
                                        <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center">
                                            <span className="text-3xl md:text-4xl">😊</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xl">🥉</div>
                                </div>
                                <p className="text-white font-semibold text-sm md:text-base truncate max-w-[80px] md:max-w-[100px]">{third[1].name}</p>
                                <p className="text-gray-400 text-lg md:text-xl font-bold">{third[1].score}</p>
                                
                                {/* Podium base */}
                                <div className="w-20 md:w-28 h-12 md:h-14 mt-3 rounded-t-lg bg-gradient-to-b from-amber-700/30 to-amber-800/20 border border-amber-600/30 flex items-center justify-center">
                                    <span className="text-3xl md:text-4xl font-black text-amber-700/50">3</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Your Result (if not in top 3) */}
                {userPosition > 3 && userPlayer && (
                    <div className={`w-full max-w-md mb-6 transition-all duration-700 ${showStandings ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="bg-violet-500/10 backdrop-blur-md border border-violet-500/30 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-violet-400">#{userPosition}</span>
                                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                    <span className="text-xl">😊</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{userPlayer.name}</p>
                                    <p className="text-xs text-violet-400">Your position</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-cyan-400">{userPlayer.score}</p>
                        </div>
                    </div>
                )}

                {/* Rest of Standings (4th place onwards) */}
                {restPlayers.length > 0 && (
                    <div className={`w-full max-w-md mb-8 transition-all duration-700 delay-200 ${showStandings ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Other Players</h3>
                            <div className="space-y-2">
                                {restPlayers.map(([id, player], index) => (
                                    <div 
                                        key={id}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                            userId === id ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-500 w-6">#{index + 4}</span>
                                            <span className="text-lg">😊</span>
                                            <span className="text-white text-sm">{player.name}</span>
                                            {userId === id && <span className="text-[10px] text-violet-400">(You)</span>}
                                        </div>
                                        <span className="text-sm font-bold text-gray-400">{player.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className={`w-full max-w-md transition-all duration-700 delay-300 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {isLeader ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handlePlayAgain}
                                className="flex-1 group relative py-4 px-6 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/25"
                            >
                                {/* Pulse animation */}
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 animate-pulse bg-white/10"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    <RotateCcw className="w-5 h-5" />
                                    Play Again
                                </span>
                            </button>
                            <button
                                onClick={handleExitToHome}
                                className="flex-1 py-4 px-6 bg-transparent border-2 border-white/20 text-gray-300 font-semibold rounded-xl hover:bg-white/5 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Exit Lobby
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
                            <Loader className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
                            <p className="text-white font-medium mb-1">Waiting for host</p>
                            <p className="text-gray-500 text-sm">The room leader will start the next game</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};


// Main App Component
export default function App() {
    const [userId, setUserId] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [roomData, setRoomData] = useState(null);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [pendingJoinCode, setPendingJoinCode] = useState(null);

    // Check for join code in URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const joinCode = params.get('join');
        if (joinCode) {
            setPendingJoinCode(joinCode.toUpperCase());
            // Clean up URL without reload
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Connect to Socket.io server
    useEffect(() => {
        const socket = socketService.connect();

        socket.on('connect', () => {
            setUserId(socket.id);
            setIsConnected(true);
            setError('');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('connect_error', () => {
            setError('Could not connect to game server. Make sure the server is running.');
            setIsConnected(false);
        });

        // Room events
        socket.on('room-created', ({ roomCode, roomData, userId }) => {
            setRoomCode(roomCode);
            setRoomData(roomData);
            setUserId(userId);
        });

        socket.on('room-joined', ({ roomCode, roomData, userId }) => {
            setRoomCode(roomCode);
            setRoomData(roomData);
            setUserId(userId);
        });

        socket.on('room-updated', ({ roomData }) => {
            setRoomData(roomData);
        });

        socket.on('generating-questions', () => {
            setIsGenerating(true);
        });

        socket.on('game-started', ({ roomData }) => {
            setRoomData(roomData);
            setIsGenerating(false);
        });

        socket.on('answers-revealed', ({ roomData }) => {
            setRoomData(roomData);
        });

        socket.on('next-question', ({ roomData }) => {
            setRoomData(roomData);
        });

        socket.on('game-finished', ({ roomData }) => {
            setRoomData(roomData);
        });

        socket.on('error', ({ message }) => {
            setError(message);
            setIsGenerating(false);
        });

        return () => {
            socketService.removeAllListeners();
            socketService.disconnect();
        };
    }, []);

    const handleCreateRoom = () => {
        if (!playerName.trim()) return setError('Please enter your name.');
        setError('');
        socketService.createRoom(playerName);
    };

    const handleJoinRoom = (codeToJoin) => {
        if (!playerName.trim() || !codeToJoin.trim()) return setError('Please enter your name and a room code.');
        setError('');
        socketService.joinRoom(codeToJoin.toUpperCase(), playerName);
    };
    
    const handleStartGame = (topic, difficulty) => {
        if (!topic) return;
        setError('');
        socketService.startGame(topic, difficulty);
    };

    const handleAnswer = (answerIndex, timeTaken) => {
        socketService.submitAnswer(answerIndex, timeTaken);
    };
    
    const handlePlayAgain = () => {
        socketService.playAgain();
    };

    const handleExitToHome = () => {
        socketService.leaveRoom();
        setRoomData(null);
    };

    const renderContent = () => {
        if (!isConnected) {
            return (
                <div className="min-h-screen w-full bg-[#0a0a0f] flex items-center justify-center">
                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <Loader className="w-12 h-12 animate-spin text-violet-500" />
                        <p className="text-lg font-medium text-gray-400">Connecting to server...</p>
                    </div>
                </div>
            );
        }
        if (error && !roomData) {
            return (
                <div className="min-h-screen w-full bg-[#0a0a0f] flex items-center justify-center p-6">
                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px]"></div>
                    </div>
                    <div className="relative z-10 max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button 
                            onClick={() => setError('')} 
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            );
        }
        if (roomData) {
            switch (roomData.gameState) {
                case 'lobby': return <LobbyScreen roomData={roomData} userId={userId} handleStartGame={handleStartGame} isGenerating={isGenerating} error={error} />;
                case 'in-game': return <GameScreen roomData={roomData} userId={userId} handleAnswer={handleAnswer} />;
                case 'finished': return <ScoreboardScreen roomData={roomData} userId={userId} handlePlayAgain={handlePlayAgain} handleExitToHome={handleExitToHome} />;
                default: return <p className="text-white">Unknown game state.</p>;
            }
        }
        return <HomeScreen setPlayerName={setPlayerName} playerName={playerName} handleJoinRoom={handleJoinRoom} handleCreateRoom={handleCreateRoom} pendingJoinCode={pendingJoinCode} setPendingJoinCode={setPendingJoinCode} />;
    };

    return (
        <div className="min-h-screen w-full font-sans">
            {renderContent()}
        </div>
    );
}
