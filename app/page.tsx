"use client";
import { useState, useEffect, useRef } from "react";

const LAUNCH = new Date("2026-03-07T21:00:00Z").getTime();
const GRID = 40;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Background electric grid (full screen) ───────────────────────────────────
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

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    function pickDir(col: number, row: number, avoid: any, cols: number, rows: number) {
      const dirs = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }];
      const valid = dirs.filter(d => { const nc = col + d.dc, nr = row + d.dr; return nc >= 0 && nc <= cols && nr >= 0 && nr <= rows; });
      const pool = avoid ? (valid.filter(d => !(d.dc === avoid.dc && d.dr === avoid.dr)) || valid) : valid;
      return (pool.length ? pool : valid)[Math.floor(Math.random() * (pool.length || valid.length))];
    }

    function createPulse() {
      const cols = Math.floor(canvas.width / GRID), rows = Math.floor(canvas.height / GRID);
      const col = Math.floor(Math.random() * cols), row = Math.floor(Math.random() * rows);
      const dir = pickDir(col, row, null, cols, rows), id = nextId++;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return { id, color, col, row, dir, t: 0, speed: 0.004 + Math.random() * 0.004, trailLength: 3 + Math.floor(Math.random() * 3), alpha: 0.16 + Math.random() * 0.12, trail: [] as { x: number; y: number }[], done: false, _steps: 0, cols, rows };
    }

    pulses.push(createPulse());
    setTimeout(() => { if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse()); }, 2400);
    function maybeRespawn() { if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse()); }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulses.forEach(p => {
        if (p.done) return;
        const px = p.col * GRID + p.dir.dc * GRID * p.t, py = p.row * GRID + p.dir.dr * GRID * p.t;
        p.trail.push({ x: px, y: py });
        if (p.trail.length > p.trailLength * 18) p.trail.shift();
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0; p.col += p.dir.dc; p.row += p.dir.dr;
          if (p.col <= 0 || p.col >= p.cols) { p.dir = { dc: -p.dir.dc, dr: p.dir.dr }; p.col = Math.max(0, Math.min(p.cols, p.col)); }
          if (p.row <= 0 || p.row >= p.rows) { p.dir = { dc: p.dir.dc, dr: -p.dir.dr }; p.row = Math.max(0, Math.min(p.rows, p.row)); }
          const key = `${p.col},${p.row}`, otherId = occupied.get(key);
          if (otherId !== undefined && otherId !== p.id) { const other = pulses.find((q: any) => q.id === otherId && !q.done); if (other) { p.dir = pickDir(p.col, p.row, p.dir, p.cols, p.rows); other.dir = pickDir(other.col, other.row, other.dir, other.cols, other.rows); } }
          occupied.set(key, p.id);
          if (Math.random() < 0.08) p.dir = pickDir(p.col, p.row, p.dir, p.cols, p.rows);
          p._steps++; if (p._steps > 600) { p.done = true; setTimeout(maybeRespawn, 800 + Math.random() * 1200); }
        }
        if (p.trail.length < 2) return;
        for (let i = 1; i < p.trail.length; i++) {
          const a = p.trail[i - 1], b = p.trail[i], progress = i / p.trail.length;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(${p.color},${progress * p.alpha * 0.35})`; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(${p.color},${progress * p.alpha})`; ctx.lineWidth = 1; ctx.stroke();
        }
        const head = p.trail[p.trail.length - 1];
        if (head) { const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 5); g.addColorStop(0, `rgba(${p.color},${p.alpha * 1.4})`); g.addColorStop(1, `rgba(${p.color},0)`); ctx.beginPath(); ctx.arc(head.x, head.y, 5, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }
      });
      pulses = pulses.filter(p => !p.done);
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />;
}

