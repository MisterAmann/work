/* ═══════════════════════════════════════════════
   CINEMATIC BIRTHDAY EXPERIENCE — script.js
   ═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   BIRTHDAY GATE
   ─────────────────────────────────────────
   Set the birthday below. Month is 0-indexed:
   Jan=0  Feb=1  Mar=2  Apr=3  May=4  Jun=5
   Jul=6  Aug=7  Sep=8  Oct=9  Nov=10 Dec=11
   ═══════════════════════════════════════════ */

const BIRTHDAY_MONTH = 1;   /* ← Change this */
const BIRTHDAY_DAY   = 25;   /* ← Change this */

(function checkBirthdayGate() {
    const now  = new Date();
    const isBirthday = (now.getMonth() === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY);
    if (isBirthday) return;

    const midnight = new Date();
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    const birthdayIsTomorrow =
        midnight.getMonth() === BIRTHDAY_MONTH &&
        midnight.getDate()  === BIRTHDAY_DAY;

    document.addEventListener("DOMContentLoaded", () => {
        document.body.innerHTML = "";
        document.body.style.cssText = `
            margin:0; overflow:hidden; background:#f2ede6;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            height:100vh; font-family:'Cormorant Garamond',Georgia,serif;
        `;

        const box = document.createElement("div");
        box.style.cssText = "text-align:center; padding:40px 32px; max-width:520px; width:100%;";

        const lines = [
            { text: "Oh. You're early.",                      delay: 0,    small: false },
            { text: "I'm not ready yet.",                     delay: 1800, small: false },
            { text: "Come back at midnight.",                 delay: 3400, small: false },
            { text: "(The polar bear isn't dressed either.)", delay: 5400, small: true  },
        ];

        lines.forEach(({ text, delay, small }) => {
            const p = document.createElement("p");
            p.textContent = text;
            p.style.cssText = `
                font-size:${small ? "clamp(11px,2vw,15px)" : "clamp(18px,3.5vw,28px)"};
                font-weight:300; font-style:italic;
                color:${small ? "rgba(40,32,24,0.40)" : "rgba(40,32,24,0.82)"};
                letter-spacing:0.05em; line-height:1.8; margin:0 0 0.2em;
                opacity:0; transition:opacity 1.2s ease, transform 1.2s ease;
                transform:translateY(8px);
            `;
            box.appendChild(p);
            setTimeout(() => { p.style.opacity = "1"; p.style.transform = "translateY(0)"; }, delay);
        });

        if (birthdayIsTomorrow) {

            const divider = document.createElement("div");
            divider.style.cssText = `
                width:1px; height:32px; background:rgba(40,32,24,0.15);
                margin:28px auto; opacity:0; transition:opacity 1.2s ease;
            `;
            box.appendChild(divider);
            setTimeout(() => { divider.style.opacity = "1"; }, 7000);

            const timerWrap = document.createElement("div");
            timerWrap.style.cssText = `
                display:flex; gap:clamp(16px,4vw,36px);
                align-items:flex-start; justify-content:center;
                opacity:0; transition:opacity 1.4s ease;
            `;
            box.appendChild(timerWrap);
            setTimeout(() => { timerWrap.style.opacity = "1"; }, 7200);

            const style = document.createElement("style");
            style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');
                @keyframes sepPulse { 0%,100%{opacity:0.20;} 50%{opacity:0.55;} }
                @keyframes digitFlip {
                    0%  {opacity:1;transform:translateY(0);}
                    40% {opacity:0;transform:translateY(-6px);}
                    60% {opacity:0;transform:translateY(6px);}
                    100%{opacity:1;transform:translateY(0);}
                }
                .digit-flip { animation:digitFlip 0.3s ease; }
            `;
            document.head.appendChild(style);

            const displays = {};
            ["hours","minutes","seconds"].forEach((unit, i, arr) => {
                const col = document.createElement("div");
                col.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:6px;";

                const num = document.createElement("span");
                num.style.cssText = `
                    font-size:clamp(32px,8vw,64px); font-weight:300; font-style:italic;
                    color:rgba(40,32,24,0.85); letter-spacing:0.04em; line-height:1;
                    font-variant-numeric:tabular-nums; min-width:2ch; display:inline-block;
                `;
                num.textContent = "00";

                const label = document.createElement("span");
                label.style.cssText = `
                    font-size:clamp(9px,1.5vw,12px); font-weight:300;
                    letter-spacing:0.22em; text-transform:uppercase;
                    color:rgba(40,32,24,0.35);
                `;
                label.textContent = unit;

                col.appendChild(num);
                col.appendChild(label);
                timerWrap.appendChild(col);
                displays[unit] = num;

                if (i < arr.length - 1) {
                    const sep = document.createElement("span");
                    sep.style.cssText = `
                        font-size:clamp(24px,5vw,44px); font-weight:300;
                        color:rgba(40,32,24,0.25); line-height:1;
                        padding-top:clamp(4px,1vw,8px);
                        animation:sepPulse 1s ease-in-out infinite;
                    `;
                    sep.textContent = "·";
                    timerWrap.appendChild(sep);
                }
            });

            function pad(n) { return String(n).padStart(2, "0"); }

            function update(el, val) {
                if (el.textContent === val) return;
                el.classList.remove("digit-flip");
                void el.offsetWidth;
                el.classList.add("digit-flip");
                el.textContent = val;
                el.addEventListener("animationend", () => el.classList.remove("digit-flip"), { once: true });
            }

            function tick() {
                const rem = midnight - Date.now();
                if (rem <= 0) { window.location.reload(); return; }
                const s = Math.floor(rem / 1000);
                update(displays["hours"],   pad(Math.floor(s / 3600)));
                update(displays["minutes"], pad(Math.floor((s % 3600) / 60)));
                update(displays["seconds"], pad(s % 60));
                setTimeout(tick, 1000);
            }

            setTimeout(tick, 7200);
        }

        document.body.appendChild(box);
    });

    throw new Error("Not yet.");
})();

/* ─── DOM ────────────────────────────────── */

const scenes            = document.querySelectorAll(".scene");
const particleContainer = document.getElementById("particles");
const bloomEl           = document.getElementById("bloom");
const rotateOverlay     = document.getElementById("rotate-overlay");
const TOTAL_SCENES      = scenes.length;

const audio = {
    winter : document.getElementById("audio-winter"),
    storm  : document.getElementById("audio-storm"),
    spring : document.getElementById("audio-spring"),
    space  : document.getElementById("audio-space"),
    theme  : document.getElementById("audio-theme"),
};

/* ─── State ──────────────────────────────── */

let currentScene     = 0;
let isTransitioning  = false;
let currentSound     = null;
let particleInterval = null;
let audioUnlocked    = false;
let currentWeather   = null;
let isFormingStars   = false;

/* ─── Device / Performance Detection ────── */

const isMobile  = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isBudget  = isMobile;

const DENSITY = {
    snow      : isBudget ? 500  : 320,
    storm     : isBudget ? 130  : 80,
    petal     : isBudget ? 550  : 360,
    starCount : isBudget ? 50   : 90,
};

const TARGET_FPS     = isBudget ? 24 : 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

/* ─── Progress Bar ───────────────────────── */

const progressBar = document.createElement("div");
progressBar.id    = "progress";
progressBar.style.width = "0%";
document.body.appendChild(progressBar);

function updateProgress() {
    progressBar.style.width = (currentScene / (TOTAL_SCENES - 1) * 100) + "%";
}

/* ═══════════════════════════════════════════
   FULLSCREEN + ORIENTATION LOCK
   ═══════════════════════════════════════════ */

function enterFullscreen() {
    if (!isMobile) return;
    const el = document.documentElement;
    const requestFS =
        el.requestFullscreen       ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen    ||
        el.msRequestFullscreen;
    if (!requestFS) return;
    requestFS.call(el).then(() => lockLandscape()).catch(() => lockLandscape());
}

function lockLandscape() {
    try {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape").catch(() => {});
        }
    } catch(e) {}
}

document.addEventListener("fullscreenchange",       handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFullscreen && isMobile && audioUnlocked) showFullscreenNudge();
}

function showFullscreenNudge() {
    const existing = document.getElementById("fs-nudge");
    if (existing) return;
    const nudge = document.createElement("div");
    nudge.id = "fs-nudge";
    nudge.textContent = "Tap to return to fullscreen";
    Object.assign(nudge.style, {
        position: "fixed", bottom: "16px", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "12px", letterSpacing: "0.18em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
        zIndex: "9000", pointerEvents: "auto", cursor: "pointer",
    });
    document.body.appendChild(nudge);
    nudge.addEventListener("click", () => { enterFullscreen(); nudge.remove(); });
    setTimeout(() => { if (nudge.parentNode) nudge.remove(); }, 5000);
}

/* ═══════════════════════════════════════════
   PORTRAIT DETECTION
   ═══════════════════════════════════════════ */

function checkOrientation() {
    if (!isMobile) return;
    const isPortrait = window.innerHeight > window.innerWidth;
    rotateOverlay.classList.toggle("visible", isPortrait);
}

window.addEventListener("resize",            checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

/* ═══════════════════════════════════════════
   AUDIO
   ─────────────────────────────────────────
   unlockAndStartAudio is async. After
   Promise.allSettled resolves we guard against
   the finale having already claimed currentSound,
   which would cause winter to overwrite theme.
   ═══════════════════════════════════════════ */

function unlockAndStartAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    const primes = Object.values(audio).map(el => {
        el.volume = 0;
        return el.play().then(() => el.pause()).catch(() => {});
    });

    Promise.allSettled(primes).then(() => {
        /* If the finale already claimed currentSound, do not override with winter */
        if (currentSound) return;

        audio.winter.volume = 0;
        audio.winter.currentTime = 0;
        audio.winter.play().catch(() => {});
        gsap.to(audio.winter, { volume: 0.10, duration: 3 });
        currentSound = audio.winter;
    });
}

function crossfade(toSound, targetVolume = 0.12, duration = 3.0) {
    if (currentSound === toSound) return;
    if (currentSound) {
        const fading = currentSound;
        gsap.to(fading, { volume: 0, duration, onComplete: () => fading.pause() });
    }
    toSound.volume = 0;
    toSound.currentTime = 0;
    toSound.play().catch(() => {});
    gsap.to(toSound, { volume: targetVolume, duration });
    currentSound = toSound;
}

/* ═══════════════════════════════════════════
   PARTICLE POOL
   ─────────────────────────────────────────
   Pre-allocate all particle elements once.
   Acquire/release instead of create/destroy.
   Eliminates DOM churn and GC pauses that
   cause stutter on budget devices.

   Pool sizes cover max concurrent particles
   at budget intervals with headroom:
     snow  : 500ms interval × ~12s fall = 32
     storm : 130ms interval × ~3s  fall = 30
     petal : 550ms interval × ~13s fall = 32
   ═══════════════════════════════════════════ */

const POOL_SIZES = { snow: 32, "snow-storm": 30, petal: 32 };
const pools      = {};

function buildPools() {
    ["snow", "snow-storm", "petal"].forEach(type => {
        pools[type] = [];
        for (let i = 0; i < POOL_SIZES[type]; i++) {
            const p = document.createElement("div");
            p.classList.add("particle");

            if (type === "snow") {
                p.classList.add("snow");
            } else if (type === "snow-storm") {
                p.classList.add("snow-storm");
            } else if (type === "petal") {
                p.classList.add("petal");
            }

            /* Park off-screen and invisible — not yet in the container */
            p.style.cssText = "position:absolute; opacity:0; left:-999px; top:-999px;";
            particleContainer.appendChild(p);
            pools[type].push({ el: p, inUse: false });
        }
    });
}

function acquireParticle(type) {
    const pool = pools[type];
    if (!pool) return null;
    const slot = pool.find(s => !s.inUse);
    if (!slot) return null;   /* Pool exhausted — skip this emit tick */
    slot.inUse = true;
    return slot;
}

function releaseParticle(slot) {
    gsap.killTweensOf(slot.el);
    slot.el.style.opacity   = "0";
    slot.el.style.left      = "-999px";
    slot.el.style.top       = "-999px";
    slot.el.style.transform = "";
    gsap.set(slot.el, { clearProps: "x,y,rotation" });
    slot.inUse = false;
}

/* ═══════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════ */

let particlesVisible = true;   /* Set false during pre-warm, true on activate */

function clearParticles() {
    if (particleInterval) { clearInterval(particleInterval); particleInterval = null; }

    /* Release all in-use slots back to their pools */
    Object.values(pools).forEach(pool => {
        pool.forEach(slot => {
            if (slot.inUse) releaseParticle(slot);
        });
    });
}

function createParticle(type) {
    const slot = acquireParticle(type);
    if (!slot) return;
    const p = slot.el;

    /* Reset classes — large snow is assigned per-emit */
    p.classList.remove("large");

    if (type === "snow") {
        if (Math.random() < 0.2) p.classList.add("large");
        p.style.left    = (Math.random() * 110 - 5) + "vw";
        p.style.top     = "-12px";
        p.style.opacity = particlesVisible ? "0.65" : "0";
    } else if (type === "snow-storm") {
        p.style.left    = (Math.random() * 120 - 10) + "vw";
        p.style.top     = (Math.random() * -30) + "px";
        p.style.opacity = particlesVisible ? "0.80" : "0";
    } else if (type === "petal") {
        p.style.left      = (Math.random() * 110 - 5) + "vw";
        p.style.top       = "-14px";
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        p.style.opacity   = particlesVisible ? "0.70" : "0";
    }

    animateParticle(slot, type);
}

function animateParticle(slot, type) {
    const p = slot.el;

    if (type === "snow-storm") {
        gsap.to(p, {
            y: window.innerHeight + 80,
            x: (Math.random() - 0.5) * (isBudget ? 320 : 500),
            rotation: Math.random() * 360,
            duration: 1.6 + Math.random() * 1.4,
            ease: "none",
            onComplete: () => releaseParticle(slot)
        });
        return;
    }
    if (type === "petal") {
        gsap.to(p, {
            y: window.innerHeight + 60,
            x: (Math.random() - 0.5) * (isBudget ? 160 : 260),
            rotation: `+=${Math.random() * 160 - 80}`,
            duration: 8 + Math.random() * 5,
            ease: "sine.inOut",
            onComplete: () => releaseParticle(slot)
        });
        return;
    }
    /* snow */
    gsap.to(p, {
        y: window.innerHeight + 60,
        x: (Math.random() - 0.5) * 80,
        duration: 8 + Math.random() * 6,
        ease: "none",
        onComplete: () => releaseParticle(slot)
    });
}

function startParticles(type, density) {
    clearParticles();
    setTimeout(() => {
        particleInterval = setInterval(() => createParticle(type), density);
    }, 900);
}

/* ─── Pre-warm ───────────────────────────────
   Called during intro Phase 2 (scarf sequence).
   Runs snow invisibly so particles are already
   mid-flight when scene 1 appears.
   activateParticles() fades them in on cue.
─────────────────────────────────────────────── */

function prewarmParticles() {
    particlesVisible = false;
    currentWeather   = "winter";
    startParticles("snow", DENSITY.snow);
}

function activateParticles() {
    particlesVisible = true;

    /* Fade in all currently drifting pool particles */
    Object.values(pools).forEach(pool => {
        pool.forEach(slot => {
            if (!slot.inUse) return;
            const target = slot.el.classList.contains("snow-storm") ? 0.80
                         : slot.el.classList.contains("petal")      ? 0.70
                         : 0.65;
            gsap.to(slot.el, { opacity: target, duration: 1.2, ease: "power1.out" });
        });
    });
}

/* ─── Twinkling Stars (DOM layer) ─────────── */

function createTwinklingStar() {
    const types = ["dot", "diamond", "cross"];
    const star  = document.createElement("div");
    star.classList.add("particle", "star", types[Math.floor(Math.random() * types.length)]);
    star.style.left = Math.random() * 100 + "vw";
    star.style.top  = Math.random() * 100 + "vh";
    const base = 0.08 + Math.random() * 0.20;
    star.style.opacity = base;
    particleContainer.appendChild(star);
    gsap.to(star, {
        opacity: base + 0.4 + Math.random() * 0.2,
        duration: 1.5 + Math.random() * 2.5,
        repeat: -1, yoyo: true, ease: "sine.inOut",
        delay: Math.random() * 3
    });
}

function startTwinklingStars(count = DENSITY.starCount) {
    clearParticles();
    for (let i = 0; i < count; i++) {
        setTimeout(() => createTwinklingStar(), i * 25);
    }
}

/* ═══════════════════════════════════════════
   STAR-TEXT FINALE (Canvas)
   ═══════════════════════════════════════════ */

function initStarText() {
    const canvas = document.getElementById("constellation");
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";

    const W   = canvas.width;
    const H   = canvas.height;
    const ctx = canvas.getContext("2d");

    const STAR_COUNT  = isBudget ? 1100 : 2400;
    const SAMPLE_RATE = isBudget ? 5    : 3;
    const BASE_LERP   = isBudget ? 0.045 : 0.030;

    document.fonts.ready.then(() => {
        const off    = document.createElement("canvas");
        off.width    = W;
        off.height   = H;
        const offCtx = off.getContext("2d");

        const line1 = "Happy Birthday,";
        const line2 = "Laura";

        const fs1 = Math.round(W * (isMobile ? 0.068 : 0.050));
        const fs2 = Math.round(W * (isMobile ? 0.150 : 0.115));

        const gap    = fs1 * 0.60;
        const blockH = fs1 + gap + fs2;
        const line1Y = (H - blockH) / 2 + fs1 * 0.5;
        const line2Y = line1Y + fs1 * 0.5 + gap + fs2 * 0.5;

        offCtx.fillStyle    = "white";
        offCtx.textAlign    = "center";
        offCtx.textBaseline = "middle";
        offCtx.font = `300 italic ${fs1}px 'Cormorant Garamond', Georgia, serif`;
        offCtx.fillText(line1, W / 2, line1Y);
        offCtx.font = `300 italic ${fs2}px 'Cormorant Infant', 'Cormorant Garamond', Georgia, serif`;
        offCtx.fillText(line2, W / 2, line2Y);

        const raw    = offCtx.getImageData(0, 0, W, H).data;
        const coords = [];
        for (let y = 0; y < H; y += SAMPLE_RATE) {
            for (let x = 0; x < W; x += SAMPLE_RATE) {
                if (raw[(y * W + x) * 4 + 3] > 128) coords.push({ x, y });
            }
        }

        if (coords.length === 0) {
            console.warn("Star formation: no pixels sampled — font may not have loaded.");
            return;
        }

        for (let i = coords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coords[i], coords[j]] = [coords[j], coords[i]];
        }

        const COLORS = [
            "255,255,255", "220,235,255", "255,245,228", "235,248,255", "255,238,248",
        ];

        const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
            const t = coords[i % coords.length];
            return {
                x  : Math.random() * W,
                y  : Math.random() * H,
                tx : t.x + (Math.random() - 0.5) * SAMPLE_RATE,
                ty : t.y + (Math.random() - 0.5) * SAMPLE_RATE,
                r     : Math.pow(Math.random(), 2.2) * (1.4 * dpr) + (0.22 * dpr),
                color : COLORS[Math.floor(Math.random() * COLORS.length)],
                phase : Math.random() * Math.PI * 2,
                tSpeed: 0.005 + Math.random() * 0.020,
                lerp  : BASE_LERP + (Math.random() - 0.5) * 0.016,
                driftX: (Math.random() - 0.5) * (0.20 * dpr),
                driftY: (Math.random() - 0.5) * (0.12 * dpr),
            };
        });

        let lastFrame = 0;

        function draw(ts) {
            if (ts - lastFrame < FRAME_INTERVAL) { requestAnimationFrame(draw); return; }
            lastFrame = ts;

            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(0, 0, W, H);
            ctx.globalCompositeOperation = "source-over";

            stars.forEach(s => {
                if (isFormingStars) {
                    s.x += (s.tx - s.x) * s.lerp;
                    s.y += (s.ty - s.y) * s.lerp;
                } else {
                    s.x += s.driftX;
                    s.y += s.driftY;
                    if (s.x < -4)    s.x = W + 4;
                    if (s.x > W + 4) s.x = -4;
                    if (s.y < -4)    s.y = H + 4;
                    if (s.y > H + 4) s.y = -4;
                }

                s.phase += s.tSpeed;
                const brightness = isFormingStars ? 0.95 : 0.58;
                const twinkle    = 0.42 + 0.58 * Math.abs(Math.sin(s.phase));
                ctx.globalAlpha  = twinkle * brightness;
                ctx.fillStyle    = `rgb(${s.color})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            requestAnimationFrame(draw);
        }

        gsap.to(canvas, { opacity: 1, duration: 2.2, ease: "power1.out" });
        requestAnimationFrame(draw);
    });
}

/* ═══════════════════════════════════════════
   DIALOGUE
   ═══════════════════════════════════════════ */

function animateDialogue(scene) {
    const text = scene.querySelector(".dialogue");
    const btn  = scene.querySelector(".choice");

    if (!text) return;

    gsap.set(text, { opacity: 0, y: 6 });

    if (btn) {
        gsap.set(btn, { opacity: 0, y: 6, pointerEvents: "none" });
        gsap.to(text, { opacity: 1, y: 0, duration: 2.2, delay: 1.4, ease: "power1.out" });
        gsap.to(text, { opacity: 0, y: -4, duration: 1.5, delay: 6.5, ease: "power1.inOut" });
        gsap.to(btn,  {
            opacity: 1, y: 0, duration: 2.2, delay: 7.5, ease: "power1.out",
            onComplete: () => { btn.style.pointerEvents = "auto"; }
        });
    } else {
        gsap.to(text, { opacity: 1, y: 0, duration: 2.2, delay: 1.4, ease: "power1.out" });
    }
}

/* ═══════════════════════════════════════════
   BLOOM
   ═══════════════════════════════════════════ */

function activateBloom(intensity = 1) {
    gsap.to(bloomEl, { opacity: intensity, duration: 4, ease: "power1.inOut" });
    if (!isMobile) {
        const proxy = { blur: 0 };
        gsap.to(proxy, {
            blur: 4 * intensity, duration: 4, ease: "power1.inOut",
            onUpdate() {
                bloomEl.style.backdropFilter       = `blur(${proxy.blur}px)`;
                bloomEl.style.webkitBackdropFilter = `blur(${proxy.blur}px)`;
            }
        });
    }
}

/* ═══════════════════════════════════════════
   SCENE EFFECTS
   ═══════════════════════════════════════════ */

function handleSceneEffects(scene) {
    const s = scene.dataset.sound;

    if (s === "winter") crossfade(audio.winter, 0.10);
    if (s === "storm")  crossfade(audio.storm,  0.15);
    if (s === "spring") crossfade(audio.spring, 0.13);
    if (s === "space")  crossfade(audio.space,  0.10);

    if (currentWeather !== s) {
        currentWeather   = s;
        particlesVisible = true;   /* Always visible on manual scene transitions */
        if (s === "winter") startParticles("snow",       DENSITY.snow);
        if (s === "storm")  startParticles("snow-storm", DENSITY.storm);
        if (s === "spring") startParticles("petal",      DENSITY.petal);
        if (s === "space")  startTwinklingStars();
    }
}

/* ═══════════════════════════════════════════
   AUTOMATED CINEMATIC FINALE
   ─────────────────────────────────────────
   Triggered when "Look Up" is tapped.
   All timings relative to T=0 (music start).

   T+0s    : Theme starts. Scene 14 activates.
   T+8.5s  : Scene 15 activates. Stars drift.
   T+21.5s : "Wait." fades in.
   T+25s   : "Wait." fades out.
   T+30s   : second line fades in.
   T+32.5s : second line fades out.
   T+43s   : Stars form the phrase.
   T+51s   : Bloom deepens.
   ═══════════════════════════════════════════ */

function startAutomatedFinale() {
    if (isTransitioning) return;

    isTransitioning = true;

    if (currentSound) {
        const fading = currentSound;
        gsap.to(fading, { volume: 0, duration: 4.5, onComplete: () => fading.pause() });
    }

    audio.theme.volume      = 0;
    audio.theme.currentTime = 0;
    currentSound = audio.theme;

    audio.theme.play().catch(() => {
        setTimeout(() => audio.theme.play().catch(() => {}), 150);
    });

    gsap.to(audio.theme, { volume: 0.35, duration: 6.0 });

    scenes[currentScene].classList.remove("active");
    currentScene++;
    const scene14 = scenes[currentScene];
    scene14.classList.add("active");
    updateProgress();

    if (currentWeather !== "space") {
        currentWeather = "space";
        startTwinklingStars();
    }

    const text14 = scene14.querySelector(".dialogue");
    if (text14) {
        gsap.set(text14, { opacity: 0, y: 6 });
        gsap.to(text14, { opacity: 1, y: 0, duration: 2.2, delay: 1.0, ease: "power1.out" });
        gsap.to(text14, { opacity: 0, y: -4, duration: 2.0, delay: 5.5, ease: "power1.inOut" });
    }

    setTimeout(() => {
        scenes[currentScene].classList.remove("active");
        currentScene++;
        const scene15 = scenes[currentScene];
        scene15.classList.add("active");
        updateProgress();

        activateBloom(0.35);
        isFormingStars = false;
        initStarText();

        const textWait  = document.getElementById("finaleText1");
        const textLight = document.getElementById("finaleText2");
        gsap.set([textWait, textLight], { opacity: 0, y: 6 });

        gsap.to(textWait,  { opacity: 1, y: 0,  duration: 2.5, delay: 13.0, ease: "power1.out"   });
        gsap.to(textWait,  { opacity: 0, y: -4, duration: 2.0, delay: 16.5, ease: "power1.inOut" });
        gsap.to(textLight, { opacity: 1, y: 0,  duration: 2.5, delay: 21.5, ease: "power1.out"   });
        gsap.to(textLight, { opacity: 0, y: -4, duration: 2.0, delay: 24.0, ease: "power1.inOut" });

    }, 8500);

    setTimeout(() => { isFormingStars = true; }, 43000);
    setTimeout(() => activateBloom(0.85), 51000);
}

/* ═══════════════════════════════════════════
   SCENE TRANSITION (manual, pre-finale)
   ═══════════════════════════════════════════ */

function showNextScene() {
    if (isTransitioning) return;
    if (currentScene >= TOTAL_SCENES - 3) return;

    isTransitioning = true;
    scenes[currentScene].classList.remove("active");
    currentScene++;
    const next = scenes[currentScene];
    next.classList.add("active");

    animateDialogue(next);
    handleSceneEffects(next);
    updateProgress();

    setTimeout(() => { isTransitioning = false; }, 1800);
}

/* ═══════════════════════════════════════════
   INPUT HANDLING
   ═══════════════════════════════════════════ */

function tryAdvance(fromChoiceClick = false) {
    if (isMobile && rotateOverlay.classList.contains("visible")) return;
    const active = scenes[currentScene];
    if (!fromChoiceClick && active.querySelector(".choice")) return;
    unlockAndStartAudio();
    showNextScene();
}

window.addEventListener("click", e => {
    if (e.target.classList.contains("choice")) return;
    if (e.target.closest("#intro-overlay")) return;
    tryAdvance(false);
}, { passive: true });

document.addEventListener("click", e => {
    if (!e.target.classList.contains("choice")) return;
    e.stopPropagation();
    if (currentScene === 12) {
        unlockAndStartAudio();
        startAutomatedFinale();
    } else {
        tryAdvance(true);
    }
});

window.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        tryAdvance(false);
    }
});

