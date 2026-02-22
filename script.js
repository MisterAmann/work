/* ═══════════════════════════════════════════════
   CINEMATIC BIRTHDAY EXPERIENCE — script.js
   ═══════════════════════════════════════════════ */

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
const isBudget  = isMobile;   /* Conservative — always optimise on mobile */

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
   FIX: unlockAndStartAudio is asynchronous.
   After Promise.allSettled resolves, we check
   if something else (the finale) has already
   taken over currentSound — if so, we do NOT
   start winter, which was overwriting the theme.
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
   PARTICLES
   ═══════════════════════════════════════════ */

function clearParticles() {
    if (particleInterval) { clearInterval(particleInterval); particleInterval = null; }
    particleContainer.querySelectorAll(".particle").forEach(p => {
        gsap.to(p, { opacity: 0, duration: 1.0, onComplete: () => p.remove() });
    });
}

function createParticle(type) {
    const p = document.createElement("div");
    p.classList.add("particle");
    if (type === "snow") {
        p.classList.add("snow");
        if (Math.random() < 0.2) p.classList.add("large");
        p.style.left = (Math.random() * 110 - 5) + "vw";
        p.style.top  = "-12px";
    } else if (type === "snow-storm") {
        p.classList.add("snow-storm");
        p.style.left = (Math.random() * 120 - 10) + "vw";
        p.style.top  = (Math.random() * -30) + "px";
    } else if (type === "petal") {
        p.classList.add("petal");
        p.style.left      = (Math.random() * 110 - 5) + "vw";
        p.style.top       = "-14px";
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
    }
    particleContainer.appendChild(p);
    animateParticle(p, type);
}

function animateParticle(p, type) {
    if (type === "snow-storm") {
        gsap.to(p, {
            y: window.innerHeight + 80,
            x: (Math.random() - 0.5) * (isBudget ? 320 : 500),
            rotation: Math.random() * 360,
            duration: 1.6 + Math.random() * 1.4,
            ease: "none", onComplete: () => p.remove()
        });
        return;
    }
    if (type === "petal") {
        gsap.to(p, {
            y: window.innerHeight + 60,
            x: (Math.random() - 0.5) * (isBudget ? 160 : 260),
            rotation: `+=${Math.random() * 160 - 80}`,
            duration: 8 + Math.random() * 5,
            ease: "sine.inOut", onComplete: () => p.remove()
        });
        return;
    }
    gsap.to(p, {
        y: window.innerHeight + 60,
        x: (Math.random() - 0.5) * 80,
        duration: 8 + Math.random() * 6,
        ease: "none", onComplete: () => p.remove()
    });
}

