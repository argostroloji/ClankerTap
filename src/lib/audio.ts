
// Simple Web Audio API synth
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

type SoundType = 'click' | 'upgrade' | 'error' | 'bgm_start';

export const playSound = (type: SoundType) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
        case 'click':
            // Mechanical click: short, sharp, frequency drop
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;

        case 'upgrade':
            // High tech chime: sine wave, ascending
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);

            // Add a second layer for richness
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(600, now);
            osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
            gain2.gain.setValueAtTime(0.05, now);
            gain2.gain.linearRampToValueAtTime(0, now + 0.3);
            osc2.start(now);
            osc2.stop(now + 0.3);
            break;

        case 'error':
            // Low buzz
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.3);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;

        case 'bgm_start':
            // Just a placeholder/drone
            break;
    }
};
