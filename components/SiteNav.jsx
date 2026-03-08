"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const LOGO_URL = "https://res.cloudinary.com/dbpremci4/image/upload/w_200,h_200,c_fit/white-hub-logo-transparent";

const NAV_ITEMS = [
  { label: "HOME", icon: "⌂", href: "/", color: "#bc13fe" },
  { label: "ABOUT", icon: "◎", href: "/about", color: "#00f0ff" },
  { label: "SERVICES", icon: "◆", href: "/services", color: "#ff2a6d" },
  { label: "AMPLIFY", icon: "▲", href: "/amplify", color: "#bc13fe" },
  { label: "NEWS", icon: "◈", href: "/news", color: "#00f0ff" },
  { label: "CONTACT", icon: "✦", href: "/contact", color: "#f5f500" },
];

// ============================================================
// PROCEDURAL AUDIO — Web Audio API, zero files
// ============================================================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx && typeof window !== "undefined") {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
  return audioCtx;
}

function playHoverSound() {
  const ctx = getAudioCtx(); if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.018, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

function playClickSound() {
  const ctx = getAudioCtx(); if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

function playOpenSound() {
  const ctx = getAudioCtx(); if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.022, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

// ============================================================
// MAGNETIC NAV ITEM — spring physics cursor attraction
// ============================================================
function MagneticNavItem({ item, isActive, onHoverSound }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });
  const [hov, setHov] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.2);
    y.set((e.clientY - cy) * 0.25);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0); y.set(0); setHov(false);
  }, [x, y]);

  const handleMouseEnter = useCallback(() => {
    setHov(true); onHoverSound();
  }, [onHoverSound]);

  return (
    <motion.a
      ref={ref}
      href={item.href}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX, y: springY,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "8px 14px", textDecoration: "none",
        position: "relative",
      }}
    >
      {/* Active sliding indicator */}
      {isActive && (
        <motion.div
          layoutId="navActiveBar"
          style={{
            position: "absolute", bottom: -1, left: "50%",
            width: 24, height: 2, marginLeft: -12,
            background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
            boxShadow: `0 0 8px ${item.color}`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Targeting brackets on hover */}
      <AnimatePresence>
        {hov && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.12 }}
            style={{ position: "absolute", inset: -5, pointerEvents: "none" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `1.5px solid ${item.color}`, borderLeft: `1.5px solid ${item.color}`, opacity: 0.8 }} />
            <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderTop: `1.5px solid ${item.color}`, borderRight: `1.5px solid ${item.color}`, opacity: 0.8 }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1.5px solid ${item.color}`, borderLeft: `1.5px solid ${item.color}`, opacity: 0.8 }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1.5px solid ${item.color}`, borderRight: `1.5px solid ${item.color}`, opacity: 0.8 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.span
        animate={{
          color: isActive ? item.color : (hov ? item.color : "#5b4a7a"),
          filter: isActive || hov ? `drop-shadow(0 0 6px ${item.color})` : "none",
          scale: hov ? 1.15 : 1,
        }}
        transition={{ duration: 0.15 }}
        style={{ fontSize: 16 }}
      >{item.icon}</motion.span>

      {/* Label */}
      <motion.span
        animate={{ color: isActive ? "#e0d0ff" : (hov ? "#a78bca" : "#3d2060") }}
        transition={{ duration: 0.15 }}
        style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: "0.15em", marginTop: 2 }}
      >{item.label}</motion.span>
    </motion.a>
  );
}