let touchStartX = 0;
let touchStartY = 0;
window.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });
window.addEventListener("touchend", e => {
    const dx = touchStartX - e.changedTouches[0].screenX;
    const dy = Math.abs(touchStartY - e.changedTouches[0].screenY);
    if (dx > 40 && dy < 60) tryAdvance(false);
}, { passive: true });

/* ═══════════════════════════════════════════
   INTRO SEQUENCE
   ─────────────────────────────────────────
   Phase 0 · "Tap to enter" — shown on load.
             Tap calls requestFullscreen()
             directly (required for Android).
             Audio is primed silently here.

   Phase 1 · Wait for fullscreen + landscape.
             Rotate overlay guides the user.
             Once both confirmed, sequence runs.

   Phase 2 · Scarf lines play one by one.
             "Tap anywhere." appears after.

   Phase 3 · Tap → snow + audio + scene 1.
   ═══════════════════════════════════════════ */

const introOverlay = document.getElementById("intro-overlay");
const introText    = document.getElementById("intro-text");
const introTap     = document.getElementById("intro-tap");

const INTRO_LINES = [
    "Oh Hello...",
    "You found your way here",
    "Maybe it was meant in stars?",
    "Where are my manners?",
    "I am a scarf.",
    "Woven with Patience.",
    "And at last...",
    "A story",
    "once whispered into me",
    "may now be told",
    "If you wish to listen…",
];

