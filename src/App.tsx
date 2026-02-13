
import { useEffect, useState } from 'react';
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
import { playSound } from './lib/audio';

function App() {
  const { user, hapticFeedback, WebApp } = useTelegram();
  const [dbUser, setDbUser] = useState<User | null>(null);

  // UI State
  const [isUpgradeDockOpen, setIsUpgradeDockOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);

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
                console.log('Late Referral Binding EXECUTE:', refId);

                // Update user
                const { data: updatedUser, error: updateError } = await supabase
                  .from('users')
                  .update({ referred_by: refId })
                  .eq('telegram_id', existingUser.telegram_id)
                  .select()
                  .single();

                if (!updateError && updatedUser) {
                  setDbUser(updatedUser);
                  return; // Exit here as we set the user
                }
              }
            }
          }
          setDbUser(existingUser);
        } else if (!error || error.code === 'PGRST116') {
          const { data: newUser } = await supabase
            .from('users')
            .insert({
              telegram_id: user.id,
              username: user.username || user.first_name,
              total_snips: 0,
              all_time_snips: 0,
              energy_current: 1000,
              referred_by: (() => {
                const startParam = WebApp.initDataUnsafe.start_param;
                console.log('INIT NEW USER - StartParam:', startParam);
                if (startParam && startParam.startsWith('ref_')) {
                  const refId = parseInt(startParam.replace('ref_', ''), 10);
                  const valid = !isNaN(refId) && refId !== user.id;
                  console.log('Parsed RefID:', refId, 'Valid:', valid);
                  return valid ? refId : null;
                }
                return null;
              })()
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
  const { energy, maxEnergy, snips, tapPower, upgrades, handleTap, purchaseUpgrade, addSnips } = useGameState({ user: dbUser });

  const handleReward = (amount: number) => {
    addSnips(amount);
    hapticFeedback('medium');
    playSound('upgrade');
  };

  const onLobsterTap = () => {
    const success = handleTap();
    if (success) {
      hapticFeedback('light');
      playSound('click');
    }
    return success;
  };

  const handlePurchase = (type: UpgradeType) => {
    purchaseUpgrade(type);
    hapticFeedback('medium');
    playSound('upgrade');
  };

  return (
    <div className="min-h-screen bg-deep-dark text-neon-orange font-mono p-4 flex flex-col overflow-hidden relative">
      {/* Header / HUD */}
      <div className="flex justify-between items-center w-full max-w-md mx-auto z-10">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">OPERATOR</span>
          <span className="font-bold text-white max-w-[150px] truncate">{dbUser?.username || 'Initializing...'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">TOTAL CASH</span>
          <span className="text-3xl font-bold text-electric-blue drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
            {Math.floor(snips).toLocaleString()} 💰
          </span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <MainStage onTap={onLobsterTap} tapValue={tapPower} />

        {/* Energy Bar */}
        <div className="w-full mt-8">
          <EnergyBar current={energy} max={maxEnergy} />
        </div>
      </div>

      {/* Footer / Menu */}
      <div className="w-full max-w-md mx-auto mt-4 p-4 bg-panel-bg rounded-t-xl border-t border-gray-800 z-10 relative">
        <div className="flex justify-around text-2xl">
          <button
            className="p-2 hover:text-electric-blue transition-colors"
            onClick={() => setIsMissionsOpen(true)}
          >
            📜
          </button>
          <button
            className="p-2 hover:text-electric-blue transition-colors relative"
            onClick={() => setIsUpgradeDockOpen(true)}
          >
            ⚡
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          </button>
          <button
            className="p-2 hover:text-electric-blue transition-colors"
            onClick={() => setIsReferralOpen(true)}
          >
            👯
          </button>
          <button
            className="p-2 hover:text-electric-blue transition-colors"
            onClick={() => setIsLeaderboardOpen(true)}
          >
            🏆
          </button>
        </div>
      </div>

      {/* Modals */}
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
      />

      {/* Version info */}
      <div className="absolute bottom-1 left-1 text-[10px] text-gray-700 pointer-events-none z-0">
        v1.0.2 - BagsTap
      </div>
    </div>
  );
}

export default App;
