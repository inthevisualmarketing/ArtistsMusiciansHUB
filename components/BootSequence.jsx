"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// AMH BOOT SEQUENCE — PlayStation × Cyberpunk Fusion
// Drop into your Next.js app as: components/BootSequence.jsx
// Wrap your _app.jsx or layout.jsx with <BootSequence>
// ============================================================

const GRID_SIZE = 40;

function ElectricGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let pulses = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // All active node positions keyed as "col,row" → pulse id
    // Used to detect when two pulses share a node and trigger redirect
    const occupied = new Map();

    const COLORS = [
      "188,19,254",  // purple  (dominant)
      "188,19,254",
      "0,240,255",   // cyan
      "255,42,109",  // pink
    ];

    let nextId = 0;

    function pickDir(col, row, avoidDir, cols, rows) {
      const dirs = [
        { dc: 1, dr: 0 }, { dc: -1, dr: 0 },
        { dc: 0, dr: 1 }, { dc: 0, dr: -1 },
      ];
      // Filter valid moves (stay on canvas)
      const valid = dirs.filter((d) => {
        const nc = col + d.dc, nr = row + d.dr;
        return nc >= 0 && nc <= cols && nr >= 0 && nr <= rows;
      });
      // For redirect, exclude the direction we were heading
      const deflected = avoidDir
        ? valid.filter((d) => !(d.dc === avoidDir.dc && d.dr === avoidDir.dr))
        : valid;
      const pool = deflected.length ? deflected : valid;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function createPulse(fromCol, fromRow, initialDir) {
      const cols = Math.floor(canvas.width  / GRID_SIZE);
      const rows = Math.floor(canvas.height / GRID_SIZE);
      const col  = fromCol ?? Math.floor(Math.random() * cols);
      const row  = fromRow ?? Math.floor(Math.random() * rows);
      const dir  = initialDir ?? pickDir(col, row, null, cols, rows);
      const id   = nextId++;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        id, color,
        col, row,           // current grid node (head)
        dir,                // current direction {dc,dr}
        t: 0,               // 0→1 progress to next node
        speed: 0.004 + Math.random() * 0.004,   // very slow — DVD feel
        trailLength: 3 + Math.floor(Math.random() * 3),
        alpha: 0.18 + Math.random() * 0.14,     // very dim
        trail: [],          // [{x,y}] pixel coords of recent positions
        done: false,
        cols, rows,
      };
    }

    // Spawn 2 pulses immediately, staggered
    pulses.push(createPulse());
    setTimeout(() => { if (pulses.length < 2) pulses.push(createPulse()); }, 2200);

    // Respawn when one dies — keep exactly 1-2 alive
    function maybeRespawn() {
      if (pulses.filter(p => !p.done).length < 2) {
        pulses.push(createPulse());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pulses.forEach((p) => {
        if (p.done) return;

        // Record trail position (pixel coords of head)
        const px = p.col * GRID_SIZE + p.dir.dc * GRID_SIZE * p.t;
        const py = p.row * GRID_SIZE + p.dir.dr * GRID_SIZE * p.t;
        p.trail.push({ x: px, y: py });
        if (p.trail.length > p.trailLength * 18) p.trail.shift();

        // Advance t
        p.t += p.speed;

        if (p.t >= 1) {
          // Arrived at next node
          p.t = 0;
          p.col += p.dir.dc;
          p.row += p.dir.dr;

          // Boundary bounce — flip direction axis
          if (p.col <= 0 || p.col >= p.cols) {
            p.dir = { dc: -p.dir.dc, dr: p.dir.dr };
            p.col = Math.max(0, Math.min(p.cols, p.col));
          }
          if (p.row <= 0 || p.row >= p.rows) {
            p.dir = { dc: p.dir.dc, dr: -p.dir.dr };
            p.row = Math.max(0, Math.min(p.rows, p.row));
          }

          // Check if another pulse is at this node → redirect both
          const key = `${p.col},${p.row}`;
          const otherId = occupied.get(key);
          if (otherId !== undefined && otherId !== p.id) {
            const other = pulses.find(q => q.id === otherId && !q.done);
            if (other) {
              // Both deflect away from each other
              p.dir     = pickDir(p.col,     p.row,     p.dir,     p.cols, p.rows);
              other.dir = pickDir(other.col, other.row, other.dir, other.cols, other.rows);
            }
          }
          occupied.set(key, p.id);

          // Occasionally change direction at intersections (rare — keeps paths long)
          if (Math.random() < 0.08) {
            p.dir = pickDir(p.col, p.row, p.dir, p.cols, p.rows);
          }

          // Long lifespan — die after ~600 node steps
          p._steps = (p._steps || 0) + 1;
          if (p._steps > 600) {
            p.done = true;
            setTimeout(maybeRespawn, 800 + Math.random() * 1200);
          }
        }

        // Draw trail as a fading polyline
        if (p.trail.length < 2) return;
        for (let i = 1; i < p.trail.length; i++) {
          const a = p.trail[i - 1];
          const b = p.trail[i];
          const progress = i / p.trail.length;  // 0=oldest → 1=newest

          // Glow layer
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${p.color},${progress * p.alpha * 0.35})`;
          ctx.lineWidth   = 4;
          ctx.lineCap     = "round";
          ctx.stroke();

          // Core layer
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${p.color},${progress * p.alpha})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }

        // Tiny dim head dot — no bright white, very subtle
        const head = p.trail[p.trail.length - 1];
        if (head) {
          const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 5);
          grad.addColorStop(0, `rgba(${p.color},${p.alpha * 1.4})`);
          grad.addColorStop(1, `rgba(${p.color},0)`);
          ctx.beginPath();
          ctx.arc(head.x, head.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      // Cleanup
      pulses = pulses.filter((p) => !p.done);

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    />
  );
}

const BOOT_LINES = [
  { text: "BIOS v2.1.0  Copyright (C) AMH SYSTEMS", delay: 0 },
  { text: "CPU: RHYTHM CORE @ 808MHz", delay: 300 },
  { text: "MEMORY TEST: 1,000,000 STREAMS............ OK", delay: 600 },
  { text: "CHECKING AUDIO MODULES..................... OK", delay: 950 },
  { text: "LOADING ARTIST DATABASE [SAN ANTONIO TX]...", delay: 1300 },
  { text: "TONE ZONE ARTISTS: 19 FOUND............... OK", delay: 1800 },
  { text: "ESTABLISHING RHYTHM SYNC................... CONNECTED", delay: 2300 },
  { text: "AMPLIFY ENGINE: INITIALIZING............... OK", delay: 2700 },
  { text: "WEB3 MODULES: STANDBY", delay: 3050 },
  { text: "INITIALIZING AMH CORE v2.1.0...............", delay: 3400 },
  { text: "", delay: 3700 },
  { text: "██████████████████████████ 100%", delay: 3900 },
  { text: "", delay: 4100 },
  { text: "WELCOME TO ARTISTS MUSICIANS HUB", delay: 4200 },
];

const SCANLINE_COUNT = 80;

export default function BootSequence({ children }) {
  const [phase, setPhase] = useState("press"); // press | booting | logo | done
  const [visibleLines, setVisibleLines] = useState([]);
  const [showCursor, setShowCursor] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const terminalRef = useRef(null);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(t);
  }, []);

  // Boot sequence logic
  useEffect(() => {
    if (phase !== "booting") return;

    const timers = [];
    BOOT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
        // progress bar
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
      }, line.delay);
      timers.push(t);
    });

    // Transition to logo phase
    const logoTimer = setTimeout(() => setPhase("logo"), 5000);
    timers.push(logoTimer);

    // Final done
    const doneTimer = setTimeout(() => setPhase("done"), 7800);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  if (phase === "done") return <>{children}</>;

  return (
    <AnimatePresence>
      <motion.div
        key="boot"
        style={styles.root}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        {/* Scanlines overlay */}
        <div style={styles.scanlines} />

        {/* Grid background */}
        <div style={styles.grid} />

        {/* Electric grid pulses */}
        <ElectricGrid />

        {/* Corner brackets */}
        <div style={{ ...styles.corner, ...styles.cornerTL }} />
        <div style={{ ...styles.corner, ...styles.cornerTR }} />
        <div style={{ ...styles.corner, ...styles.cornerBL }} />
        <div style={{ ...styles.corner, ...styles.cornerBR }} />

        {/* HUD top bar */}
        <div style={styles.hudTop}>
          <span style={styles.hudLabel}>AMH_SYS</span>
          <span style={styles.hudLabel}>◈ SECURE BOOT</span>
          <span style={styles.hudLabel}>NODE:SA-TX-01</span>
        </div>

        {/* PRESS START screen */}
        <AnimatePresence>
          {phase === "press" && (
            <motion.div
              key="press"
              style={styles.pressScreen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              {/* Music symbol cluster */}
              <motion.div
                style={styles.diamonds}
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <span style={{ ...styles.diamond, color: "#00f0ff" }}>𝄞</span>
                <span style={{ ...styles.diamond, color: "#ff2a6d" }}>♩</span>
                <span style={{ ...styles.diamond, color: "#bc13fe" }}>♫</span>
                <span style={{ ...styles.diamond, color: "#f5f500" }}>𝄢</span>
              </motion.div>

              <motion.h1
                style={styles.amhTitle}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ARTISTS MUSICIANS HUB
              </motion.h1>

              <div style={styles.glitchWrap}>
                <span style={styles.glitchText} data-text="PRESS START">
                  PRESS START
                </span>
              </div>

              <motion.button
                style={styles.startBtn}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px #bc13fe" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPhase("booting")}
              >
                ▶ INITIALIZE
              </motion.button>

              <p style={styles.subText}>AMPLIFY YOUR MUSIC. OWN YOUR SOUND.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOOT TERMINAL screen */}
        <AnimatePresence>
          {phase === "booting" && (
            <motion.div
              key="terminal"
              style={styles.terminal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.terminalHeader}>
                <span style={styles.termHeaderDot} />
                <span style={{ ...styles.termHeaderDot, background: "#bc13fe" }} />
                <span style={{ ...styles.termHeaderDot, background: "#00f0ff" }} />
                <span style={styles.termHeaderTitle}>AMH CORE BOOT SEQUENCE v2.1.0</span>
              </div>

              <div ref={terminalRef} style={styles.terminalBody}>
                {visibleLines.map((line, i) => (
                  <motion.div
                    key={i}
                    style={styles.termLine}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {line.includes("100%") ? (
                      <span style={styles.progressLine}>{line}</span>
                    ) : line.includes("WELCOME") ? (
                      <span style={styles.welcomeLine}>{line}</span>
                    ) : line.includes("OK") ? (
                      <>
                        <span style={styles.termLineBase}>
                          {line.replace("OK", "")}
                        </span>
                        <span style={styles.okText}>OK</span>
                      </>
                    ) : line.includes("CONNECTED") ? (
                      <>
                        <span style={styles.termLineBase}>
                          {line.replace("CONNECTED", "")}
                        </span>
                        <span style={styles.connectedText}>CONNECTED</span>
                      </>
                    ) : (
                      <span style={styles.termLineBase}>{line}</span>
                    )}
                  </motion.div>
                ))}
                {showCursor && (
                  <span style={styles.cursor}>█</span>
                )}
              </div>

              {/* Progress bar */}
              <div style={styles.progressWrap}>
                <div style={styles.progressLabel}>
                  LOADING AMH CORE
                </div>
                <div style={styles.progressTrack}>
                  <motion.div
                    style={styles.progressFill}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div style={styles.progressPct}>{progress}%</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOGO REVEAL screen */}
        <AnimatePresence>
          {phase === "logo" && (
            <motion.div
              key="logo"
              style={styles.logoScreen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Particle rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  style={{
                    ...styles.ring,
                    width: i * 180,
                    height: i * 180,
                    opacity: 0.15 / i,
                  }}
                  animate={{ rotate: 360 * (i % 2 === 0 ? -1 : 1) }}
                  transition={{
                    duration: 8 + i * 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}

              <motion.div
                style={styles.logoWrap}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.4 }}
              >
                <div style={styles.logoBox}>
                  <span style={styles.logoAMH}>AMH</span>
                  <div style={styles.logoUnderline} />
                </div>
              </motion.div>

              <motion.div
                style={styles.logoSubWrap}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <p style={styles.logoSub}>ARTISTS MUSICIANS HUB</p>
                <p style={styles.logoTagline}>SAN ANTONIO · EST. 2018 · 1M+ STREAMS</p>
              </motion.div>

              {/* Music symbols row */}
              <motion.div
                style={styles.symbols}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                {[
                  { s: "𝄞", color: "#00f0ff" },  // Treble Clef
                  { s: "♩",  color: "#ff2a6d" },  // Quarter Note
                  { s: "♫",  color: "#bc13fe" },  // Beamed Eighth Notes
                  { s: "𝄢", color: "#f5f500" },  // Bass Clef
                ].map(({ s, color }, i) => (
                  <motion.span
                    key={i}
                    style={{ ...styles.symbol, color, filter: `drop-shadow(0 0 8px ${color})` }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    {s}
                  </motion.span>
                ))}
              </motion.div>

              <motion.p
                style={styles.enterText}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 1.8, duration: 1.2, repeat: Infinity }}
              >
                ENTERING THE TONE ZONE...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD bottom bar */}
        <div style={styles.hudBottom}>
          <span style={styles.hudLabel}>◈ SECURE</span>
          <span style={styles.hudLabel}>
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </span>
          <span style={styles.hudLabel}>AMPLIFY READY</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = {
  root: {
    position: "fixed",
    inset: 0,
    background: "#0a0010",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    overflow: "hidden",
    zIndex: 9999,
  },
  scanlines: {
    position: "absolute",
    inset: 0,
    background: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.18) 2px,
      rgba(0,0,0,0.18) 4px
    )`,
    pointerEvents: "none",
    zIndex: 10,
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(188,19,254,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(188,19,254,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#bc13fe",
    borderStyle: "solid",
    opacity: 0.7,
  },
  cornerTL: { top: 16, left: 16, borderWidth: "2px 0 0 2px" },
  cornerTR: { top: 16, right: 16, borderWidth: "2px 2px 0 0" },
  cornerBL: { bottom: 16, left: 16, borderWidth: "0 0 2px 2px" },
  cornerBR: { bottom: 16, right: 16, borderWidth: "0 2px 2px 0" },
  hudTop: {
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 32,
    zIndex: 20,
  },
  hudBottom: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 32,
    zIndex: 20,
  },
  hudLabel: {
    color: "#8b5cf6",
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },

  // PRESS START
  pressScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    textAlign: "center",
    padding: "0 24px",
  },
  diamonds: {
    display: "flex",
    gap: 24,
    fontSize: 36,
    marginBottom: 8,
    alignItems: "center",
  },
  diamond: {
    filter: "drop-shadow(0 0 8px currentColor)",
  },
  amhTitle: {
    color: "#e0d0ff",
    fontSize: "clamp(18px, 4vw, 36px)",
    letterSpacing: "0.3em",
    fontWeight: 400,
    margin: 0,
    textShadow: "0 0 20px rgba(188,19,254,0.6)",
    fontFamily: "'Share Tech Mono', monospace",
  },
  glitchWrap: {
    position: "relative",
  },
  glitchText: {
    position: "relative",
    color: "#bc13fe",
    fontSize: "clamp(12px, 2vw, 16px)",
    letterSpacing: "0.5em",
    textShadow: "0 0 10px #bc13fe",
  },
  startBtn: {
    background: "transparent",
    border: "1px solid #bc13fe",
    color: "#bc13fe",
    padding: "14px 40px",
    fontSize: 14,
    letterSpacing: "0.3em",
    cursor: "pointer",
    fontFamily: "'Share Tech Mono', monospace",
    boxShadow: "0 0 14px rgba(188,19,254,0.3), inset 0 0 14px rgba(188,19,254,0.05)",
    transition: "all 0.2s",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
  },
  subText: {
    color: "#5b4a7a",
    fontSize: 11,
    letterSpacing: "0.25em",
    margin: 0,
  },

  // TERMINAL
  terminal: {
    width: "min(680px, 92vw)",
    background: "rgba(10,0,20,0.95)",
    border: "1px solid rgba(188,19,254,0.3)",
    boxShadow: "0 0 40px rgba(188,19,254,0.15), inset 0 0 40px rgba(0,0,0,0.5)",
  },
  terminalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderBottom: "1px solid rgba(188,19,254,0.2)",
    background: "rgba(188,19,254,0.05)",
  },
  termHeaderDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#3d2060",
  },
  termHeaderTitle: {
    color: "#6b3fa0",
    fontSize: 10,
    letterSpacing: "0.2em",
    marginLeft: 8,
  },
  terminalBody: {
    padding: "20px 24px",
    minHeight: 280,
    maxHeight: 320,
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  termLine: {
    lineHeight: "1.8",
    fontSize: "clamp(10px, 1.8vw, 13px)",
    minHeight: "1.8em",
  },
  termLineBase: {
    color: "#a78bca",
  },
  okText: {
    color: "#00f0ff",
    fontWeight: "bold",
    textShadow: "0 0 8px #00f0ff",
  },
  connectedText: {
    color: "#bc13fe",
    fontWeight: "bold",
    textShadow: "0 0 8px #bc13fe",
  },
  progressLine: {
    color: "#bc13fe",
    textShadow: "0 0 10px rgba(188,19,254,0.8)",
    letterSpacing: "0.05em",
  },
  welcomeLine: {
    color: "#e0d0ff",
    fontSize: "clamp(12px, 2vw, 15px)",
    letterSpacing: "0.2em",
    textShadow: "0 0 20px rgba(188,19,254,0.8)",
  },
  cursor: {
    color: "#bc13fe",
    fontSize: 14,
    animation: "none",
  },
  progressWrap: {
    padding: "12px 24px 16px",
    borderTop: "1px solid rgba(188,19,254,0.15)",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  progressLabel: {
    color: "#6b3fa0",
    fontSize: 10,
    letterSpacing: "0.15em",
    whiteSpace: "nowrap",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    background: "rgba(188,19,254,0.15)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #711c91, #bc13fe, #00f0ff)",
    boxShadow: "0 0 10px #bc13fe",
    width: "0%",
  },
  progressPct: {
    color: "#bc13fe",
    fontSize: 11,
    fontWeight: "bold",
    minWidth: 36,
    textAlign: "right",
  },

  // LOGO
  logoScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    position: "relative",
    width: "100%",
    height: "100%",
  },
  ring: {
    position: "absolute",
    borderRadius: "50%",
    border: "1px solid #bc13fe",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  logoWrap: {
    position: "relative",
    zIndex: 2,
  },
  logoBox: {
    padding: "24px 48px",
    border: "2px solid rgba(188,19,254,0.6)",
    boxShadow: "0 0 40px rgba(188,19,254,0.4), inset 0 0 40px rgba(188,19,254,0.05)",
    clipPath: "polygon(16px 0%, 100% 0%, calc(100% - 16px) 100%, 0% 100%)",
    textAlign: "center",
  },
  logoAMH: {
    display: "block",
    color: "#e0d0ff",
    fontSize: "clamp(48px, 12vw, 96px)",
    letterSpacing: "0.3em",
    fontFamily: "'Share Tech Mono', monospace",
    textShadow: `
      0 0 20px rgba(188,19,254,0.8),
      0 0 60px rgba(188,19,254,0.4),
      0 0 100px rgba(188,19,254,0.2)
    `,
    lineHeight: 1,
  },
  logoUnderline: {
    height: 2,
    background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)",
    marginTop: 12,
    boxShadow: "0 0 10px #bc13fe",
  },
  logoSubWrap: {
    textAlign: "center",
    zIndex: 2,
  },
  logoSub: {
    color: "#a78bca",
    fontSize: "clamp(10px, 2vw, 14px)",
    letterSpacing: "0.4em",
    margin: 0,
  },
  logoTagline: {
    color: "#5b4a7a",
    fontSize: "clamp(9px, 1.5vw, 11px)",
    letterSpacing: "0.3em",
    marginTop: 6,
  },
  symbols: {
    display: "flex",
    gap: 28,
    fontSize: 30,
    zIndex: 2,
    alignItems: "center",
  },
  symbol: {
    filter: "drop-shadow(0 0 6px currentColor)",
  },
  enterText: {
    color: "#bc13fe",
    fontSize: "clamp(10px, 1.8vw, 13px)",
    letterSpacing: "0.4em",
    textShadow: "0 0 10px #bc13fe",
    zIndex: 2,
  },
};