let introPhase    = 0;
let introComplete = false;

function showEntrancePrompt() {
    introText.textContent = "";
    introTap.textContent  = "Tap to enter";
    introTap.classList.add("visible");
}

function handleEntranceTap(e) {
    if (introPhase !== 0) return;
    if (e.type === "touchend") e.preventDefault();
    introPhase = 1;

    introTap.classList.remove("visible");

    const el = document.documentElement;
    const requestFS =
        el.requestFullscreen       ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen    ||
        el.msRequestFullscreen;

    if (requestFS) {
        requestFS.call(el)
            .then(() => { lockLandscape(); checkReadyToBegin(); })
            .catch(() => { checkReadyToBegin(); });
    } else {
        checkReadyToBegin();
    }

    primAudioSilently();
}

function primAudioSilently() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    Object.values(audio).forEach(el => {
        el.volume = 0;
        el.play().then(() => el.pause()).catch(() => {});
    });
}

function checkReadyToBegin() {
    if (introPhase !== 1) return;

    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobile) {
        rotateOverlay.classList.toggle("visible", !isLandscape);
    }

    if (isMobile ? isLandscape : true) {
        introPhase = 2;
        rotateOverlay.classList.remove("visible");
        prewarmParticles();    /* Snow runs invisibly during scarf sequence */
        runIntroSequence();
    }
}

