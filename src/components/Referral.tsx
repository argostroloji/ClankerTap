import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { supabase } from '../lib/supabaseClient';

interface ReferralProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: number;
}

export const Referral: React.FC<ReferralProps> = ({ isOpen, onClose, userId }) => {
    const { WebApp } = useTelegram();
    const [copied, setCopied] = useState(false);
    const [referralCount, setReferralCount] = useState<number>(0);

    const botUsername = 'BagsTapGameBot';
    const appName = 'game'; // Must match the Short Name set in BotFather -> /myapps
    const inviteLink = `https://t.me/${botUsername}/${appName}?startapp=ref_${userId}`;

    useEffect(() => {
        if (isOpen && userId) {
            const fetchReferrals = async () => {
                const { count, error } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('referred_by', userId);

                if (!error && count !== null) {
                    setReferralCount(count);
                }
            };
            fetchReferrals();
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        if (!userId) return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
        } catch (err) {
            console.error('Clipboard API failed', err);
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = inviteLink;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
            } catch (fallbackErr) {
                console.error('Fallback copy failed', fallbackErr);
            }
            document.body.removeChild(textArea);
        }

        setTimeout(() => setCopied(false), 2000);
    };

    const handleInvite = () => {
        if (!userId) return;
        const text = `Join me in BagsTap: Bag-Snip and gather Cash! 💰⚡`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;
        WebApp.openTelegramLink(url);
    };

    console.log('Generated Invite Link:', inviteLink);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-panel-bg rounded-t-3xl z-50 p-6 border-t border-primary-green shadow-[0_-5px_30px_rgba(0,255,65,0.2)] animate-slide-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-green to-transparent opacity-50"></div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                        INVITE UNIT
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">Recruit friends, earn <span className="text-primary-green">+50,000 Snips</span> each.</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">✕</button>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center backdrop-blur-sm">
                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">RECRUITS</span>
                <span className="text-3xl font-black text-primary-green drop-shadow-md font-sans">{referralCount}</span>
            </div>

            <div className="bg-black/30 p-4 rounded-xl flex items-center justify-between mb-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <code className="text-xs text-emerald-400 truncate flex-1 mr-4 font-mono select-all">
                    {userId ? inviteLink : 'Generating Link...'}
                </code>
                <button
                    onClick={handleCopy}
                    disabled={!userId}
                    className={`text-black text-xs font-bold px-4 py-2 rounded-lg transition-all transform active:scale-95 ${!userId ? 'bg-gray-700 cursor-wait' : 'bg-white hover:bg-gray-200'}`}
                >
                    {copied ? 'COPIED!' : 'COPY'}
                </button>
            </div>

            <button
                onClick={handleInvite}
                className="w-full bg-gradient-to-r from-primary-green to-emerald-600 text-black font-black text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(46,204,113,0.4)] active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-2 uppercase tracking-wide"
            >
                SEND INVITE SIGNAL <span className="text-xl">📡</span>
            </button>
        </div>
    );
};
