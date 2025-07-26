import React, { useState, useEffect, useMemo, useRef } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { ArrowRight, Users, Crown, Loader, BrainCircuit, Check, X, Copy, PartyPopper } from 'lucide-react';
import { auth, db } from './firebase';

// --- Firebase Configuration ---

// --- Helper Functions ---
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- Animation Wrapper ---
const AnimateIn = ({ children, from = 'opacity-0 -translate-y-4', to = 'opacity-100 translate-y-0', duration = 'duration-500' }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 10); // Small delay to ensure transition triggers
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`transition-all ease-in-out ${duration} ${mounted ? to : from}`}>
            {children}
        </div>
    );
};


// --- React Components ---

const PlayerCard = ({ player, isLeader, isSelf, score, rank }) => (
    <div className={`p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${isSelf ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : 'bg-gray-100 dark:bg-gray-700'}`}>
        <div className="flex items-center gap-4">
            {rank && <span className="text-xl font-bold w-8 text-center text-gray-400 dark:text-gray-500">{rank}</span>}
            <span className="text-3xl">{player?.avatar || '🧑‍🚀'}</span>
            <span className="font-medium text-lg text-gray-800 dark:text-gray-200">{player?.name || 'Loading...'}</span>
        </div>
        <div className="flex items-center gap-4">
            {score !== undefined && <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">{score} pts</span>}
            {isLeader && <Crown className="w-6 h-6 text-yellow-500" />}
        </div>
    </div>
);

const HomeScreen = ({ setPlayerName, handleJoinRoom, handleCreateRoom, playerName }) => {
    const [isJoining, setIsJoining] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [currentFact, setCurrentFact] = useState(0);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [dailyChallenge] = useState({ topic: 'Ancient Civilizations', reward: '500 XP', timeLeft: '14:32:18' });

    // Enhanced mock data
    const trendingTopics = [
        { icon: '🌍', topic: 'Geography', players: 1247, difficulty: 'Medium' },
        { icon: '🧬', topic: 'Science', players: 892, difficulty: 'Hard' },
        { icon: '📚', topic: 'Literature', players: 634, difficulty: 'Easy' },
        { icon: '🎬', topic: 'Movies', players: 523, difficulty: 'Medium' }
    ];

    const leaderboard = [
        { name: 'QuizMaster42', score: 15420, avatar: '👑', streak: 12 },
        { name: 'BrainStorm', score: 14890, avatar: '🧠', streak: 8 },
        { name: 'Genius_Kid', score: 13567, avatar: '⭐', streak: 15 },
        { name: 'FactHunter', score: 12003, avatar: '🎯', streak: 5 }
    ];

    const funFacts = [
        "🐙 Octopuses have three hearts and blue blood!",
        "🌙 A day on Venus is longer than its year!",
        "🦆 Ducks have three eyelids on each eye!",
        "🍯 Honey never spoils - archaeologists found edible honey in ancient tombs!",
        "🧠 Your brain uses 20% of your body's total energy!",
        "🦋 Butterflies taste with their feet!",
        "🌊 There are more possible games of chess than atoms in the observable universe!"
    ];

    const quickPlayTopics = [
        { emoji: '🚀', topic: 'Space', color: 'from-blue-500 to-purple-600' },
        { emoji: '🏛️', topic: 'History', color: 'from-amber-500 to-orange-600' },
        { emoji: '🔬', topic: 'Science', color: 'from-green-500 to-teal-600' },
        { emoji: '🎨', topic: 'Art', color: 'from-pink-500 to-rose-600' }
    ];

    const pricingPlans = [
        {
            name: 'Basic Premium',
            price: '₹99',
            duration: '/month',
            features: [
                'Detailed Analytics',
                'Performance Trends',
                'Category Breakdown',
                'Ad-free Experience'
            ],
            popular: false
        },
        {
            name: 'Pro Premium',
            price: '₹199',
            duration: '/month',
            features: [
                'All Basic Features',
                'Advanced Analytics',
                'Competitive Ranking',
                'Custom Themes',
                'Priority Support',
                'Exclusive Challenges'
            ],
            popular: true
        },
        {
            name: 'Annual Pro',
            price: '₹1,999',
            duration: '/year',
            features: [
                'All Pro Features',
                '2 Months Free',
                'Advanced AI Insights',
                'Personal Coach',
                'Unlimited Practice'
            ],
            popular: false
        }
    ];

    // Rotate fun facts every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFact((prev) => (prev + 1) % funFacts.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [funFacts.length]);

    const handleQuickPlay = (topic) => {
        if (!playerName.trim()) {
            setPlayerName(`Player_${Math.random().toString(36).substr(2, 6)}`);
        }
        // Set the topic for quick play and create room
        console.log(`Starting quick play with topic: ${topic}`);
        handleCreateRoom();
    };

    const handleUpgradeClick = () => {
        setShowPricingModal(true);
    };

    const handlePlanSelect = (plan) => {
        console.log(`Selected plan: ${plan.name} for ${plan.price}`);
        // Here you would integrate with your payment processor
        alert(`Redirecting to payment for ${plan.name} - ${plan.price}${plan.duration}`);
        setShowPricingModal(false);
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Enhanced Background texture and animations */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/50"></div>
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-16 left-16 w-24 h-24 bg-purple-300 dark:bg-purple-700 rounded-full animate-pulse"></div>
                <div className="absolute top-1/4 right-24 w-20 h-20 bg-blue-300 dark:bg-blue-700 rounded-full animate-bounce"></div>
                <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-green-300 dark:bg-green-700 rounded-full animate-ping"></div>
                <div className="absolute top-2/3 right-1/4 w-12 h-12 bg-yellow-300 dark:bg-yellow-700 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/6 w-14 h-14 bg-pink-300 dark:bg-pink-700 rounded-full animate-bounce"></div>
                <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-orange-300 dark:bg-orange-700 rounded-full animate-ping"></div>
            </div>

            {/* Main responsive content */}
            <div className="relative z-10 min-h-screen w-full p-2 sm:p-4 lg:p-6">
                
                {/* Header - 3-column grid: Did You Know | Title | Premium Feature */}
                <div className="mb-4 lg:mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
                        {/* Did You Know - Left */}
                        <div className="lg:col-span-3 flex justify-center lg:justify-start order-2 lg:order-1 mb-4 lg:mb-0">
                            <AnimateIn from="opacity-0 -translate-x-12" to="opacity-100 translate-x-0" duration="duration-800">
                                <div className="bg-gradient-to-r from-purple-500/25 to-blue-500/25 dark:from-purple-600/25 dark:to-blue-700/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-purple-300/60 dark:border-purple-600/60 w-full max-w-xs">
                                    <h3 className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300 mb-2">💡 Did You Know?</h3>
                                    <AnimateIn key={currentFact} from="opacity-0 translate-y-2" to="opacity-100 translate-y-0" duration="duration-500">
                                        <p className="text-purple-800 dark:text-purple-200 font-medium text-xs sm:text-sm">{funFacts[currentFact]}</p>
                                    </AnimateIn>
                                </div>
                            </AnimateIn>
                        </div>

                        {/* Title - Center */}
                        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
                            <AnimateIn>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="relative flex items-center justify-center">
                                        <BrainCircuit className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-indigo-500 animate-pulse" />
                                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full animate-bounce flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">∞</span>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-800 dark:text-white mt-2 lg:mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
                                        AI Quiz Clash
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-300 mt-1 lg:mt-2 text-sm sm:text-base lg:text-lg text-center">Where knowledge meets competition</p>
                                </div>
                            </AnimateIn>
                        </div>

                        {/* Premium Feature - Right */}
                        <div className="lg:col-span-3 flex justify-center lg:justify-end order-3 mb-4 lg:mb-0">
                            <AnimateIn from="opacity-0 translate-x-12" to="opacity-100 translate-x-0" duration="duration-800">
                                <div className="relative bg-gradient-to-r from-gray-400/25 to-gray-600/25 dark:from-gray-600/25 dark:to-gray-800/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-300/60 dark:border-gray-600/60 w-full max-w-xs">
                                    {/* Lock overlay */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <div className="text-xl sm:text-2xl mb-1">🔒</div>
                                            <h3 className="text-xs sm:text-sm font-bold mb-1">Premium Feature</h3>
                                            <p className="text-xs opacity-90 mb-2">Unlock analytics</p>
                                            <button 
                                                onClick={handleUpgradeClick}
                                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-1 px-2 sm:py-1 sm:px-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-xs">
                                                Upgrade Now
                                            </button>
                                        </div>
                                    </div>
                                    {/* Background content (blurred) */}
                                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white mb-2">📈 Analytics</h3>
                                    <div className="space-y-2 opacity-50">
                                        <div className="bg-white/50 dark:bg-gray-700/50 p-1 rounded">
                                            <p className="text-xs font-semibold">Performance</p>
                                            <div className="w-full h-1 bg-gray-200 rounded mt-1"></div>
                                        </div>
                                        <div className="bg-white/50 dark:bg-gray-700/50 p-1 rounded">
                                            <p className="text-xs font-semibold">Categories</p>
                                            <div className="grid grid-cols-3 gap-1 mt-1">
                                                <div className="h-1 bg-blue-300 rounded"></div>
                                                <div className="h-1 bg-green-300 rounded"></div>
                                                <div className="h-1 bg-purple-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimateIn>
                        </div>
                    </div>
                </div>

                {/* Main content grid - responsive layout, full height for alignment */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch min-h-[60vh] lg:min-h-[60vh]" style={{height: '60vh'}}>
                    {/* Left Column - Trending & Stats */}
                    <div className="lg:col-span-3 flex flex-col h-full gap-6">
                        {/* Trending Topics */}
                        <AnimateIn from="opacity-0 -translate-x-12 translate-y-8" to="opacity-100 translate-x-0 translate-y-0" duration="duration-900">
                            <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                                <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                                    🔥 Trending Now
                                </h3>
                                <div className="space-y-2">
                                    {trendingTopics.slice(0, 3).map((topic, index) => (
                                        <AnimateIn key={topic.topic} from="opacity-0 -translate-x-4" to="opacity-100 translate-x-0" duration="duration-300">
                                            <div 
                                                style={{ transitionDelay: `${index * 150}ms` }} 
                                                className="flex items-center justify-between p-2 bg-gray-50/90 dark:bg-gray-700/90 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-600/90 transition-all duration-200 cursor-pointer transform hover:scale-105"
                                                onClick={() => handleQuickPlay(topic.topic)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{topic.icon}</span>
                                                    <div>
                                                        <span className="font-semibold text-gray-800 dark:text-gray-200 block text-xs sm:text-sm">{topic.topic}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{topic.difficulty} Level</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{topic.players}</span>
                                            </div>
                                        </AnimateIn>
                                    ))}
                                </div>
                            </div>
                        </AnimateIn>
                        {/* Live Stats */}
                        <AnimateIn from="opacity-0 -translate-x-12 translate-y-8" to="opacity-100 translate-x-0 translate-y-0" duration="duration-1000">
                            <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">📊 Live Stats</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <p className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">4.2k</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Players Online</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">127</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Rooms</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">∞</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Questions</p>
                                    </div>
                                </div>
                            </div>
                        </AnimateIn>
                    </div>

                    {/* Center Column - Main "Join the Battle" Section - Vertically centered */}
                    <div className="lg:col-span-6 flex flex-col h-full">
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <AnimateIn from="opacity-0 scale-90" to="opacity-100 scale-100">
                                <div className="w-full max-w-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-indigo-200/60 dark:border-indigo-700/60">
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4 lg:mb-6 text-center flex items-center justify-center gap-2 lg:gap-3">
                                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
                                        Join the Battle
                                    </h2>
                                    <div className="space-y-4 sm:space-y-5">
                                        <input
                                            type="text"
                                            placeholder="Enter your warrior name"
                                            value={playerName}
                                            onChange={(e) => setPlayerName(e.target.value)}
                                            className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-3 border-gray-200 dark:border-gray-600 focus:border-indigo-500 rounded-xl outline-none transition-all duration-300 text-center text-lg sm:text-xl font-medium"
                                        />
                                        {isJoining && (
                                            <AnimateIn from="opacity-0 scale-95" to="opacity-100 scale-100" duration="duration-300">
                                                <input
                                                    type="text"
                                                    placeholder="Enter battle code"
                                                    maxLength="6"
                                                    value={joinCode}
                                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                    className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-3 border-gray-200 dark:border-gray-600 focus:border-indigo-500 rounded-xl outline-none transition-all duration-300 text-center font-mono tracking-widest text-lg sm:text-xl"
                                                />
                                            </AnimateIn>
                                        )}
                                        <button 
                                            onClick={isJoining ? () => handleJoinRoom(joinCode) : handleCreateRoom} 
                                            disabled={!playerName || (isJoining && !joinCode.trim())}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-lg sm:text-xl shadow-2xl">
                                            {isJoining ? <>Join Battle <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" /></> : 'Create Battle Room'}
                                        </button>
                                        <button onClick={() => setIsJoining(!isJoining)} className="text-center text-base sm:text-lg text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200 w-full font-medium">
                                            {isJoining ? 'or create a new battle room' : 'Have a battle code? Join instead'}
                                        </button>
                                    </div>
                                </div>
                            </AnimateIn>
                        </div>
                        <div className="flex-1 flex flex-col justify-end w-full items-center">
                            {/* Quick Play Modes */}
                            <AnimateIn from="opacity-0 translate-y-8" to="opacity-100 translate-y-0" duration="duration-800">
                        <div className="w-full max-w-2xl bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50" style={{height: '75%'}}>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 text-center flex items-center justify-center gap-2">
                                ⚡ Quick Play Modes
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {quickPlayTopics.map((item, index) => (
                                    <AnimateIn key={item.topic} from="opacity-0 scale-90" to="opacity-100 scale-100" duration="duration-300">
                                        <button
                                            onClick={() => handleQuickPlay(item.topic)}
                                            disabled={!playerName}
                                            style={{ transitionDelay: `${index * 100}ms` }}
                                            className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${item.color} text-white font-semibold transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg`}
                                        >
                                            <div className="text-2xl sm:text-3xl mb-1">{item.emoji}</div>
                                            <div className="text-xs sm:text-sm font-bold">{item.topic}</div>
                                        </button>
                                    </AnimateIn>
                                ))}
                            </div>
                        </div>
                            </AnimateIn>
                        </div>
                    </div>

                    {/* Right Column - Daily Challenge, Hall of Fame - Start from top */}
                    <div className="lg:col-span-3 flex flex-col h-full gap-6">
                        {/* Daily Challenge */}
                        <AnimateIn from="opacity-0 translate-x-12" to="opacity-100 translate-x-0" duration="duration-800">
                            <div className="bg-gradient-to-br from-yellow-400/25 to-orange-500/25 dark:from-yellow-600/25 dark:to-orange-700/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-yellow-300/60 dark:border-yellow-600/60">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2">
                                        🏆 Daily Challenge
                                    </h3>
                                    <span className="text-xs font-mono text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/60 px-2 py-1 rounded-lg">
                                        {dailyChallenge.timeLeft}
                                    </span>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                        <span className="font-bold">Topic:</span> {dailyChallenge.topic}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                        <span className="font-bold">Reward:</span> {dailyChallenge.reward}
                                    </p>
                                    <button 
                                        onClick={() => handleQuickPlay(dailyChallenge.topic)}
                                        disabled={!playerName}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-2 sm:py-3 px-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-xs sm:text-sm">
                                        Accept Challenge
                                    </button>
                                </div>
                            </div>
                        </AnimateIn>
                        {/* Hall of Fame */}
                        <AnimateIn from="opacity-0 translate-x-12 translate-y-8" to="opacity-100 translate-x-0 translate-y-0" duration="duration-900">
                            <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                                <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                                    👑 Hall of Fame
                                </h3>
                                <div className="space-y-2">
                                    {leaderboard.slice(0, 3).map((player, index) => (
                                        <AnimateIn key={player.name} from="opacity-0 translate-x-4" to="opacity-100 translate-x-0" duration="duration-300">
                                            <div style={{ transitionDelay: `${index * 150}ms` }} className="flex items-center justify-between p-2 bg-gray-50/90 dark:bg-gray-700/90 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 text-center font-bold text-sm">
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                    </span>
                                                    <span className="text-lg">{player.avatar}</span>
                                                    <div>
                                                        <span className="font-semibold text-gray-800 dark:text-gray-200 block text-xs sm:text-sm">{player.name}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">🔥 {player.streak} streak</span>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">{player.score.toLocaleString()}</span>
                                            </div>
                                        </AnimateIn>
                                    ))}
                                </div>
                            </div>
                        </AnimateIn>
                    </div>
                </div>

                {/* Bottom Features - 3-column grid for symmetry */}
                <div className="mt-4 lg:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end">
                    <div className="lg:col-span-3"></div>
                    <div className="lg:col-span-6 flex flex-col items-center">
                        <AnimateIn from="opacity-0 translate-y-8" to="opacity-100 translate-y-0" duration="duration-1200">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Real-time</span> multiplayer experience
                                    </p>
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">AI-powered</span> question generation
                                    </p>
                                </div>
                            </div>
                        </AnimateIn>
                    </div>
                    <div className="lg:col-span-3"></div>
                </div>
            </div>

            {/* Pricing Modal */}
            {showPricingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <AnimateIn from="opacity-0 scale-90" to="opacity-100 scale-100" duration="duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Choose Your Premium Plan</h2>
                                <button 
                                    onClick={() => setShowPricingModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-6">
                                {pricingPlans.map((plan) => (
                                    <div key={plan.name} className={`relative rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                                        plan.popular 
                                            ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
                                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                                    }`}>
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{plan.name}</h3>
                                            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {plan.price}<span className="text-lg text-gray-500">{plan.duration}</span>
                                            </div>
                                        </div>
                                        
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center gap-3">
                                                    <span className="text-green-500">✓</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <button
                                            onClick={() => handlePlanSelect(plan)}
                                            className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                                                plan.popular
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                                            }`}
                                        >
                                            {plan.popular ? 'Get Pro Now' : 'Select Plan'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 text-center">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    All plans include 7-day free trial • Cancel anytime • Secure payment with Razorpay
                                </p>
                            </div>
                        </div>
                    </AnimateIn>
                </div>
            )}
        </div>
    );
};

const LobbyScreen = ({ roomData, userId, handleStartGame, isGenerating }) => {
    const isLeader = roomData.leaderId === userId;
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(roomData.id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            console.error('Failed to copy!', err);
        });
    };

    return (
        <AnimateIn>
            <div className="w-full max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl space-y-6">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Room Code</p>
                    <div className="mt-2 inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg cursor-pointer" onClick={handleCopy}>
                        <span className="font-mono text-3xl tracking-widest text-indigo-600 dark:text-indigo-400">{roomData.id}</span>
                        <button className="text-gray-500 hover:text-indigo-500">
                            {copied ? <Check className="text-green-500"/> : <Copy />}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-xl dark:text-white flex items-center gap-2"><Users className="w-6 h-6" /> Players ({Object.keys(roomData.players).length})</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                        {Object.entries(roomData.players).map(([id, player]) => (
                            <AnimateIn key={id} from="opacity-0 -translate-x-4" to="opacity-100 translate-x-0">
                                <PlayerCard player={player} isLeader={roomData.leaderId === id} isSelf={userId === id} />
                            </AnimateIn>
                        ))}
                    </div>
                </div>

                {isLeader && (
                    <AnimateIn>
                        <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="font-bold text-xl dark:text-white mb-3">1. Choose a Topic</h3>
                                <input
                                    type="text"
                                    placeholder="e.g., 'The Roman Empire' or 'Quantum Physics'"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 rounded-lg outline-none transition-all duration-300 text-lg"
                                    disabled={isGenerating}
                                />
                            </div>
                             <div>
                                <h3 className="font-bold text-xl dark:text-white mb-3">2. Select Difficulty</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(level => (
                                        <button key={level} onClick={() => setDifficulty(level)} className={`p-3 rounded-lg font-semibold transition-all duration-200 ${difficulty === level ? 'bg-indigo-600 text-white scale-105' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => handleStartGame(topic, difficulty)}
                                disabled={!topic || Object.keys(roomData.players).length < 1 || isGenerating}
                                className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-lg"
                            >
                                {isGenerating ? (<><Loader className="w-6 h-6 animate-spin" /> Generating Quiz...</>) : 'Start Game'}
                            </button>
                        </div>
                    </AnimateIn>
                )}
                {!isLeader && (
                     <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg mt-6">
                        <p className="font-medium text-blue-800 dark:text-blue-200">The room leader is choosing a topic to begin...</p>
                    </div>
                )}
            </div>
        </AnimateIn>
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
    const currentQuestionRef = useRef(currentQuestionIndex);

    useEffect(() => {
        setIsRevealed(allPlayersAnswered);
    }, [allPlayersAnswered]);

    // Track if current player has answered
    useEffect(() => {
        hasAnsweredRef.current = !!playerAnswerData;
    }, [playerAnswerData]);

    // Timer effect - only depends on question changes
    useEffect(() => {
        // Only reset if this is actually a new question
        if (currentQuestionRef.current !== currentQuestionIndex) {
            currentQuestionRef.current = currentQuestionIndex;
            hasAnsweredRef.current = false;
            setTimer(10);
            setIsRevealed(false);
            
            // Clear any existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            
            // Start new timer - runs independently for full 10 seconds
            intervalRef.current = setInterval(() => {
                setTimer(t => {
                    if (t > 1) {
                        return t - 1;
                    } else {
                        // Auto-submit if time runs out and player hasn't answered
                        if (!hasAnsweredRef.current) {
                            handleAnswer(null, 10);
                        }
                        // Keep timer at 0 but don't stop the interval
                        return 0;
                    }
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [currentQuestionIndex, handleAnswer]);

    const onAnswerClick = (optionIndex) => {
        if (playerAnswerData) return;
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

    return (
        <AnimateIn>
            <div className="w-full max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl space-y-8">
                {/* Progress and Timer Bar */}
                <div>
                    <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <span>Question {currentQuestionIndex + 1} / {roomData.questions.length}</span>
                        <span>{roomData.topic} ({roomData.difficulty})</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / roomData.questions.length) * 100}%` }}></div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                        <div className="bg-yellow-400 h-1.5 rounded-full transition-all duration-1000 linear" style={{ width: `${Math.max(0, (timer/10)*100)}%`}}></div>
                    </div>
                    
                    {/* Dynamic Multiplier Display */}
                    {!playerAnswerData && !isRevealed && (
                        <div className="flex justify-center items-center mt-4">
                            <div className={`px-4 py-2 rounded-full border-2 transition-all duration-300 ${getMultiplierColor()} border-current`}>
                                <span className="text-lg font-bold">
                                    {getCurrentMultiplier()}x Multiplier
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {/* Timer Display */}
                    <div className="text-center mt-2">
                        <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                            {timer}s
                        </span>
                    </div>
                </div>

                {/* Live Scores */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 text-center">Live Scores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(roomData.players)
                            .filter(([, player]) => player && player.name) // Filter out invalid players
                            .sort(([,a], [,b]) => (b.score || 0) - (a.score || 0)) // Safe sorting with fallback to 0
                            .map(([id, player]) => (
                                <div key={id} className={`p-3 rounded-lg text-center transition-all duration-300 ${
                                    userId === id 
                                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' 
                                        : 'bg-white dark:bg-gray-600'
                                }`}>
                                    <div className="text-lg mb-1">{player.avatar || '🧑‍🚀'}</div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {player.name || 'Unknown Player'}
                                    </div>
                                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        {player.score || 0}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <AnimateIn key={currentQuestionIndex} from="opacity-0 scale-95" to="opacity-100 scale-100" duration="duration-300">
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">{questionData.question}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {questionData.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => onAnswerClick(index)}
                                disabled={!!playerAnswerData}
                                className={`p-5 rounded-xl text-left font-medium transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-between text-lg ${getButtonClass(index)}`}
                            >
                               <span>{option}</span>
                               {isRevealed && (index === questionData.correctAnswerIndex ? <Check/> : (playerAnswerData?.answerIndex === index && <X/>))}
                            </button>
                        ))}
                    </div>
                </AnimateIn>
                
                <div className="h-6 pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {playerAnswerData && !isRevealed && "Waiting for other players..."}
                    {isRevealed && "Next question coming up..."}
                </div>
            </div>
        </AnimateIn>
    );
};

const ScoreboardScreen = ({ roomData, userId, handlePlayAgain }) => {
    const sortedPlayers = useMemo(() => {
        return Object.entries(roomData.players)
            .filter(([, player]) => player && player.name) // Filter out invalid players
            .sort(([, a], [, b]) => (b.score || 0) - (a.score || 0)); // Safe sorting with fallback
    }, [roomData.players]);

    const isLeader = roomData.leaderId === userId;

    return (
        <AnimateIn>
            <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl space-y-6">
                <div className="text-center">
                    <PartyPopper className="w-20 h-20 mx-auto text-yellow-500" />
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-white mt-4">Final Scores</h2>
                    <p className="text-gray-500 dark:text-gray-300 mt-2">Well played, everyone!</p>
                </div>

                <div className="space-y-4 pt-4">
                    {sortedPlayers.map(([id, player], index) => (
                        <AnimateIn key={id} from="opacity-0 -translate-x-4" to="opacity-100 translate-x-0" duration="duration-500">
                            <div style={{ transitionDelay: `${index * 100}ms` }}>
                                <PlayerCard player={player} isLeader={roomData.leaderId === id} isSelf={userId === id} score={player.score} rank={index === 0 ? '🏆' : index + 1} />
                            </div>
                        </AnimateIn>
                    ))}
                </div>

                {isLeader && (
                    <div className="text-center pt-6">
                        <button
                            onClick={handlePlayAgain}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 text-lg"
                        >
                            Play Again
                        </button>
                    </div>
                )}
                 {!isLeader && (
                     <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg mt-6">
                        <p className="font-medium text-blue-800 dark:text-blue-200">Waiting for the leader to start a new game.</p>
                    </div>
                )}
            </div>
        </AnimateIn>
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
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        signInAnonymously(auth).catch(err => {
            console.error("Anonymous sign-in failed:", err);
            setError("Could not connect to the game service.");
        });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setUserId(user.uid); 
            else setUserId(null);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!roomCode || !isAuthReady) return;

        const roomRef = doc(db, 'quizRooms', roomCode);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRoomData({ ...data, id: docSnap.id });
                const isLeader = data.leaderId === userId;
                const allPlayersAnswered = data.gameState === 'in-game' && Object.values(data.players).every(p => p.answers?.[data.currentQuestion]);
                if (isLeader && allPlayersAnswered) {
                    setTimeout(() => advanceGame(docSnap.ref, data), 2500);
                }
            } else {
                setError('Room not found.');
                setRoomData(null);
                setRoomCode('');
            }
        }, (err) => {
            console.error("Snapshot listener error:", err);
            setError("Lost connection to the room.");
        });

        return () => unsubscribe();
    }, [roomCode, isAuthReady, userId]);

    const handleCreateRoom = async () => {
        if (!playerName.trim() || !userId) return setError('Please enter your name.');
        setError('');
        const newRoomCode = generateRoomCode();
        const roomRef = doc(db, 'quizRooms', newRoomCode);
        await setDoc(roomRef, {
            leaderId: userId, 
            gameState: 'lobby', 
            players: { [userId]: { name: playerName, avatar: '👑', score: 0, answers: {} }},
            createdAt: serverTimestamp(),
        });
        setRoomCode(newRoomCode);
    };

    const handleJoinRoom = async (codeToJoin) => {
        if (!playerName.trim() || !codeToJoin.trim() || !userId) return setError('Please enter your name and a room code.');
        setError('');
        
        try {
            const roomRef = doc(db, 'quizRooms', codeToJoin);
            
            await runTransaction(db, async (transaction) => {
                const roomDoc = await transaction.get(roomRef);
                
                if (!roomDoc.exists()) {
                    throw new Error('Room does not exist.');
                }
                
                const roomData = roomDoc.data();
                
                // Check if game has already started
                if (roomData.gameState !== 'lobby') {
                    throw new Error('Game has already started. Cannot join now.');
                }
                
                // Add the new player to the players object
                const updatedPlayers = {
                    ...roomData.players,
                    [userId]: {
                        name: playerName,
                        avatar: '🧑‍🚀',
                        score: 0,
                        answers: {}
                    }
                };
                
                transaction.update(roomRef, { players: updatedPlayers });
            });
            
            // Set the room code only after successful join
            setRoomCode(codeToJoin);
            console.log('Successfully joined room');
        } catch (err) {
            console.error('Error joining room:', err);
            if (err.message === 'Room does not exist.') {
                setError('Room does not exist.');
            } else if (err.message === 'Game has already started. Cannot join now.') {
                setError('Game has already started. Cannot join now.');
            } else {
                setError('Failed to join room. Please try again.');
            }
        }
    };
    
    const handleStartGame = async (topic, difficulty) => {
        if (!topic) return;
        setIsGenerating(true);
        const prompt = `Generate exactly 7 multiple-choice quiz questions about "${topic}" with a difficulty level of "${difficulty}". Provide the output in a valid JSON array format. Each object in the array must have these exact keys: "question" (string), "options" (array of 4 strings), and "correctAnswerIndex" (integer from 0 to 3). Do not include any text outside of the JSON array.`;

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "AIzaSyAe5A_txJP5tELZWQytMGVJ4N0QEvVxf_s";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const questions = JSON.parse(cleanedText);
            if (!Array.isArray(questions) || questions.length === 0) throw new Error("AI did not return valid questions.");

            const roomRef = doc(db, 'quizRooms', roomCode);
            await updateDoc(roomRef, { topic, difficulty, questions, currentQuestion: 0, gameState: 'in-game' });
        } catch (err) {
            console.error("Error generating questions:", err);
            setError("Failed to generate quiz questions. The topic might be too obscure or there was a network issue. Please try a different topic.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswer = async (answerIndex, timeTaken) => {
        if (!roomData || !userId) return;
        const roomRef = doc(db, 'quizRooms', roomCode);
        await updateDoc(roomRef, { [`players.${userId}.answers.${roomData.currentQuestion}`]: { answerIndex, timeTaken } });
    };

    const advanceGame = async (roomRef, currentRoomData) => {
        const currentQuestionIndex = currentRoomData.currentQuestion;
        const questionData = currentRoomData.questions[currentQuestionIndex];
        const updatedPlayers = { ...currentRoomData.players };

        Object.keys(updatedPlayers).forEach(pid => {
            const player = updatedPlayers[pid];
            const answerData = player.answers?.[currentQuestionIndex];
            if (answerData && answerData.answerIndex === questionData.correctAnswerIndex) {
                const timeTaken = answerData.timeTaken;
                const timeRemaining = Math.max(0, 10 - timeTaken);
                let score = 0;
                let multiplier = 1;
                
                // New scoring system based on time ranges
                if (timeTaken >= 0 && timeTaken <= 2) {
                    // Answered in 8-10 seconds (0-2 seconds taken)
                    multiplier = 2;
                    score = Math.round(timeRemaining * multiplier);
                } else if (timeTaken > 2 && timeTaken <= 5) {
                    // Answered in 5-8 seconds (2-5 seconds taken)
                    multiplier = 1.5;
                    score = Math.round(timeRemaining * multiplier);
                } else if (timeTaken > 5 && timeTaken <= 9) {
                    // Answered in 1-5 seconds (5-9 seconds taken)
                    multiplier = 1;
                    score = Math.round(timeRemaining * multiplier);
                } else {
                    // Answered in last second or timeout
                    multiplier = 0.5;
                    score = Math.round(timeRemaining * multiplier);
                }
                
                player.score += Math.max(score, 1); // Minimum 1 point for correct answer
            }
        });

        if (currentQuestionIndex < currentRoomData.questions.length - 1) {
            await updateDoc(roomRef, { players: updatedPlayers, currentQuestion: currentQuestionIndex + 1 });
        } else {
            await updateDoc(roomRef, { players: updatedPlayers, gameState: 'finished' });
        }
    };
    
    const handlePlayAgain = async () => {
        if (!roomData) return;
        const roomRef = doc(db, 'quizRooms', roomCode);
        const resetPlayers = { ...roomData.players };
        Object.keys(resetPlayers).forEach(pid => {
            resetPlayers[pid].score = 0;
            resetPlayers[pid].answers = {};
        });
        await updateDoc(roomRef, { gameState: 'lobby', questions: [], currentQuestion: 0, topic: '', difficulty: '', players: resetPlayers });
    };

    const renderContent = () => {
        if (!isAuthReady) return <div className="flex flex-col items-center justify-center gap-4"><Loader className="w-12 h-12 animate-spin text-indigo-500" /><p className="text-lg font-medium text-gray-500 dark:text-gray-300">Connecting...</p></div>;
        if (error) return <div className="text-center p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">{error}</div>;
        if (roomData) {
            switch (roomData.gameState) {
                case 'lobby': return <LobbyScreen roomData={roomData} userId={userId} handleStartGame={handleStartGame} isGenerating={isGenerating} />;
                case 'in-game': return <GameScreen roomData={roomData} userId={userId} handleAnswer={handleAnswer} />;
                case 'finished': return <ScoreboardScreen roomData={roomData} userId={userId} handlePlayAgain={handlePlayAgain} />;
                default: return <p>Unknown game state.</p>;
            }
        }
        return <HomeScreen setPlayerName={setPlayerName} playerName={playerName} handleJoinRoom={handleJoinRoom} handleCreateRoom={handleCreateRoom} />;
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full flex items-center justify-center p-4 font-sans bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/50">
            <div className="w-full">
                {renderContent()}
                {userId && <div className="text-center mt-6 text-xs text-gray-400 dark:text-gray-600">User ID: {userId}</div>}
            </div>
        </div>
    );
}