window.addEventListener("orientationchange", () => {
    setTimeout(checkReadyToBegin, 350);
});
window.addEventListener("resize", () => {
    if (introPhase === 1) checkReadyToBegin();
});
document.addEventListener("fullscreenchange",       () => { if (introPhase === 1) checkReadyToBegin(); });
document.addEventListener("webkitfullscreenchange", () => { if (introPhase === 1) checkReadyToBegin(); });

function runIntroSequence() {
    let time = 0;

    INTRO_LINES.forEach(line => {
        setTimeout(() => {
            gsap.fromTo(introText,
                { opacity: 0, y: 8 },
                { opacity: 1, y: 0, duration: 1.8, ease: "power1.out",
                  onStart: () => { introText.textContent = line; } }
            );
        }, time);

        time += 1200;
        time += 1800;

        setTimeout(() => {
            gsap.to(introText, { opacity: 0, y: -6, duration: 1.0, ease: "power1.inOut" });
        }, time);

        time += 1000;
        time += 400;
    });

    setTimeout(() => {
        introText.textContent = "";
        introTap.textContent  = "Tap anywhere.";
        introTap.classList.add("visible");
        introPhase    = 3;
        introComplete = true;
    }, time);
}

function dismissIntro() {
    if (!introComplete) return;

    introOverlay.classList.add("hidden");

    setTimeout(() => {
        introOverlay.style.display = "none";
        scenes[0].classList.add("active");
        animateDialogue(scenes[0]);
        updateProgress();

        /* Particles are already mid-flight from pre-warm —
           just fade them in and start winter audio          */
        activateParticles();
        crossfade(audio.winter, 0.10);
    }, 1600);
}

introOverlay.addEventListener("click", e => {
    if (introPhase === 0) { handleEntranceTap(e); return; }
    if (introPhase === 3) { dismissIntro(); }
});
introOverlay.addEventListener("touchend", e => {
    if (introPhase === 0) { handleEntranceTap(e); return; }
    if (introPhase === 3) { e.preventDefault(); dismissIntro(); }
}, { passive: false });

/* ═══════════════════════════════════════════
   INITIAL LOAD
   ═══════════════════════════════════════════ */

window.addEventListener("load", () => {
    checkOrientation();
    currentWeather = "winter";
    buildPools();          /* Pre-allocate all particle elements once */
    showEntrancePrompt();
});