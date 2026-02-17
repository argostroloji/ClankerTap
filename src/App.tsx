
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useGameState } from './hooks/useGameState';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import type { User, UpgradeType } from './types';
import { MainStage } from './components/MainStage';
import { EnergyBar } from './components/EnergyBar';
import { UpgradeDock } from './components/UpgradeDock';
import { Leaderboard } from './components/Leaderboard';
import { Referral } from './components/Referral';
import { Missions } from './components/Missions';
import { ParticleBackground } from './components/ParticleBackground';
import { SplashScreen } from './components/SplashScreen';
import { ProfileCard } from './components/ProfileCard';
import { playSound } from './lib/audio';

function App() {
  const { user, hapticFeedback, WebApp } = useTelegram();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [screenShake, setScreenShake] = useState(false);

  // Combo & Streak State
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboCount, setComboCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showComboText, setShowComboText] = useState(false);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lucky Tap State
  const [luckyTap, setLuckyTap] = useState<{ multiplier: number; bonus: number } | null>(null);
  const tapCounterRef = useRef(0);

  // UI State
  const [isUpgradeDockOpen, setIsUpgradeDockOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);

  // Initialize User
  useEffect(() => {
    const initUser = async () => {
      // 1. DEMO MODE CHECK
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Running in Demo Mode.');
        setDbUser({
          telegram_id: 99999,
          username: user?.username || (user?.first_name ? `${user.first_name} (Demo)` : 'Demo_Operator'),
          total_snips: 0,
          all_time_snips: 0,
          energy_current: 1000,
          last_active: new Date().toISOString(),
          referred_by: null
        });
        return;
      }

      // 2. TELEGRAM USER CHECK
      if (user) {
        const { data: existingUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', user.id)
          .single();

        if (existingUser) {
          // LATE REFERRAL BINDING: If user exists but has no referrer, check start_param
          if (!existingUser.referred_by) {
            const startParam = WebApp.initDataUnsafe.start_param;
            if (startParam && startParam.startsWith('ref_')) {
              const refId = parseInt(startParam.replace('ref_', ''), 10);
              console.log('CHECKING LATE BINDING - RefID:', refId, 'Current User:', existingUser.telegram_id);
              if (!isNaN(refId) && refId !== existingUser.telegram_id) {
                console.log('APPLYING LATE REFERRAL:', refId);
                await supabase.from('users').update({ referred_by: refId }).eq('telegram_id', existingUser.telegram_id);
                existingUser.referred_by = refId;
              }
            }
          }
          setDbUser(existingUser);
        } else {
          // Create new user
          let referredBy: number | null = null;
          const startParam = WebApp.initDataUnsafe.start_param;
          if (startParam && startParam.startsWith('ref_')) {
            const refId = parseInt(startParam.replace('ref_', ''), 10);
            if (!isNaN(refId) && refId !== user.id) {
              referredBy = refId;
            }
          }

          const { data: newUser } = await supabase
            .from('users')
            .insert({
              telegram_id: user.id,
              username: user.username || user.first_name || `user_${user.id}`,
              total_snips: 0,
              all_time_snips: 0,
              energy_current: 1000,
              referred_by: referredBy,
              last_active: new Date().toISOString(),
            })
            .select()
            .single();

          if (newUser) setDbUser(newUser);
        }
      } else {
        console.log('User not in Telegram context.');
        setDbUser({
          telegram_id: 12345,
          username: 'DevUser',
          total_snips: 100,
          all_time_snips: 100,
          energy_current: 1000,
          last_active: new Date().toISOString(),
          referred_by: null
        });
      }
    };

    initUser();
  }, [user]);

  // Game Logic Hook with Upgrades
  const { energy, maxEnergy, snips, allTimeSnips, tapPower, upgrades, handleTap, purchaseUpgrade, addSnips } = useGameState({ user: dbUser });

  // Track previous snips for flash effect
  const prevSnipsRef = useRef(snips);
  useEffect(() => {
    if (snips > prevSnipsRef.current) {
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 400);
    }
    prevSnipsRef.current = snips;
  }, [snips]);

  const handleReward = (amount: number) => {
    addSnips(amount);
    hapticFeedback('medium');
    playSound('upgrade');
  };

  // Combo Logic
  const getComboMultiplier = useCallback((count: number) => {
    if (count >= 50) return 10;
    if (count >= 30) return 5;
    if (count >= 15) return 3;
    if (count >= 5) return 2;
    return 1;
  }, []);

  const onLobsterTap = () => {
    const success = handleTap();
    if (success) {
      hapticFeedback('light');
      playSound('click');

      // Lucky Tap check (~3% chance per tap)
      tapCounterRef.current += 1;
      if (tapCounterRef.current >= 20 && Math.random() < 0.03) {
        tapCounterRef.current = 0;
        const luckyMultiplier = [5, 10, 15, 20, 25, 50][Math.floor(Math.random() * 6)];
        const bonus = tapPower * luckyMultiplier;
        addSnips(bonus);
        setLuckyTap({ multiplier: luckyMultiplier, bonus });
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
        hapticFeedback('heavy');
        playSound('lucky');
        setTimeout(() => setLuckyTap(null), 2500);
      }

      // Update combo
      const newComboCount = comboCount + 1;
      setComboCount(newComboCount);
      const newMultiplier = getComboMultiplier(newComboCount);

      // When multiplier level changes, show combo text + effects
      if (newMultiplier > comboMultiplier) {
        setShowComboText(true);
        setTimeout(() => setShowComboText(false), 1500);

        // Screen shake + sound at x5+
        if (newMultiplier >= 5) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 500);
          hapticFeedback('heavy');
        } else {
          hapticFeedback('medium');
        }

        // Play combo level sound
        if (newMultiplier === 10) playSound('combo_x10');
        else if (newMultiplier === 5) playSound('combo_x5');
        else if (newMultiplier === 3) playSound('combo_x3');
        else if (newMultiplier === 2) playSound('combo_x2');
      }
      setComboMultiplier(newMultiplier);

      // Give bonus snips from combo (multiplier - 1 extra taps worth)
      if (newMultiplier > 1) {
        addSnips(tapPower * (newMultiplier - 1));
      }

      // Reset combo timer (1.5s window)
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        setComboCount(0);
        setComboMultiplier(1);
      }, 1500);

      // Update streak
      setStreak(prev => prev + 1);

      // Reset streak timer (2s window)
      if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
      streakTimerRef.current = setTimeout(() => {
        setStreak(0);
      }, 2000);
    }
    return success;
  };

  const handlePurchase = (type: UpgradeType) => {
    purchaseUpgrade(type);
    hapticFeedback('medium');
    playSound('upgrade');
  };

  // SPLASH SCREEN
  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

  return (
    <div className={`min-h-screen bg-deep-dark text-white font-sans flex flex-col overflow-hidden relative selection:bg-neon-purple selection:text-black circuit-bg ${screenShake ? 'animate-screen-shake' : ''}`}>
      {/* Particle Background */}
      <ParticleBackground />

      {/* Ambient gradient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 blur-[100px] animate-orb-float pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-purple/5 blur-[80px] animate-orb-float pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* ============================================
          HEADER / HUD
          ============================================ */}
      <div className="relative z-10 px-5 pt-5 pb-3">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          {/* User Info — clickable for profile card */}
          <div
            className="flex flex-col items-start cursor-pointer group"
            onClick={() => setIsProfileCardOpen(true)}
          >
            <span className="text-[9px] font-bold tracking-[0.3em] text-purple-400/60 uppercase">Clanker</span>
            <span className="font-bold text-lg text-white tracking-wide truncate drop-shadow-md max-w-[140px] group-hover:text-purple-300 transition-colors">
              {dbUser?.username || 'Initializing...'}
            </span>
          </div>

          {/* Score Display */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold tracking-[0.3em] text-purple-400/60 uppercase">Balance</span>
            <div className={`transition-all duration-200 ${scoreFlash ? 'animate-score-flash' : ''}`}>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-neon-purple to-purple-500 font-sans tabular-nums">
                {Math.floor(snips).toLocaleString()}
              </span>
              <span className="ml-1 text-xl">💰</span>
            </div>
            {allTimeSnips > snips && (
              <span className="text-[9px] text-gray-500 font-mono mt-0.5">
                Total: {Math.floor(allTimeSnips).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN GAME STAGE
          ============================================ */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Game Title */}
        <div className="mb-6 text-center overflow-visible">
          <h1 className="text-4xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-300 drop-shadow-[0_0_20px_rgba(124,58,237,0.3)] leading-none pr-3 overflow-visible" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            CLANKER TAP
          </h1>
          <div className="w-32 h-px mx-auto bg-gradient-to-r from-transparent via-primary-purple/50 to-transparent mt-2" />
        </div>

        {/* Combo Display */}
        {comboMultiplier > 1 && (
          <div className={`mb-2 transition-all duration-300 text-center ${showComboText ? 'scale-125' : 'scale-100'}`}>
            {showComboText && (
              <div className={`text-sm font-black tracking-[0.3em] uppercase mb-1 animate-bounce ${comboMultiplier >= 10 ? 'text-yellow-200' :
                comboMultiplier >= 5 ? 'text-orange-300' :
                  comboMultiplier >= 3 ? 'text-purple-200' :
                    'text-purple-300'
                }`}>
                {comboMultiplier >= 10 ? '⚡ LEGENDARY! ⚡' :
                  comboMultiplier >= 5 ? '🔥 EXCELLENT! 🔥' :
                    comboMultiplier >= 3 ? '✨ GREAT! ✨' :
                      '👊 NICE! 👊'}
              </div>
            )}
            <span className={`text-2xl font-black italic tracking-tight ${comboMultiplier >= 10 ? 'text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]' :
              comboMultiplier >= 5 ? 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]' :
                comboMultiplier >= 3 ? 'text-purple-300 drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]' :
                  'text-purple-400'
              }`}>
              COMBO x{comboMultiplier}
            </span>
          </div>
        )}

        <MainStage onTap={onLobsterTap} tapValue={tapPower} comboMultiplier={comboMultiplier} />

        {/* Streak Counter */}
        {streak > 2 && (
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 animate-pulse">
            <span className="text-base">🔥</span>
            <span className="font-black text-sm text-orange-400 tabular-nums">{streak}</span>
            <span className="text-[10px] text-orange-400/70 font-bold uppercase tracking-wider">streak</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-3 flex items-center gap-4">
          {/* Tap Power */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/15 bg-purple-500/5">
            <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="font-mono text-[11px] text-purple-300 tracking-wide">+{tapPower}/tap</span>
          </div>

          {/* Passive Income indicator */}
          {upgrades.some(u => u.upgrade_type === 'passive_income' && u.current_level > 0) && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/15 bg-purple-500/5">
              <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 010 4H8" /><path d="M12 18V6" />
              </svg>
              <span className="font-mono text-[11px] text-cyan-300 tracking-wide">
                +{upgrades.find(u => u.upgrade_type === 'passive_income')?.current_level || 0}/s
              </span>
            </div>
          )}

          {/* Combo indicator when active */}
          {comboMultiplier > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5">
              <span className="text-xs">⚡</span>
              <span className="font-mono text-[11px] text-yellow-300 tracking-wide">x{comboMultiplier}</span>
            </div>
          )}
        </div>

        {/* Energy Bar */}
        <div className="w-full mt-4 px-6">
          <EnergyBar current={energy} max={maxEnergy} />
        </div>
      </div>

      {/* ============================================
          PREMIUM NAVIGATION DOCK
          ============================================ */}
      <div className="relative z-10 px-4 pb-4 pt-2">
        <div className="w-full max-w-md mx-auto">
          <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(17,6,31,0.95) 50%, rgba(124,58,237,0.08) 100%)' }}>
            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-purple/40 to-transparent" />

            <div className="backdrop-blur-xl p-1.5">
              <div className="flex gap-1.5">
                {/* Missions */}
                <button
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 hover:bg-purple-500/15 active:scale-95 group relative overflow-hidden"
                  onClick={() => setIsMissionsOpen(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/10 flex items-center justify-center group-hover:border-purple-500/30 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all">
                    <svg className="w-4.5 h-4.5 text-purple-400 group-hover:text-purple-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide text-gray-500 group-hover:text-purple-300 transition-colors relative z-10">Missions</span>
                </button>

                {/* Upgrades */}
                <button
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 hover:bg-purple-500/15 active:scale-95 group relative overflow-hidden"
                  onClick={() => setIsUpgradeDockOpen(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/10 flex items-center justify-center group-hover:border-purple-500/30 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all">
                    <svg className="w-4.5 h-4.5 text-purple-400 group-hover:text-purple-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    {/* Notification dot */}
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide text-gray-500 group-hover:text-purple-300 transition-colors relative z-10">Upgrade</span>
                </button>

                {/* Invite */}
                <button
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 hover:bg-purple-500/15 active:scale-95 group relative overflow-hidden"
                  onClick={() => setIsReferralOpen(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/10 flex items-center justify-center group-hover:border-purple-500/30 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all">
                    <svg className="w-4.5 h-4.5 text-purple-400 group-hover:text-purple-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide text-gray-500 group-hover:text-purple-300 transition-colors relative z-10">Invite</span>
                </button>

                {/* Leaderboard */}
                <button
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 hover:bg-purple-500/15 active:scale-95 group relative overflow-hidden"
                  onClick={() => setIsLeaderboardOpen(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/10 flex items-center justify-center group-hover:border-purple-500/30 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all">
                    <svg className="w-4.5 h-4.5 text-purple-400 group-hover:text-purple-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 7 7 7 7" /><path d="M18 9h1.5a2.5 2.5 0 000-5C17 4 17 7 17 7" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide text-gray-500 group-hover:text-purple-300 transition-colors relative z-10">Rank</span>
                </button>
              </div>
            </div>

            {/* Bottom border glow */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          </div>
        </div>
      </div>

      {/* ============================================
          MODALS
          ============================================ */}
      <UpgradeDock
        isOpen={isUpgradeDockOpen}
        onClose={() => setIsUpgradeDockOpen(false)}
        snips={snips}
        upgrades={upgrades}
        onPurchase={handlePurchase}
      />

      <Leaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserId={dbUser?.telegram_id}
      />

      <Referral
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        userId={dbUser?.telegram_id}
      />

      <Missions
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        onReward={handleReward}
        userId={dbUser?.telegram_id}
      />

      <ProfileCard
        isOpen={isProfileCardOpen}
        onClose={() => setIsProfileCardOpen(false)}
        username={dbUser?.username || 'Unknown'}
        avatarUrl={user?.photo_url}
        allTimeSnips={allTimeSnips}
        snips={snips}
        tapPower={tapPower}
        upgrades={upgrades}
        userId={dbUser?.telegram_id}
      />

      {/* Lucky Tap Overlay */}
      {luckyTap && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[18vh] pointer-events-none animate-fade-in">
          {/* Dark backdrop for contrast */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Orange/red radial glow */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center 30%, rgba(251,146,60,0.3) 0%, transparent 60%)' }} />

          {/* Central celebration */}
          <div className="relative flex flex-col items-center gap-4 animate-lucky-pop">
            {/* Decorative lines */}
            <div className="absolute -inset-16 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-8 rounded-full animate-lucky-star"
                  style={{
                    background: 'linear-gradient(to top, rgba(251,146,60,0.8), transparent)',
                    transform: `rotate(${i * 30}deg) translateY(-60px)`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            {/* Lucky text */}
            <span
              className="text-2xl font-black tracking-[0.5em] uppercase"
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                background: 'linear-gradient(to right, #fde68a, #f97316, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.6))',
              }}
            >
              LUCKY TAP
            </span>

            {/* Multiplier */}
            <span
              className="text-8xl font-black italic leading-none"
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                background: 'linear-gradient(to bottom, #fef3c7, #f97316, #dc2626)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(249,115,22,0.5))',
              }}
            >
              x{luckyTap.multiplier}
            </span>

            {/* Bonus amount */}
            <div className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 backdrop-blur-sm">
              <span
                className="text-xl font-black text-orange-200 tabular-nums"
                style={{ fontFamily: '"Rajdhani", sans-serif' }}
              >
                +{luckyTap.bonus.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Version info */}
      <div className="absolute bottom-1 left-1 text-[8px] text-gray-800 pointer-events-none z-0">
        v1.3.0 — Clanker Tap
      </div>
    </div>
  );
}

export default App;
