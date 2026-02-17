import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getProfileShareLink } from '../constants/gameData';
import type { Upgrade } from '../types';
import profileCardBg from '../assets/profile_card_bg.png';
import { toPng } from 'html-to-image';

interface ProfileCardProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    avatarUrl?: string; // Telegram user photo
    allTimeSnips: number;
    snips: number;
    tapPower: number;
    upgrades: Upgrade[];
    userId?: number;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    isOpen,
    onClose,
    username,
    avatarUrl,
    allTimeSnips,
    snips,
    tapPower,
    upgrades,
    userId,
}) => {
    const [rank, setRank] = useState<number | null>(null);
    const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        if (!isSupabaseConfigured) {
            setRank(6);
            setTotalPlayers(42);
            return;
        }

        setLoading(true);

        const fetchRank = async () => {
            if (!userId) return;

            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gt('all_time_snips', allTimeSnips);

            setRank((count || 0) + 1);

            const { count: total } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            setTotalPlayers(total || 0);
            setLoading(false);
        };

        fetchRank();
    }, [isOpen, userId, allTimeSnips]);

    const handleDownload = useCallback(async () => {
        if (cardRef.current === null) return;

        try {
            setExporting(true);
            // Give a tiny moment for state change to reflect if needed
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                style: {
                    borderRadius: '0' // Temporary for clean capture
                }
            });

            const link = document.createElement('a');
            link.download = `clanker-tap-profile-${username}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to export image', err);
        } finally {
            setExporting(false);
        }
    }, [username]);

    if (!isOpen) return null;

    const getUpgradeLevel = (type: string) => {
        const u = upgrades.find(u => u.upgrade_type === type);
        return u?.current_level || 0;
    };

    const handleTwitterShare = () => {
        if (rank) {
            const url = getProfileShareLink(username, rank, allTimeSnips, userId);
            window.open(url, '_blank');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in px-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[400px] animate-lucky-pop flex flex-col gap-4"
                onClick={e => e.stopPropagation()}
            >

                {/* The Visual Card Container (The part that gets exported as image) */}
                <div
                    ref={cardRef}
                    className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10"
                >
                    {/* High Fidelity Background */}
                    <img
                        src={profileCardBg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Engraved Effect Overlay Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40 pointer-events-none" />

                    {/* CENTRAL PROFILE AREA (Integrated into the hole) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                            {/* Inner hole glow */}
                            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />

                            {/* Profile Picture */}
                            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/40 shadow-inner">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center text-4xl font-black text-white/50 italic">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {/* Overlay lens effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/30" />
                            </div>

                            {/* Rank Indicator Badge (Integrated) */}
                            {rank && !loading && (
                                <div className="absolute top-0 right-1 px-2.5 py-1 rounded-full bg-black/80 border border-purple-500/50 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                                    <span className="text-[10px] font-black text-purple-400">#</span>
                                    <span className="text-sm font-black text-white">{rank}</span>
                                    {totalPlayers && (
                                        <span className="text-[8px] text-white/30 border-l border-white/10 pl-1.5 ml-1">
                                            /{totalPlayers}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Loading State for Rank */}
                            {loading && (
                                <div className="absolute top-0 right-1 w-8 h-8 rounded-full bg-black/80 border border-purple-500/30 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TOP INFO - Engraved Username */}
                    <div className="absolute top-10 left-0 right-0 text-center px-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black tracking-[0.5em] text-purple-400/60 uppercase mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                CLANKER OPERATOR
                            </span>
                            <h2
                                className="text-3xl font-black italic tracking-tighter text-white uppercase"
                                style={{
                                    textShadow: '2px 2px 0px #000, -1px -1px 0px rgba(255,255,255,0.1), 0 0 20px rgba(124,58,237,0.3)',
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                {username}
                            </h2>
                        </div>
                    </div>

                    {/* BOTTOM STATS - Integrated into the design */}
                    <div className="absolute bottom-12 left-0 right-0 px-8 flex justify-between items-end">
                        <div className="flex flex-col items-center">
                            <span className="text-xl mb-1 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">💰</span>
                            <span className="text-lg font-black font-mono text-white tracking-tighter leading-none" style={{ textShadow: '0 0 10px rgba(167,139,250,0.5), 1px 1px 2px #000' }}>
                                {Math.floor(allTimeSnips).toLocaleString()}
                            </span>
                            <span className="text-[8px] font-black tracking-widest text-purple-400/70 border-t border-purple-500/20 mt-1 pt-0.5">EARNINGS</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-xl mb-1 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">⚡</span>
                            <span className="text-lg font-black font-mono text-white tracking-tighter leading-none" style={{ textShadow: '0 0 10px rgba(167,139,250,0.5), 1px 1px 2px #000' }}>
                                +{tapPower}
                            </span>
                            <span className="text-[8px] font-black tracking-widest text-purple-400/70 border-t border-purple-500/20 mt-1 pt-0.5">TAP POWER</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-xl mb-1 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">🏦</span>
                            <span className="text-lg font-black font-mono text-white tracking-tighter leading-none" style={{ textShadow: '0 0 10px rgba(167,139,250,0.5), 1px 1px 2px #000' }}>
                                {Math.floor(snips).toLocaleString()}
                            </span>
                            <span className="text-[8px] font-black tracking-widest text-purple-400/70 border-t border-purple-500/20 mt-1 pt-0.5">BALANCE</span>
                        </div>
                    </div>

                    {/* BRANDING FOOTER (Engraved) */}
                    <div className="absolute bottom-4 left-0 right-0 text-center opacity-30">
                        <span className="text-[8px] font-bold tracking-[1em] text-white uppercase">
                            BAGS TAP SYSTEM • v1.3
                        </span>
                    </div>

                    {/* SCANNING LINES (Digital Overlay) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                        <div className="w-full h-full" style={{
                            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                            backgroundSize: '100% 2px, 3px 100%'
                        }} />
                    </div>
                </div>

                {/* BOTTOM BUTTONS (NOT PART OF THE IMAGE) */}
                {!exporting && (
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleDownload}
                                className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                            >
                                <svg className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" />
                                </svg>
                                Download Image
                            </button>

                            <button
                                onClick={handleTwitterShare}
                                className="flex-1 py-3 rounded-2xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] font-black text-xs uppercase tracking-widest hover:bg-[#1DA1F2]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                Share on X
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-2xl bg-white/5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Back to Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
