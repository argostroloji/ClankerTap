
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

export function useTelegram() {
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [initData, setInitData] = useState<string>('');

    useEffect(() => {
        // Check if running inside Telegram
        // WebApp.initDataUnsafe might be undefined in standard browser
        if (WebApp.initDataUnsafe?.user) {
            setUser(WebApp.initDataUnsafe.user as TelegramUser);
            setInitData(WebApp.initData);
            WebApp.ready();
            WebApp.expand();
        }
    }, []);

    const close = () => {
        WebApp.close();
    };

    const showMainButton = (text: string, onClick: () => void) => {
        WebApp.MainButton.setText(text);
        WebApp.MainButton.onClick(onClick);
        WebApp.MainButton.show();
    };

    const hideMainButton = () => {
        WebApp.MainButton.hide();
    };

    const hapticFeedback = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
        if (WebApp.HapticFeedback) {
            WebApp.HapticFeedback.impactOccurred(style);
        }
    };

    return {
        user,
        initData,
        close,
        showMainButton,
        hideMainButton,
        hapticFeedback,
        WebApp,
    };
}
