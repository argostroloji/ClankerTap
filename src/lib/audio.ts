
// Web Audio API Synthesizer — Premium Sound Design
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

type SoundType = 'click' | 'upgrade' | 'error' | 'bgm_start' | 'slap'
    | 'combo_x2' | 'combo_x3' | 'combo_x5' | 'combo_x10' | 'lucky';

export const playSound = (type: SoundType) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
        case 'click':
        case 'slap': {
            // Satisfying pop/plop tap — like a bubble pop with body
            // Layer 1: Main pop (sine with fast pitch drop)
            const pop = ctx.createOscillator();
            const popGain = ctx.createGain();
            pop.connect(popGain);
            popGain.connect(ctx.destination);
            pop.type = 'sine';
            pop.frequency.setValueAtTime(600, now);
            pop.frequency.exponentialRampToValueAtTime(150, now + 0.08);
            popGain.gain.setValueAtTime(0.15, now);
            popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            pop.start(now);
            pop.stop(now + 0.12);

            // Layer 2: Click transient (triangle, very short)
            const click = ctx.createOscillator();
            const clickGain = ctx.createGain();
            click.connect(clickGain);
            clickGain.connect(ctx.destination);
            click.type = 'triangle';
            click.frequency.setValueAtTime(1200, now);
            click.frequency.exponentialRampToValueAtTime(300, now + 0.03);
            clickGain.gain.setValueAtTime(0.08, now);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            click.start(now);
            click.stop(now + 0.05);

            // Layer 3: Sub thump (sine, low)
            const thump = ctx.createOscillator();
            const thumpGain = ctx.createGain();
            thump.connect(thumpGain);
            thumpGain.connect(ctx.destination);
            thump.type = 'sine';
            thump.frequency.setValueAtTime(80, now);
            thump.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            thumpGain.gain.setValueAtTime(0.1, now);
            thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            thump.start(now);
            thump.stop(now + 0.1);
            break;
        }

        case 'upgrade': {
            // Ascending chime — 3 note arpeggio
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + i * 0.08);
                gain.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.3);
                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.3);
            });
            break;
        }

        case 'error': {
            // Low buzz
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
        }

        case 'combo_x2': {
            // "Nice!" — bright double ding
            playNote(ctx, 'sine', 880, 0.12, 0.15, now);       // A5
            playNote(ctx, 'sine', 1108.73, 0.1, 0.2, now + 0.08); // C#6
            break;
        }

        case 'combo_x3': {
            // "Great!" — ascending 3-note sparkle
            playNote(ctx, 'sine', 783.99, 0.1, 0.15, now);       // G5
            playNote(ctx, 'sine', 987.77, 0.1, 0.15, now + 0.06); // B5
            playNote(ctx, 'sine', 1174.66, 0.12, 0.2, now + 0.12); // D6
            break;
        }

        case 'combo_x5': {
            // "Excellent!" — triumphant power chord
            playNote(ctx, 'sine', 659.25, 0.12, 0.3, now);       // E5
            playNote(ctx, 'triangle', 830.61, 0.08, 0.3, now);   // Ab5 (harmony)
            playNote(ctx, 'sine', 987.77, 0.1, 0.25, now + 0.08); // B5
            playNote(ctx, 'sine', 1318.51, 0.12, 0.3, now + 0.15); // E6

            // Add shimmer layer
            const shimmer = ctx.createOscillator();
            const shimmerGain = ctx.createGain();
            shimmer.connect(shimmerGain);
            shimmerGain.connect(ctx.destination);
            shimmer.type = 'sine';
            shimmer.frequency.setValueAtTime(2637, now + 0.1);
            shimmerGain.gain.setValueAtTime(0, now);
            shimmerGain.gain.linearRampToValueAtTime(0.04, now + 0.15);
            shimmerGain.gain.linearRampToValueAtTime(0, now + 0.5);
            shimmer.start(now + 0.1);
            shimmer.stop(now + 0.5);
            break;
        }

        case 'combo_x10': {
            // "LEGENDARY!" — epic fanfare
            const fanfare = [
                { freq: 523.25, delay: 0, dur: 0.15 },      // C5
                { freq: 659.25, delay: 0.05, dur: 0.15 },    // E5
                { freq: 783.99, delay: 0.1, dur: 0.15 },     // G5
                { freq: 1046.5, delay: 0.15, dur: 0.3 },     // C6
                { freq: 1318.51, delay: 0.22, dur: 0.35 },   // E6
            ];

            fanfare.forEach(n => {
                playNote(ctx, 'sine', n.freq, 0.1, n.dur, now + n.delay);
                playNote(ctx, 'triangle', n.freq * 1.002, 0.05, n.dur, now + n.delay); // Slight detune for width
            });

            // Bass impact
            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bass.connect(bassGain);
            bassGain.connect(ctx.destination);
            bass.type = 'sine';
            bass.frequency.setValueAtTime(130.81, now);
            bass.frequency.exponentialRampToValueAtTime(65.41, now + 0.3);
            bassGain.gain.setValueAtTime(0.15, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            bass.start(now);
            bass.stop(now + 0.4);
            break;
        }

        case 'lucky': {
            // Jackpot! — slot machine win jingle
            const jingle = [
                { freq: 783.99, delay: 0, dur: 0.12 },       // G5
                { freq: 987.77, delay: 0.08, dur: 0.12 },    // B5
                { freq: 1174.66, delay: 0.16, dur: 0.12 },   // D6
                { freq: 1567.98, delay: 0.24, dur: 0.4 },    // G6 (hold)
            ];

            jingle.forEach(n => {
                playNote(ctx, 'sine', n.freq, 0.12, n.dur, now + n.delay);
            });

            // Shimmering top layer
            const top = ctx.createOscillator();
            const topGain = ctx.createGain();
            top.connect(topGain);
            topGain.connect(ctx.destination);
            top.type = 'sine';
            top.frequency.setValueAtTime(3135.96, now + 0.24);
            topGain.gain.setValueAtTime(0, now);
            topGain.gain.linearRampToValueAtTime(0.05, now + 0.28);
            topGain.gain.linearRampToValueAtTime(0, now + 0.7);
            top.start(now + 0.24);
            top.stop(now + 0.7);

            // Coin shower effect — rapid tiny notes
            for (let i = 0; i < 6; i++) {
                const coinFreq = 2000 + Math.random() * 2000;
                playNote(ctx, 'sine', coinFreq, 0.03, 0.06, now + 0.3 + i * 0.05);
            }
            break;
        }

        case 'bgm_start':
            break;
    }
};

// Helper for simple note playback
function playNote(
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    volume: number,
    duration: number,
    startTime: number
) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
}
