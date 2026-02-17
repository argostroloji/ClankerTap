import { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import WebApp from '@twa-dev/sdk';

export type Platform = 'telegram' | 'farcaster' | 'web';

interface PlatformUser {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
}

interface PlatformContext {
    platform: Platform;
    user: PlatformUser | null;
    isReady: boolean;
    hapticFeedback: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    shareUrl: (url: string, text?: string) => void;
    getStartParam: () => string | undefined;
}

function detectPlatform(): Platform {
    // Check Telegram first — initDataUnsafe is populated only inside Telegram WebApp
    try {
        if (WebApp.initDataUnsafe?.user) {
            return 'telegram';
        }
    } catch {
        // Not in Telegram
    }

    // Check for Farcaster/Base miniapp context via URL hint or SDK
    const url = new URL(window.location.href);
    if (
        url.searchParams.get('miniApp') === 'true' ||
        url.pathname.includes('/miniapp') ||
        // Farcaster client sets an ancestor origin
        window.location !== window.parent.location
    ) {
        return 'farcaster';
    }

    return 'web';
}

export function usePlatform(): PlatformContext {
    const [platform] = useState<Platform>(() => detectPlatform());
    const [user, setUser] = useState<PlatformUser | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function init() {
            console.log('Detecting platform:', platform);
            if (platform === 'telegram') {
                // ---- Telegram init ----
                if (WebApp.initDataUnsafe?.user) {
                    const tgUser = WebApp.initDataUnsafe.user;
                    setUser({
                        id: tgUser.id,
                        username: tgUser.username || tgUser.first_name || `user_${tgUser.id}`,
                        first_name: tgUser.first_name,
                        last_name: tgUser.last_name,
                        photo_url: (tgUser as unknown as { photo_url?: string }).photo_url,
                    });
                    WebApp.ready();
                    WebApp.expand();
                }
                setIsReady(true);
            } else if (platform === 'farcaster') {
                // ---- Farcaster / Base init ----
                try {
                    await sdk.actions.ready();
                    // Access context separately after ready()
                    const context = await sdk.context;
                    if (context?.user) {
                        setUser({
                            id: context.user.fid,
                            username: context.user.username || `fid_${context.user.fid}`,
                            first_name: context.user.displayName || context.user.username,
                            photo_url: context.user.pfpUrl,
                        });
                    }
                } catch (err) {
                    console.warn('Farcaster SDK ready() failed, falling back:', err);
                    try { await sdk.actions.ready(); } catch { /* noop */ }
                }
                setIsReady(true);
            } else {
                // ---- Web fallback ----
                setIsReady(true);
            }
        }

        init();
    }, [platform]);

    const hapticFeedback = useCallback(
        (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
            if (platform === 'telegram' && WebApp.HapticFeedback) {
                WebApp.HapticFeedback.impactOccurred(style);
            }
            // Farcaster SDK doesn't have haptics — silently ignore
        },
        [platform]
    );

    const shareUrl = useCallback(
        (url: string, text?: string) => {
            if (platform === 'telegram') {
                WebApp.openTelegramLink(url);
            } else if (platform === 'farcaster') {
                // Open a Warpcast compose intent
                const castUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text || '')}%20${encodeURIComponent(url)}`;
                window.open(castUrl, '_blank');
            } else {
                window.open(url, '_blank');
            }
        },
        [platform]
    );

    const getStartParam = useCallback((): string | undefined => {
        if (platform === 'telegram') {
            return WebApp.initDataUnsafe?.start_param;
        }
        // For Farcaster/web, use URL search params
        const params = new URLSearchParams(window.location.search);
        return params.get('ref') || undefined;
    }, [platform]);

    return {
        platform,
        user,
        isReady,
        hapticFeedback,
        shareUrl,
        getStartParam,
    };
}
