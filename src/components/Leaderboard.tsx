
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface LeaderboardProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId?: number;
}

interface LeaderboardUser {
    telegram_id: number;
    username: string;
    all_time_snips: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, currentUserId }) => {
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (!isSupabaseConfigured) {
                // Mock data for demo
                setLeaders([
                    { telegram_id: 1, username: 'AlphaBag', all_time_snips: 1500000 },
                    { telegram_id: 2, username: 'CyberCash', all_time_snips: 1200000 },
                    { telegram_id: 3, username: 'NeonVault', all_time_snips: 980000 },
                    { telegram_id: 99999, username: 'Demo_Operator', all_time_snips: 100 }, // Current User
                ]);
                return;
            }

            setLoading(true);
            supabase
                .from('users')
                .select('username, all_time_snips, telegram_id')
                .order('all_time_snips', { ascending: false })
                .limit(100)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Leaderboard error:', error);
                    }
                    if (data) {
                        setLeaders(data);
                    }
                    setLoading(false);
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md h-[85vh] rounded-t-3xl p-0 flex flex-col border-t border-primary-green shadow-[0_-5px_30px_rgba(0,255,65,0.2)] animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-panel-bg/95 backdrop-blur z-20">
                    <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-green via-white to-primary-green drop-shadow-md" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                        TOP BAGGERS
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative">
                    {/* Decorative background element */}
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-green/5 to-transparent pointer-events-none"></div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-full border-4 border-primary-green border-t-transparent animate-spin"></div>
                            <div className="text-primary-green font-mono tracking-widest text-sm">SCANNING NETWORK...</div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse relative z-10">
                            <thead className="bg-gray-900/80 text-[10px] uppercase tracking-widest text-gray-500 sticky top-0 backdrop-blur-sm font-bold">
                                <tr>
                                    <th className="p-4 pl-6">Rank</th>
                                    <th className="p-4">Operator</th>
                                    <th className="p-4 pr-6 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaders.map((user, index) => (
                                    <tr
                                        key={user.telegram_id}
                                        className={`group border-b border-gray-800/50 transition-colors ${user.telegram_id === currentUserId
                                                ? 'bg-primary-green/10 hover:bg-primary-green/20'
                                                : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <td className="p-4 pl-6 font-mono text-gray-400">
                                            {index === 0 ? <span className="text-2xl">🥇</span> :
                                                index === 1 ? <span className="text-2xl">🥈</span> :
                                                    index === 2 ? <span className="text-2xl">🥉</span> :
                                                        <span className="opacity-50">#{index + 1}</span>}
                                        </td>
                                        <td className={`p-4 font-bold truncate max-w-[140px] ${user.telegram_id === currentUserId ? 'text-primary-green' : 'text-white'}`}>
                                            {user.username}
                                            {user.telegram_id === currentUserId && <span className="ml-2 text-[10px] bg-primary-green text-black px-1.5 py-0.5 rounded font-black tracking-tighter">YOU</span>}
                                        </td>
                                        <td className="p-4 pr-6 text-right font-mono font-bold text-shadow-sm">
                                            <span className="text-emerald-400">{user.all_time_snips.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