// ============================================================
// XMB DESKTOP NAV — scanning line + magnetic items
// ============================================================
function XMBNav({ currentPath, soundEnabled }) {
  const onHover = useCallback(() => { if (soundEnabled) playHoverSound(); }, [soundEnabled]);

  return (
    <nav className="desktop-nav" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      background: "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.8) 70%, transparent 100%)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(188,19,254,0.1)",
      overflow: "visible",
    }}>
      {/* Scanning line across bottom */}
      <div className="nav-scan-line" style={{
        position: "absolute", bottom: 0, left: 0, width: 60, height: 1,
        background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)",
        boxShadow: "0 0 8px #bc13fe",
        animation: "navScan 4s linear infinite",
      }} />

      {/* Logo with glow pulse */}
      <motion.a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <motion.img src={LOGO_URL} alt="AMH"
          animate={{ filter: [
            "drop-shadow(0 0 6px rgba(188,19,254,0.4))",
            "drop-shadow(0 0 14px rgba(188,19,254,0.8))",
            "drop-shadow(0 0 6px rgba(188,19,254,0.4))",
          ] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ height: 40, width: "auto" }}
        />
      </motion.a>

      {/* Magnetic nav items */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));
          return <MagneticNavItem key={item.label} item={item} isActive={isActive} onHoverSound={onHover} />;
        })}
      </div>

      {/* Status pulse */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }}
        />
        <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#3d2060", fontFamily: "'Share Tech Mono', monospace" }}>SYS:ONLINE</span>
      </div>
    </nav>
  );
}

