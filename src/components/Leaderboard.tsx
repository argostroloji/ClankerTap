
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
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-panel-bg w-full max-w-md h-[80vh] rounded-t-2xl p-0 flex flex-col border-t border-neon-orange shadow-[0_-5px_20px_rgba(255,95,31,0.3)] animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-panel-bg z-10 rounded-t-2xl">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-orange to-red-500">
                        Top Baggers
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="text-center p-8 text-electric-blue animate-pulse">Scanning Network...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-900/50 text-xs text-gray-400 sticky top-0">
                                <tr>
                                    <th className="p-3">Rank</th>
                                    <th className="p-3">Operator</th>
                                    <th className="p-3 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaders.map((user, index) => (
                                    <tr
                                        key={user.telegram_id}
                                        className={`border-b border-gray-900 ${user.telegram_id === currentUserId ? 'bg-orange-900/20 text-orange-400' : 'text-gray-300'}`}
                                    >
                                        <td className="p-3 font-mono">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </td>
                                        <td className="p-3 font-bold truncate max-w-[120px]">{user.username}</td>
                                        <td className="p-3 text-right font-mono text-electric-blue">
                                            {user.all_time_snips.toLocaleString()}
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
