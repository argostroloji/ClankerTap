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

    const botUsername = 'clawnchtapbot';
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
        <div className="fixed bottom-0 left-0 right-0 bg-panel-bg rounded-t-2xl z-50 p-6 border-t border-electric-blue shadow-[0_-5px_20px_rgba(0,0,0,0.8)] animate-slide-up">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">INVITE UNIT</h3>
                    <p className="text-xs text-gray-400">Recruit friends, earn +50,000 Snips each.</p>
                </div>
                <button onClick={onClose} className="text-gray-400 font-bold p-1">✕</button>
            </div>

            <div className="bg-deep-dark p-4 rounded-lg border border-gray-700 mb-4 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Referrals (Recruits):</span>
                <span className="text-2xl font-bold text-electric-blue">{referralCount}</span>
            </div>

            <div className="bg-black/50 p-4 rounded-lg flex items-center justify-between mb-4 border border-gray-700">
                <code className="text-xs text-neon-orange truncate flex-1 mr-2">
                    {userId ? inviteLink : 'Generating Link...'}
                </code>
                <button
                    onClick={handleCopy}
                    disabled={!userId}
                    className={`text-white text-xs px-3 py-2 rounded transition-colors ${!userId ? 'bg-gray-800 cursor-wait' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {copied ? 'COPIED!' : 'COPY'}
                </button>
            </div>

            <button
                onClick={handleInvite}
                className="w-full bg-electric-blue text-black font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.5)] active:scale-95 transition-transform"
            >
                SEND INVITE SIGNAL 📡
            </button>
        </div>
    );
};