// ============================================================
// RADIAL COMMAND WHEEL — spring burst, constellation, radar
// ============================================================
function RadialNav({ soundEnabled }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const RADIUS = 140;
  const count = NAV_ITEMS.length;
  const startAngle = -90;

  const handleOpen = () => { setOpen(true); if (soundEnabled) playOpenSound(); };
  const handleClose = () => { setSelected(null); setOpen(false); };
  const handleSelect = (i, href) => {
    setSelected(i);
    if (soundEnabled) playClickSound();
    setTimeout(() => { window.location.href = href; }, 300);
  };

  const positions = NAV_ITEMS.map((_, i) => {
    const angle = startAngle + (i * 360 / count);
    const rad = (angle * Math.PI) / 180;
    return { x: Math.cos(rad) * RADIUS, y: Math.sin(rad) * RADIUS };
  });

  const hubSize = RADIUS * 2 + 120;
  const hubCenter = hubSize / 2;

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 52, display: "none", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 80%, transparent 100%)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(188,19,254,0.1)",
      }}>
        <a href="/"><img src={LOGO_URL} alt="AMH" style={{ height: 32, width: "auto", filter: "drop-shadow(0 0 6px rgba(188,19,254,0.5))" }} /></a>
      </div>

      {/* Trigger orb */}
      <motion.button
        className="radial-trigger"
        onClick={open ? handleClose : handleOpen}
        animate={{
          boxShadow: open
            ? "0 0 30px rgba(188,19,254,0.5), inset 0 0 20px rgba(188,19,254,0.15)"
            : ["0 0 15px rgba(188,19,254,0.3)", "0 0 25px rgba(188,19,254,0.6)", "0 0 15px rgba(188,19,254,0.3)"],
          rotate: open ? 135 : 0,
        }}
        transition={open ? { duration: 0.3 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 200,
          width: 56, height: 56, borderRadius: "50%",
          background: open ? "rgba(188,19,254,0.3)" : "rgba(10,0,16,0.9)",
          border: `2px solid ${open ? "#bc13fe" : "rgba(188,19,254,0.4)"}`,
          color: open ? "#e0d0ff" : "#bc13fe",
          fontSize: 22, cursor: "pointer", display: "none",
          alignItems: "center", justifyContent: "center",
          fontFamily: "'Share Tech Mono', monospace",
        }}
      >{open ? "✕" : "◎"}</motion.button>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed", inset: 0, zIndex: 150,
              background: "rgba(5,0,12,0.94)",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={handleClose}
          >
            {/* Scanlines */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)", pointerEvents: "none" }} />

            {/* Outer rings */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", width: hubSize + 40, height: hubSize + 40, borderRadius: "50%", border: "1px solid rgba(188,19,254,0.08)", borderTop: "1px solid rgba(188,19,254,0.25)" }} />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", width: hubSize + 10, height: hubSize + 10, borderRadius: "50%", border: "1px dashed rgba(0,240,255,0.06)" }} />

            {/* Hub */}
            <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: hubSize, height: hubSize }}>

              {/* Ring pulse — ripples out from center on open */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={`ring-${ring}`}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: [0, 2.5 + ring * 0.3], opacity: [0.5 - ring * 0.1, 0] }}
                  transition={{ duration: 1.2 + ring * 0.3, delay: ring * 0.15, ease: "easeOut" }}
                  style={{
                    position: "absolute", top: "50%", left: "50%",
                    width: 80, height: 80, marginTop: -40, marginLeft: -40,
                    borderRadius: "50%",
                    border: "1px solid rgba(188,19,254,0.35)",
                    boxShadow: "0 0 8px rgba(188,19,254,0.2)",
                    pointerEvents: "none", zIndex: 7,
                  }}
                />
              ))}

              {/* Radar sweep */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", top: "50%", left: "50%", width: 80, height: 80, marginTop: -40, marginLeft: -40,
                  borderRadius: "50%", background: "conic-gradient(from 0deg, transparent, rgba(188,19,254,0.12) 90deg, transparent)", zIndex: 8,
                }} />

              {/* Center logo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: 80, height: 80, borderRadius: "50%",
                  background: "rgba(10,0,20,0.95)", border: "2px solid rgba(188,19,254,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 30px rgba(188,19,254,0.3), inset 0 0 20px rgba(188,19,254,0.1)", zIndex: 10,
                }}
              >
                <motion.img src={LOGO_URL} alt="AMH"
                  animate={{ filter: [
                    "drop-shadow(0 0 6px rgba(188,19,254,0.4))",
                    "drop-shadow(0 0 14px rgba(188,19,254,0.8))",
                    "drop-shadow(0 0 6px rgba(188,19,254,0.4))",
                  ] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ height: 42, width: "auto" }}
                />
              </motion.div>

              {/* Constellation SVG — curved Bezier lines + triple energy pulses */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3, overflow: "visible" }}>
                <defs>
                  <filter id="pulseGlow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                {NAV_ITEMS.map((item, i) => {
                  const { x: ex, y: ey } = positions[i];
                  const x1 = hubCenter, y1 = hubCenter;
                  const x2 = hubCenter + ex, y2 = hubCenter + ey;
                  // Bezier control point — perpendicular offset from midpoint
                  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                  const dx = x2 - x1, dy = y2 - y1;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const perpX = -dy / len, perpY = dx / len;
                  const curvature = 25 * (i % 2 === 0 ? 1 : -1); // alternate curve direction
                  const cx = mx + perpX * curvature, cy = my + perpY * curvature;
                  const fwd = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
                  const rev = `M${x2},${y2} Q${cx},${cy} ${x1},${y1}`;
                  const d1 = 1.8 + i * 0.25, d2 = 2.2 + i * 0.2;
                  return (
                    <g key={`c-${i}`}>
                      {/* Breathing curved dashed line */}
                      <path d={fwd} fill="none" stroke={item.color} strokeWidth="1" strokeDasharray="4,6" filter="url(#pulseGlow)">
                        <animate attributeName="opacity" values="0.06;0.22;0.06" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                      </path>
                      {/* Pulse 1 — outbound, large, follows curve */}
                      <circle r="2.5" fill={item.color} filter="url(#pulseGlow)">
                        <animateMotion dur={`${d1}s`} repeatCount="indefinite" path={fwd} />
                        <animate attributeName="opacity" values="0;0.9;0" dur={`${d1}s`} repeatCount="indefinite" />
                        <animate attributeName="r" values="1.5;3;1.5" dur={`${d1}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Pulse 2 — outbound, offset, follows curve */}
                      <circle r="1.5" fill={item.color}>
                        <animateMotion dur={`${d2}s`} begin={`${d1 / 2}s`} repeatCount="indefinite" path={fwd} />
                        <animate attributeName="opacity" values="0;0.5;0" dur={`${d2}s`} begin={`${d1 / 2}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Pulse 3 — return trip, white spark, follows curve */}
                      <circle r="1" fill="#ffffff">
                        <animateMotion dur={`${d2 + 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" path={rev} />
                        <animate attributeName="opacity" values="0;0.3;0" dur={`${d2 + 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}
              </svg>

              {/* Nav nodes — spring burst */}
              {NAV_ITEMS.map((item, i) => {
                const { x, y } = positions[i];
                const isSelected = selected === i;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ x, y, scale: isSelected ? 1.2 : 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.08 + i * 0.05, scale: { duration: 0.15 } }}
                    style={{ position: "absolute", top: "50%", left: "50%", marginTop: -32, marginLeft: -32, zIndex: 5 }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(i, item.href); }}
                      onMouseEnter={() => { if (soundEnabled) playHoverSound(); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", width: 64 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.15, boxShadow: `0 0 30px ${item.color}55` }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          width: 56, height: 56, borderRadius: "50%",
                          background: isSelected ? `${item.color}33` : "rgba(10,0,20,0.9)",
                          border: `1.5px solid ${isSelected ? item.color : item.color + "55"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 22, color: item.color,
                          boxShadow: isSelected ? `0 0 30px ${item.color}66, inset 0 0 15px ${item.color}22` : `0 0 12px ${item.color}22`,
                          filter: `drop-shadow(0 0 6px ${item.color}44)`,
                          position: "relative",
                        }}
                      >
                        {item.icon}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.4, 0.8] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1px solid ${item.color}`, boxShadow: `0 0 10px ${item.color}` }}
                          />
                        )}
                      </motion.div>
                      <span style={{
                        fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: "0.2em",
                        color: isSelected ? item.color : "#8b7aaa",
                        textShadow: isSelected ? `0 0 8px ${item.color}` : "none",
                        whiteSpace: "nowrap",
                      }}>{item.label}</span>
                    </a>
                  </motion.div>
                );
              })}
            </div>

            {/* HUD text */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)" }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: "#5b4a7a" }}>SELECT DESTINATION</span>
            </motion.div>

            {/* Screen corner brackets */}
            {[
              { top: 20, left: 20, bT: true, bL: true },
              { top: 20, right: 20, bT: true, bR: true },
              { bottom: 20, left: 20, bB: true, bL: true },
              { bottom: 20, right: 20, bB: true, bR: true },
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  position: "absolute", ...c, width: 24, height: 24,
                  borderTop: c.bT ? "2px solid rgba(188,19,254,0.4)" : "none",
                  borderBottom: c.bB ? "2px solid rgba(188,19,254,0.4)" : "none",
                  borderLeft: c.bL ? "2px solid rgba(188,19,254,0.4)" : "none",
                  borderRight: c.bR ? "2px solid rgba(188,19,254,0.4)" : "none",
                }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// EXPORT
// ============================================================
export default function SiteNav() {
  const [path, setPath] = useState("/");
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => { setPath(window.location.pathname); }, []);

  // Enable sound after first click (browser autoplay policy)
  useEffect(() => {
    const enable = () => { setSoundEnabled(true); window.removeEventListener("click", enable); };
    window.addEventListener("click", enable);
    return () => window.removeEventListener("click", enable);
  }, []);

  return (
    <>
      <XMBNav currentPath={path} soundEnabled={soundEnabled} />
      <RadialNav soundEnabled={soundEnabled} />
      <style>{`
        @keyframes navScan {
          0% { left: -60px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .radial-trigger { display: none !important; }
        .mobile-topbar { display: none !important; }
        @media (max-width: 1024px) and (min-width: 769px) {
          .desktop-nav > div:nth-child(2) > a { padding: 8px 10px !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .radial-trigger { display: flex !important; }
          .mobile-topbar { display: flex !important; }
        }
        @media (max-width: 380px) {
          .radial-trigger { bottom: 18px !important; right: 18px !important; width: 50px !important; height: 50px !important; font-size: 18px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          .nav-scan-line { display: none !important; }
        }
      `}</style>
    </>
  );
}
