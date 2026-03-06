"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const LAUNCH = new Date("2026-03-07T21:00:00Z").getTime();
const GRID = 40;

function ElectricGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let pulses: any[] = [];
    let nextId = 0;
    const occupied = new Map<string, number>();
    const COLORS = ["0,255,65", "0,255,65", "0,255,231", "255,42,109"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function pickDir(col: number, row: number, avoid: any, cols: number, rows: number) {
      const dirs = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }];
      const valid = dirs.filter(d => {
        const nc = col + d.dc, nr = row + d.dr;
        return nc >= 0 && nc <= cols && nr >= 0 && nr <= rows;
      });
      const pool = avoid ? (valid.filter(d => !(d.dc === avoid.dc && d.dr === avoid.dr)) || valid) : valid;
      return (pool.length ? pool : valid)[Math.floor(Math.random() * (pool.length || valid.length))];
    }

    function createPulse() {
      const cols = Math.floor(canvas.width / GRID);
      const rows = Math.floor(canvas.height / GRID);
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      const dir = pickDir(col, row, null, cols, rows);
      const id = nextId++;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        id, color, col, row, dir, t: 0,
        speed: 0.004 + Math.random() * 0.004,
        trailLength: 3 + Math.floor(Math.random() * 3),
        alpha: 0.16 + Math.random() * 0.12,
        trail: [] as { x: number; y: number }[],
        done: false, _steps: 0, cols, rows,
      };
    }

    pulses.push(createPulse());
    setTimeout(() => { if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse()); }, 2400);

    function maybeRespawn() {
      if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse());
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulses.forEach(p => {
        if (p.done) return;
        const px = p.col * GRID + p.dir.dc * GRID * p.t;
        const py = p.row * GRID + p.dir.dr * GRID * p.t;
        p.trail.push({ x: px, y: py });
        if (p.trail.length > p.trailLength * 18) p.trail.shift();
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0; p.col += p.dir.dc; p.row += p.dir.dr;
          if (p.col <= 0 || p.col >= p.cols) { p.dir = { dc: -p.dir.dc, dr: p.dir.dr }; p.col = Math.max(0, Math.min(p.cols, p.col)); }
          if (p.row <= 0 || p.row >= p.rows) { p.dir = { dc: p.dir.dc, dr: -p.dir.dr }; p.row = Math.max(0, Math.min(p.rows, p.row)); }
          const key = `${p.col},${p.row}`;
          const otherId = occupied.get(key);
          if (otherId !== undefined && otherId !== p.id) {
            const other = pulses.find((q: any) => q.id === otherId && !q.done);
            if (other) {
              p.dir = pickDir(p.col, p.row, p.dir, p.cols, p.rows);
              other.dir = pickDir(other.col, other.row, other.dir, other.cols, other.rows);
            }
          }
          occupied.set(key, p.id);
          if (Math.random() < 0.08) p.dir = pickDir(p.col, p.row, p.dir, p.cols, p.rows);
          p._steps++;
          if (p._steps > 600) { p.done = true; setTimeout(maybeRespawn, 800 + Math.random() * 1200); }
        }
        if (p.trail.length < 2) return;
        for (let i = 1; i < p.trail.length; i++) {
          const a = p.trail[i - 1], b = p.trail[i];
          const progress = i / p.trail.length;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${p.color},${progress * p.alpha * 0.35})`; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${p.color},${progress * p.alpha})`; ctx.lineWidth = 1; ctx.stroke();
        }
        const head = p.trail[p.trail.length - 1];
        if (head) {
          const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 5);
          g.addColorStop(0, `rgba(${p.color},${p.alpha * 1.4})`); g.addColorStop(1, `rgba(${p.color},0)`);
          ctx.beginPath(); ctx.arc(head.x, head.y, 5, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        }
      });
      pulses = pulses.filter(p => !p.done);
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />;
}