// ─── Brand edge sparks (traces the perimeter of the logo block) ───────────────
function BrandElectric({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    const target = targetRef.current;
    if (!canvas || !target) return;
    const safeCanvas = canvas as HTMLCanvasElement;
    const ctx = safeCanvas.getContext("2d")!;
    let animId: number;

    // Padding around the text block
    const PAD = 12;

    // Resize canvas to match target + padding
    const syncSize = () => {
      const r = target.getBoundingClientRect();
      safeCanvas.width  = r.width  + PAD * 2;
      safeCanvas.height = r.height + PAD * 2;
    };
    syncSize();

    const ro = new ResizeObserver(syncSize);
    ro.observe(target);

    // Perimeter sparks: each travels 0→1 around the rectangle
    type Spark = { pos: number; speed: number; trail: number[]; alpha: number; color: string };

    const SPARK_COLORS = ["0,255,65", "0,255,231", "0,255,65"];

    const sparks: Spark[] = [
      { pos: 0.00, speed: 0.0018, trail: [], alpha: 0.9,  color: SPARK_COLORS[0] },
      { pos: 0.33, speed: 0.0022, trail: [], alpha: 0.7,  color: SPARK_COLORS[1] },
      { pos: 0.66, speed: 0.0015, trail: [], alpha: 0.85, color: SPARK_COLORS[2] },
    ];

    // Convert 0-1 perimeter position to canvas x,y
    function perimeterPoint(t: number): { x: number; y: number } {
      const w = safeCanvas.width, h = safeCanvas.height;
      const perimeter = 2 * (w + h);
      const dist = ((t % 1) + 1) % 1 * perimeter;
      if (dist < w)                   return { x: dist,         y: 0 };         // top
      if (dist < w + h)               return { x: w,            y: dist - w };  // right
      if (dist < 2 * w + h)           return { x: w - (dist - w - h), y: h };  // bottom
      return { x: 0, y: h - (dist - 2 * w - h) };                              // left
    }

    const TRAIL_LEN = 28;

    function draw() {
      ctx.clearRect(0, 0, safeCanvas.width, safeCanvas.height);

      // Dim border outline so the sparks have a track to ride
      ctx.strokeStyle = "rgba(0,255,65,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, safeCanvas.width - 1, safeCanvas.height - 1);

      sparks.forEach(spark => {
        spark.pos = (spark.pos + spark.speed) % 1;
        spark.trail.push(spark.pos);
        if (spark.trail.length > TRAIL_LEN) spark.trail.shift();

        // Draw fading trail
        for (let i = 1; i < spark.trail.length; i++) {
          const progress = i / spark.trail.length;
          const a = perimeterPoint(spark.trail[i - 1]);
          const b = perimeterPoint(spark.trail[i]);

          // Glow
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${spark.color},${progress * spark.alpha * 0.3})`;
          ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke();

          // Core
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${spark.color},${progress * spark.alpha})`;
          ctx.lineWidth = 1.5; ctx.stroke();
        }

        // Bright head
        const head = perimeterPoint(spark.pos);
        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 6);
        g.addColorStop(0, `rgba(${spark.color},${spark.alpha})`);
        g.addColorStop(1, "rgba(0,255,65,0)");
        ctx.beginPath(); ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [targetRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: -12, left: -12,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function pad(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

const UNITS = [
  { key: "d", label: "DAYS" },
  { key: "h", label: "HRS"  },
  { key: "m", label: "MIN"  },
  { key: "s", label: "SEC"  },
] as const;

export default function ComingSoon() {
  const [time, setTime] = useState({ d: "00", h: "00", m: "00", s: "00" });
  const [launched, setLaunched] = useState(false);
  const [clock, setClock] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now(), diff = LAUNCH - now;
      setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
      if (diff <= 0) { setLaunched(true); return; }
      const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000),
            m = Math.floor((diff % 3600000) / 60000), sec = Math.floor((diff % 60000) / 1000);
      setTime({ d: pad(d), h: pad(h), m: pad(m), s: pad(sec) });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (launched) setTimeout(() => { window.location.href = "/home"; }, 3000);
  }, [launched]);

  const handleSubmit = async () => {
    if (!email || !EMAIL_REGEX.test(email)) {
      setStatus("error"); setMessage("INVALID SIGNAL — CHECK EMAIL FORMAT"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) { setStatus("success"); setMessage("SIGNAL LOCKED — WE'LL FIND YOU SATURDAY"); setEmail(""); }
      else { setStatus("error"); setMessage(data.error || "TRANSMISSION FAILED — TRY AGAIN"); }
    } catch { setStatus("error"); setMessage("TRANSMISSION FAILED — TRY AGAIN"); }
  };

  return (
    <main style={s.root}>
      {/* Background layers */}
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

      {/* HUD bars */}
      <div style={s.hudTop}>
        <span style={s.hudLabel}>AMH_SYS</span>
        <span style={{ ...s.hudLabel, color: "#00ff41", animation: "blink 1.1s step-end infinite" }}>◈ SIGNAL INCOMING</span>
        <span style={s.hudLabel}>{clock}</span>
      </div>
      <div style={s.hudBottom}>
        <span style={s.hudLabel}>SAN ANTONIO TX</span>
        <span style={s.hudLabel}>EST. 2018</span>
        <span style={s.hudLabel}>1M+ STREAMS</span>
      </div>

      {/* ── Main stage ── */}
      <div style={s.stage}>

        {/* Brand block — sparks trace this element's edges */}
        <div style={s.brandBlock} ref={brandRef}>
          <BrandElectric targetRef={brandRef} />
          <h1 style={s.brand}>ARTISTS MUSICIANS HUB</h1>
          <p style={s.signalLine}>SIGNAL DETECTED · AMPLIFYING</p>
        </div>

        {/* Countdown */}
        {launched ? (
          <div style={s.launchedWrap}>
            <div style={s.launchedText}>SYSTEM ONLINE</div>
            <p style={s.redirectText}>REDIRECTING TO THE TONE ZONE...</p>
          </div>
        ) : (
          <div style={s.countdownBlock}>
            <p style={s.countdownLabel}>SYSTEM LAUNCH IN</p>
            <div style={s.countdown}>
              {UNITS.map((u, i) => (
                <div key={u.key} style={s.countdownRow}>
                  <div style={s.unitGroup}>
                    <div style={s.digitBox}>
                      <span style={s.digit}>{time[u.key]}</span>
                    </div>
                    <span style={s.unitLabel}>{u.label}</span>
                  </div>
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
        <div style={s.emailBlock}>
          <p style={s.emailLabel}>GET FIRST ACCESS — DROP YOUR SIGNAL</p>
          <div style={s.emailRow}>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="your@email.com" style={s.emailInput}
              disabled={status === "loading" || status === "success"}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || status === "success"}
              style={{ ...s.emailBtn, ...(status === "success" ? s.emailBtnSuccess : {}) }}
            >
              {status === "loading" ? "..." : status === "success" ? "✓ LOCKED" : "TRANSMIT"}
            </button>
          </div>
          {message && (
            <p style={{ ...s.statusMsg, color: status === "success" ? "#00ff41" : "#ff2a6d" }}>{message}</p>
          )}
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');
        @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes gridScroll { from{background-position:center 0px} to{background-position:center 60px} }
        input::placeholder    { color:#1a4a26 }
        input:focus           { outline:none; border-color:#00ff41; box-shadow:0 0 12px rgba(0,255,65,0.3) }
        button:hover:not(:disabled) { transform:scale(1.04); box-shadow:0 0 20px rgba(0,255,65,0.5) }
        button:disabled       { opacity:.6; cursor:default }
      `}</style>
    </main>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: { position: "fixed", inset: 0, background: "#000a02", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Share Tech Mono','Courier New',monospace", overflow: "hidden" },
  scanlines: { position: "fixed", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)", pointerEvents: "none", zIndex: 50 },
  gridBg: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,65,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" },
  gridFloor: { position: "fixed", bottom: 0, left: 0, right: 0, height: "55vh", perspective: "300px", perspectiveOrigin: "50% 0%", pointerEvents: "none", zIndex: 0, overflow: "hidden" },
  gridInner: { position: "absolute", inset: 0, transform: "rotateX(55deg)", transformOrigin: "top center", backgroundImage: "linear-gradient(rgba(0,255,65,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.12) 1px,transparent 1px)", backgroundSize: "60px 60px", animation: "gridScroll 3s linear infinite" },
  horizon: { position: "fixed", bottom: "45vh", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#00ff41,#00ffe7,#00ff41,transparent)", boxShadow: "0 0 20px #00ff41,0 0 60px rgba(0,255,65,0.3)", zIndex: 1, pointerEvents: "none" },

  corner: { position: "fixed", width: 32, height: 32, borderColor: "#00ff41", borderStyle: "solid", opacity: 0.6, zIndex: 20 },
  tl: { top: 20, left: 20, borderWidth: "2px 0 0 2px" },
  tr: { top: 20, right: 20, borderWidth: "2px 2px 0 0" },
  bl: { bottom: 20, left: 20, borderWidth: "0 0 2px 2px" },
  br: { bottom: 20, right: 20, borderWidth: "0 2px 2px 0" },

  hudTop:    { position: "fixed", top: 22,    left: "50%", transform: "translateX(-50%)", display: "flex", gap: 36, zIndex: 20 },
  hudBottom: { position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 36, zIndex: 20 },
  hudLabel:  { color: "#2a7a3b", fontSize: 10, letterSpacing: "0.22em" },

  stage: { position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 32, textAlign: "center", padding: "0 24px", width: "100%", maxWidth: 700 },

  // Brand block — relative so the canvas positions against it
  brandBlock: {
    position: "relative",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 8,
    padding: "16px 32px",
    zIndex: 1,
  },
  brand: { fontFamily: "'VT323',monospace", fontSize: "clamp(28px,7vw,64px)", letterSpacing: "0.25em", color: "#00ff41", textShadow: "0 0 10px #00ff41,0 0 30px rgba(0,255,65,0.5)", margin: 0, fontWeight: 400, position: "relative", zIndex: 1 },
  signalLine: { fontSize: "clamp(10px,1.8vw,13px)", letterSpacing: "0.5em", color: "#00c832", margin: 0, position: "relative", zIndex: 1 },

  countdownBlock: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  countdownLabel: { fontSize: 10, letterSpacing: "0.35em", color: "#2a7a3b", margin: 0 },
  countdown: { display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 0 },
  countdownRow: { display: "flex", flexDirection: "row", alignItems: "flex-start" },
  unitGroup: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  digitBox: { border: "1px solid rgba(0,255,65,0.2)", padding: "4px 14px", background: "rgba(0,255,65,0.03)", clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)" },
  digit: { fontFamily: "'VT323',monospace", fontSize: "clamp(52px,9vw,80px)", lineHeight: 1, color: "#00ff41", textShadow: "0 0 8px #00ff41,0 0 24px rgba(0,255,65,0.4)", display: "block", minWidth: "2ch", textAlign: "center" },
  unitLabel: { fontSize: 9, letterSpacing: "0.25em", color: "#2a7a3b" },
  colon: { fontFamily: "'VT323',monospace", fontSize: "clamp(52px,9vw,80px)", lineHeight: 1, color: "#1a6b2e", padding: "4px 6px 0", animation: "blink 1s step-end infinite", flexShrink: 0 },
  targetDate: { fontSize: "clamp(11px,1.6vw,13px)", letterSpacing: "0.3em", color: "#2a7a3b", margin: 0 },

  launchedWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  launchedText: { fontFamily: "'VT323',monospace", fontSize: "clamp(36px,8vw,72px)", color: "#00ff41", textShadow: "0 0 20px #00ff41", letterSpacing: "0.2em" },
  redirectText: { fontSize: 12, letterSpacing: "0.3em", color: "#2a7a3b" },

  emailBlock: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "min(480px,90vw)" },
  emailLabel: { fontSize: 10, letterSpacing: "0.3em", color: "#2a7a3b", margin: 0 },
  emailRow: { display: "flex", width: "100%", gap: 8 },
  emailInput: { flex: 1, background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.25)", color: "#00ff41", padding: "12px 16px", fontSize: 13, fontFamily: "'Share Tech Mono',monospace", letterSpacing: "0.05em", transition: "all 0.2s" },
  emailBtn: { background: "transparent", border: "1px solid #00ff41", color: "#00ff41", padding: "12px 20px", fontSize: 12, letterSpacing: "0.2em", cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", boxShadow: "0 0 10px rgba(0,255,65,0.2)", transition: "all 0.2s", whiteSpace: "nowrap" },
  emailBtnSuccess: { borderColor: "#00c832", color: "#00c832" },
  statusMsg: { fontSize: 11, letterSpacing: "0.2em", margin: 0 },
};