function startParticles(type, density) {
    clearParticles();
    setTimeout(() => {
        particleInterval = setInterval(() => createParticle(type), density);
    }, 900);
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
   ─────────────────────────────────────────
   Stars drift until isFormingStars = true,
   then lerp toward pixel targets that spell
   the full phrase. isFormingStars is set
   externally by startAutomatedFinale at T=43s.
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
        /* ── Offscreen pixel sampling ─────────── */
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

        /* Fisher-Yates shuffle — organic arrival */
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

            /* Trail fade — keeps stars visible without hard clear */
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
        /* Scene has a choice button — text fades out before button appears */
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
        currentWeather = s;
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
   Music starts at T=0. All timings are
   relative to that moment.

   T+0s    : Theme starts. Scene 14 activates.
   T+8.5s  : Scene 15 activates. Stars drift.
   T+18.5s : "Wait." fades in.
   T+22s   : "Wait." fades out.
   T+24s   : "…there was something written in light." in.
   T+29s   : "…there was something written in light." out.
   T+43s   : isFormingStars = true. The phrase forms.
   T+51s   : Bloom deepens at emotional peak.
   ═══════════════════════════════════════════ */

function startAutomatedFinale() {
    if (isTransitioning) return;

    /* Lock input — the film takes over */
    isTransitioning = true;

    /* ── T+0s: Music ────────────────────────
       FIX: We claim currentSound immediately,
       BEFORE the unlock Promise can resolve
       and mistakenly start winter over the theme.
    ─────────────────────────────────────────── */
    if (currentSound) {
        const fading = currentSound;
        gsap.to(fading, { volume: 0, duration: 4.5, onComplete: () => fading.pause() });
    }

    audio.theme.volume     = 0;
    audio.theme.currentTime = 0;
    currentSound = audio.theme;      /* Claim BEFORE async unlock resolves */

    audio.theme.play().catch(() => {
        /* Retry once — covers edge case where play was called
           a fraction too early relative to the unlock priming  */
        setTimeout(() => audio.theme.play().catch(() => {}), 150);
    });

    gsap.to(audio.theme, { volume: 0.35, duration: 6.0 });

    /* ── T+0s: Scene 14 ────────────────────── */
    scenes[currentScene].classList.remove("active");
    currentScene++;                          /* Scene 14 */
    const scene14 = scenes[currentScene];
    scene14.classList.add("active");
    updateProgress();

    /* Scene 14 particles (space) */
    if (currentWeather !== "space") {
        currentWeather = "space";
        startTwinklingStars();
    }

    /* Scene 14 dialogue — fades in then out naturally */
    const text14 = scene14.querySelector(".dialogue");
    if (text14) {
        gsap.set(text14, { opacity: 0, y: 6 });
        gsap.to(text14, { opacity: 1, y: 0, duration: 2.2, delay: 1.0, ease: "power1.out" });
        gsap.to(text14, { opacity: 0, y: -4, duration: 2.0, delay: 5.5, ease: "power1.inOut" });
    }

    /* ── T+8.5s: Scene 15 (Finale) ─────────── */
    setTimeout(() => {
        scenes[currentScene].classList.remove("active");
        currentScene++;                      /* Scene 15 */
        const scene15 = scenes[currentScene];
        scene15.classList.add("active");
        updateProgress();

        activateBloom(0.35);
        isFormingStars = false;
        initStarText();   /* Stars begin drifting — phrase not yet formed */

        const textWait  = document.getElementById("finaleText1");
        const textLight = document.getElementById("finaleText2");
        gsap.set([textWait, textLight], { opacity: 0, y: 6 });

        /* T+8.5s + 10s = T+18.5s — "Wait." */
        gsap.to(textWait, {
            opacity: 1, y: 0, duration: 2.5,
            delay: 10.0, ease: "power1.out"
        });
        /* T+8.5s + 13.5s = T+22s — fade "Wait." */
        gsap.to(textWait, {
            opacity: 0, y: -4, duration: 2.0,
            delay: 13.5, ease: "power1.inOut"
        });

        /* T+8.5s + 15.5s = T+24s — second line */
        gsap.to(textLight, {
            opacity: 1, y: 0, duration: 2.5,
            delay: 15.5, ease: "power1.out"
        });
        /* T+8.5s + 20.5s = T+29s — fade second line */
        gsap.to(textLight, {
            opacity: 0, y: -4, duration: 2.0,
            delay: 20.5, ease: "power1.inOut"
        });

        /* After T+29s: pure silence visually.
           Stars drift. Music builds. The user waits. */

    }, 8500);

    /* ── T+43s: THE DROP ──────────────────────
       Stars magnetically gather into the phrase.
       Timed to a specific moment in the music.
    ─────────────────────────────────────────── */
    setTimeout(() => {
        isFormingStars = true;
    }, 43000);

    /* T+51s: Bloom deepens — the phrase is now legible */
    setTimeout(() => activateBloom(0.85), 51000);
}

/* ═══════════════════════════════════════════
   SCENE TRANSITION (manual, pre-finale scenes)
   ═══════════════════════════════════════════ */

function showNextScene() {
    if (isTransitioning) return;
    /* Stop before the last two scenes — finale is automated */
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

/* Tap / click anywhere */
window.addEventListener("click", e => {
    if (e.target.classList.contains("choice")) return;
    tryAdvance(false);
}, { passive: true });

/* Choice buttons */
document.addEventListener("click", e => {
    if (!e.target.classList.contains("choice")) return;
    e.stopPropagation();

    /* Scene 13 = index 12 — "Look Up" triggers the automated finale */
    if (currentScene === 12) {
        unlockAndStartAudio();
        startAutomatedFinale();
    } else {
        tryAdvance(true);
    }
});

/* Keyboard */
window.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        tryAdvance(false);
    }
});

/* Touch swipe */
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
   INITIAL LOAD
   ═══════════════════════════════════════════ */

window.addEventListener("load", () => {
    checkOrientation();
    startParticles("snow", DENSITY.snow);
    currentWeather = "winter";
    animateDialogue(scenes[0]);
    updateProgress();
});

/* Fullscreen on first interaction */
let fullscreenRequested = false;
function requestFullscreenOnce() {
    if (fullscreenRequested) return;
    fullscreenRequested = true;
    enterFullscreen();
}
window.addEventListener("touchend", requestFullscreenOnce, { passive: true });
window.addEventListener("click",    requestFullscreenOnce);