function pad(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

export default function ComingSoon() {
  const [time, setTime] = useState({ d: "00", h: "00", m: "00", s: "00" });
  const [launched, setLaunched] = useState(false);
  const [clock, setClock] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = LAUNCH - now;
      setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
      if (diff <= 0) { setLaunched(true); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sv = Math.floor((diff % 60000) / 1000);
      setTime({ d: pad(d), h: pad(h), m: pad(m), s: pad(sv) });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (launched) {
      setTimeout(() => { window.location.href = "/home"; }, 3000);
    }
  }, [launched]);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setStatus("error"); setMessage("INVALID SIGNAL — CHECK EMAIL FORMAT"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("SIGNAL LOCKED — SEE YOU SATURDAY");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "TRANSMISSION FAILED — TRY AGAIN");
      }
    } catch {
      setStatus("error");
      setMessage("TRANSMISSION FAILED — TRY AGAIN");
    }
  };

  return (
    <main style={s.root}>
      <div style={s.scanlines} />
      <div style={s.gridBg} />
      <ElectricGrid />
      <div style={s.gridFloor}><div style={s.gridInner} /></div>
      <div style={s.horizon} />

      {/* Corner brackets */}
      <div style={{ ...s.corner, ...s.tl }} />
      <div style={{ ...s.corner, ...s.tr }} />
      <div style={{ ...s.corner, ...s.bl }} />
      <div style={{ ...s.corner, ...s.br }} />

      {/* HUD top */}
      <div style={s.hudTop}>
        <span style={s.hudLabel}>AMH_SYS</span>
        <span style={{ ...s.hudLabel, color: "#00ff41", animation: "blink 1.1s step-end infinite" }}>◈ SIGNAL INCOMING</span>
        <span style={s.hudLabel}>{clock}</span>
      </div>

      {/* HUD bottom */}
      <div style={s.hudBottom}>
        <span style={s.hudLabel}>SAN ANTONIO TX</span>
        <span style={s.hudLabel}>EST. 2018</span>
        <span style={s.hudLabel}>1M+ STREAMS</span>
      </div>

      {/* Main content */}
      <div style={s.stage}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <Image
            src="https://res.cloudinary.com/dbpremci4/image/upload/w_140,h_140,c_fit/purple-hub-logo-transparent_idyl0z"
            alt="Artists Musicians Hub"
            width={140}
            height={140}
            priority
            style={s.logo}
          />
        </div>

        {/* Brand */}
        <h1 style={s.brand}>ARTISTS MUSICIANS HUB</h1>
        <p style={s.signalLine}>SIGNAL DETECTED · AMPLIFYING</p>

        {/* Countdown or launched */}
        {launched ? (
          <div style={s.launchedWrap}>
            <div style={s.launchedText}>SYSTEM ONLINE</div>
            <p style={s.redirectText}>REDIRECTING TO THE TONE ZONE...</p>
          </div>
        ) : (
          <div style={s.countdownWrap}>
            <div style={s.countdownLabel}>SYSTEM LAUNCH IN</div>
            <div style={s.countdown}>
              {[
                { val: time.d, label: "DAYS" },
                { val: time.h, label: "HRS" },
                { val: time.m, label: "MIN" },
                { val: time.s, label: "SEC" },
              ].map((u, i) => (
                <div key={u.label} style={s.unitGroup}>
                  <div style={s.digitBox}>
                    <span style={s.digit}>{u.val}</span>
                  </div>
                  <span style={s.unitLabel}>{u.label}</span>
                  {i < 3 && <span style={s.colon}>:</span>}
                </div>
              ))}
            </div>
            <p style={s.targetDate}>
              LAUNCHING{" "}
              <span style={{ color: "#00ff41", textShadow: "0 0 8px rgba(0,255,65,0.6)" }}>
                SATURDAY · MARCH 7 · 3:00 PM CST
              </span>
            </p>
          </div>
        )}

        {/* Email capture */}
        <div style={s.emailSection}>
          <p style={s.emailLabel}>GET FIRST ACCESS — DROP YOUR SIGNAL</p>
          <div style={s.emailRow}>
            <div style={s.inputWrap}>
              <span style={s.inputPrefix}>▶</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="your@email.com"
                style={s.emailInput}
                disabled={status === "loading" || status === "success"}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || status === "success"}
              style={{
                ...s.emailBtn,
                ...(status === "success" ? s.emailBtnSuccess : {}),
                ...(status === "loading" ? s.emailBtnLoading : {}),
              }}
            >
              {status === "loading" ? "···" : status === "success" ? "✓ LOCKED" : "TRANSMIT"}
            </button>
          </div>
          {message && (
            <p style={{
              ...s.statusMsg,
              color: status === "success" ? "#00ff41" : "#ff2a6d",
              textShadow: status === "success"
                ? "0 0 8px rgba(0,255,65,0.6)"
                : "0 0 8px rgba(255,42,109,0.6)",
            }}>
              {message}
            </p>
          )}
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes gridScroll { from{background-position:center 0px} to{background-position:center 60px} }
        @keyframes logoPulse { 0%,100%{filter:drop-shadow(0 0 8px rgba(0,255,65,0.4))} 50%{filter:drop-shadow(0 0 20px rgba(0,255,65,0.8))} }
        input::placeholder { color: #1a4a26; }
        input:focus { outline: none; border-color: #00ff41; box-shadow: 0 0 16px rgba(0,255,65,0.3); }
        input:disabled { opacity: 0.5; }
        .transmit-btn:hover:not(:disabled) { transform: scale(1.04); box-shadow: 0 0 24px rgba(0,255,65,0.6) !important; background: rgba(0,255,65,0.08) !important; }
        .transmit-btn:disabled { opacity: 0.6; cursor: default; }
        .transmit-btn:active:not(:disabled) { transform: scale(0.98); }
      `}</style>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed", inset: 0,
    background: "#000a02",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    fontFamily: "'Share Tech Mono','Courier New',monospace",
    overflow: "hidden",
  },
  scanlines: {
    position: "fixed", inset: 0,
    background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)",
    pointerEvents: "none", zIndex: 50,
  },
  gridBg: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(0,255,65,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.04) 1px,transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  gridFloor: {
    position: "fixed", bottom: 0, left: 0, right: 0, height: "55vh",
    perspective: "300px", perspectiveOrigin: "50% 0%",
    pointerEvents: "none", zIndex: 0, overflow: "hidden",
  },
  gridInner: {
    position: "absolute", inset: 0,
    transform: "rotateX(55deg)", transformOrigin: "top center",
    backgroundImage: "linear-gradient(rgba(0,255,65,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.12) 1px,transparent 1px)",
    backgroundSize: "60px 60px",
    animation: "gridScroll 3s linear infinite",
  },
  horizon: {
    position: "fixed", bottom: "45vh", left: 0, right: 0, height: "2px",
    background: "linear-gradient(90deg,transparent,#00ff41,#00ffe7,#00ff41,transparent)",
    boxShadow: "0 0 20px #00ff41,0 0 60px rgba(0,255,65,0.3)",
    zIndex: 1, pointerEvents: "none",
  },
  corner: { position: "fixed", width: 32, height: 32, borderColor: "#00ff41", borderStyle: "solid", opacity: 0.6, zIndex: 20 },
  tl: { top: 20, left: 20, borderWidth: "2px 0 0 2px" },
  tr: { top: 20, right: 20, borderWidth: "2px 2px 0 0" },
  bl: { bottom: 20, left: 20, borderWidth: "0 0 2px 2px" },
  br: { bottom: 20, right: 20, borderWidth: "0 2px 2px 0" },
  hudTop: { position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 36, zIndex: 20 },
  hudBottom: { position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 36, zIndex: 20 },
  hudLabel: { color: "#2a7a3b", fontSize: 10, letterSpacing: "0.22em" },

  // Stage
  stage: {
    position: "relative", zIndex: 10,
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 20,
    textAlign: "center", padding: "0 24px",
  },

  // Logo
  logoWrap: {
    marginBottom: 4,
    animation: "logoPulse 3s ease-in-out infinite",
  },
  logo: {
    objectFit: "contain",
    opacity: 0.92,
  },

  // Brand
  brand: {
    fontFamily: "'VT323',monospace",
    fontSize: "clamp(28px,7vw,64px)",
    letterSpacing: "0.25em",
    color: "#00ff41",
    textShadow: "0 0 10px #00ff41,0 0 30px rgba(0,255,65,0.5)",
    margin: 0, fontWeight: 400,
  },
  signalLine: { fontSize: "clamp(10px,1.8vw,13px)", letterSpacing: "0.5em", color: "#00c832", margin: 0 },

  // Countdown
  countdownWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  countdownLabel: { fontSize: 10, letterSpacing: "0.35em", color: "#2a7a3b" },
  countdown: { display: "flex", gap: 4, alignItems: "flex-end" },
  unitGroup: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" },
  digitBox: {
    border: "1px solid rgba(0,255,65,0.2)",
    padding: "4px 12px",
    background: "rgba(0,255,65,0.03)",
    clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)",
  },
  digit: {
    fontFamily: "'VT323',monospace",
    fontSize: "clamp(48px,9vw,80px)",
    lineHeight: 1, color: "#00ff41",
    textShadow: "0 0 8px #00ff41,0 0 24px rgba(0,255,65,0.4)",
    display: "block", minWidth: "2ch", textAlign: "center",
  },
  colon: {
    fontFamily: "'VT323',monospace",
    fontSize: "clamp(48px,9vw,80px)",
    color: "#00c832", lineHeight: 1, paddingBottom: 20,
    animation: "blink 1s step-end infinite",
    position: "absolute", right: "-16px", top: 0,
  },
  unitLabel: { fontSize: 9, letterSpacing: "0.25em", color: "#2a7a3b" },
  targetDate: { fontSize: "clamp(11px,1.6vw,13px)", letterSpacing: "0.3em", color: "#2a7a3b", margin: 0 },

  // Launched state
  launchedWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  launchedText: { fontFamily: "'VT323',monospace", fontSize: "clamp(36px,8vw,72px)", color: "#00ff41", textShadow: "0 0 20px #00ff41", letterSpacing: "0.2em" },
  redirectText: { fontSize: 12, letterSpacing: "0.3em", color: "#2a7a3b" },

  // Email form
  emailSection: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 10,
    width: "min(520px,92vw)",
    marginTop: 4,
  },
  emailLabel: {
    fontSize: 10, letterSpacing: "0.3em",
    color: "#2a7a3b", margin: 0,
  },
  emailRow: {
    display: "flex", width: "100%", gap: 0,
    border: "1px solid rgba(0,255,65,0.3)",
    background: "rgba(0,255,65,0.02)",
    clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
  },
  inputWrap: {
    flex: 1, display: "flex",
    alignItems: "center",
    borderRight: "1px solid rgba(0,255,65,0.2)",
    padding: "0 12px",
  },
  inputPrefix: {
    color: "#2a7a3b",
    fontSize: 10,
    marginRight: 8,
    flexShrink: 0,
  },
  emailInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#00ff41",
    padding: "14px 4px",
    fontSize: 13,
    fontFamily: "'Share Tech Mono',monospace",
    letterSpacing: "0.05em",
    transition: "all 0.2s",
    minWidth: 0,
  },
  emailBtn: {
    background: "transparent",
    border: "none",
    borderLeft: "none",
    color: "#00ff41",
    padding: "14px 24px",
    fontSize: 11,
    letterSpacing: "0.25em",
    cursor: "pointer",
    fontFamily: "'Share Tech Mono',monospace",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    flexShrink: 0,
  } as React.CSSProperties,
  emailBtnSuccess: { color: "#00c832" },
  emailBtnLoading: { letterSpacing: "0.5em", opacity: 0.7 },
  statusMsg: {
    fontSize: 11, letterSpacing: "0.2em",
    margin: 0, transition: "all 0.3s",
  },
};
