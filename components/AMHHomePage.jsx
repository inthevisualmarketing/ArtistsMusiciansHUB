"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// AMH HOMEPAGE — PlayStation × Cyberpunk HUD
// XMB Navigation · 6 Sections · Purple Palette
// ============================================================

const GRID_SIZE = 40;

const LOGO_URL = "https://res.cloudinary.com/dbpremci4/image/upload/w_200,h_200,c_fit/white-hub-logo-transparent";

// ---------- ELECTRIC GRID (same DNA as boot sequence) ----------
function ElectricGrid() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let pulses = [];
    let nextId = 0;
    const occupied = new Map();
    const COLORS = ["188,19,254", "188,19,254", "0,240,255", "255,42,109"];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    function pickDir(col, row, avoid, cols, rows) {
      const dirs = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }];
      const valid = dirs.filter(d => { const nc = col + d.dc, nr = row + d.dr; return nc >= 0 && nc <= cols && nr >= 0 && nr <= rows; });
      const pool = avoid ? valid.filter(d => !(d.dc === avoid.dc && d.dr === avoid.dr)) : valid;
      return (pool.length ? pool : valid)[Math.floor(Math.random() * (pool.length || valid.length))];
    }

    function createPulse() {
      const cols = Math.floor(canvas.width / GRID_SIZE);
      const rows = Math.floor(canvas.height / GRID_SIZE);
      return {
        id: nextId++, color: COLORS[Math.floor(Math.random() * COLORS.length)],
        col: Math.floor(Math.random() * cols), row: Math.floor(Math.random() * rows),
        dir: pickDir(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), null, cols, rows),
        t: 0, speed: 0.003 + Math.random() * 0.003, trailLength: 3 + Math.floor(Math.random() * 3),
        alpha: 0.12 + Math.random() * 0.1, trail: [], done: false, _steps: 0, cols, rows,
      };
    }

    pulses.push(createPulse());
    setTimeout(() => { if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse()); }, 2400);
    function maybeRespawn() { if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse()); }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulses.forEach(p => {
        if (p.done) return;
        const px = p.col * GRID_SIZE + p.dir.dc * GRID_SIZE * p.t;
        const py = p.row * GRID_SIZE + p.dir.dr * GRID_SIZE * p.t;
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
            const other = pulses.find(q => q.id === otherId && !q.done);
            if (other) { p.dir = pickDir(p.col, p.row, p.dir, p.cols, p.rows); other.dir = pickDir(other.col, other.row, other.dir, other.cols, other.rows); }
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
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ---------- XMB NAVIGATION ----------
const NAV_ITEMS = [
  { label: "HOME", icon: "⌂", href: "/" },
  { label: "ABOUT", icon: "◎", href: "/about" },
  { label: "SERVICES", icon: "◆", href: "/services" },
  { label: "AMPLIFY", icon: "▲", href: "/amplify" },
  { label: "NEWS", icon: "◈", href: "/news" },
  { label: "CONTACT", icon: "✦", href: "/contact" },
];

function XMBNav() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);

  return (
    <nav style={nav.root} className="desktop-nav">
      <div style={nav.brand}>
        <img
          src={LOGO_URL}
          alt="Artists Musicians Hub"
          style={{
            height: 40,
            width: "auto",
            filter: "drop-shadow(0 0 8px rgba(188,19,254,0.6)) drop-shadow(0 0 20px rgba(188,19,254,0.3))",
            WebkitFilter: "drop-shadow(0 0 8px rgba(188,19,254,0.6)) drop-shadow(0 0 20px rgba(188,19,254,0.3))",
            transition: "filter 0.3s ease",
          }}
        />
      </div>
      <div style={nav.items}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = active === i;
          const isHovered = hovered === i;
          return (
            <a
              key={item.label}
              href={item.href}
              style={{
                ...nav.item,
                ...(isActive ? nav.itemActive : {}),
                ...(isHovered && !isActive ? nav.itemHover : {}),
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => { e.preventDefault(); setActive(i); }}
            >
              <span style={{
                ...nav.icon,
                ...(isActive ? nav.iconActive : {}),
                ...(isHovered && !isActive ? { color: "#bc13fe", filter: "drop-shadow(0 0 4px #bc13fe)", WebkitFilter: "drop-shadow(0 0 4px #bc13fe)" } : {}),
              }}>{item.icon}</span>
              <span style={{
                ...nav.label,
                ...(isActive ? nav.labelActive : {}),
              }}>{item.label}</span>
              {isActive && <div style={nav.activeDot} />}
            </a>
          );
        })}
      </div>
      <div style={nav.hudRight}>
        <span style={nav.hudText}>SYS:ONLINE</span>
      </div>
    </nav>
  );
}

// ---------- RADIAL COMMAND WHEEL (Mobile) ----------
const WHEEL_ITEMS = [
  { label: "HOME", icon: "⌂", href: "/", color: "#bc13fe" },
  { label: "ABOUT", icon: "◎", href: "/about", color: "#00f0ff" },
  { label: "SERVICES", icon: "◆", href: "/services", color: "#ff2a6d" },
  { label: "AMPLIFY", icon: "▲", href: "/amplify", color: "#bc13fe" },
  { label: "NEWS", icon: "◈", href: "/news", color: "#00f0ff" },
  { label: "CONTACT", icon: "✦", href: "/contact", color: "#f5f500" },
];

function RadialNav() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const RADIUS = 120;
  const count = WHEEL_ITEMS.length;
  // Start from top (-90deg) and distribute evenly
  const startAngle = -90;

  return (
    <>
      {/* Mobile top bar — logo only */}
      <div className="mobile-topbar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 52, display: "none", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 80%, transparent 100%)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(188,19,254,0.1)",
      }}>
        <img src={LOGO_URL} alt="AMH" style={{
          height: 32, width: "auto",
          filter: "drop-shadow(0 0 6px rgba(188,19,254,0.5))",
          WebkitFilter: "drop-shadow(0 0 6px rgba(188,19,254,0.5))",
        }} />
      </div>

      {/* Trigger button — fixed bottom right */}
      <button
        className="radial-trigger"
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 200,
          width: 56, height: 56, borderRadius: "50%",
          background: open ? "rgba(188,19,254,0.3)" : "rgba(10,0,16,0.9)",
          border: `2px solid ${open ? "#bc13fe" : "rgba(188,19,254,0.4)"}`,
          color: open ? "#e0d0ff" : "#bc13fe",
          fontSize: 22, cursor: "pointer", display: "none",
          alignItems: "center", justifyContent: "center",
          boxShadow: open
            ? "0 0 30px rgba(188,19,254,0.5), 0 0 60px rgba(188,19,254,0.2), inset 0 0 20px rgba(188,19,254,0.15)"
            : "0 0 15px rgba(188,19,254,0.3)",
          transition: "all 0.3s ease",
          fontFamily: "'Share Tech Mono', monospace",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        {open ? "✕" : "◎"}
      </button>

      {/* Overlay + Wheel */}
      {open && (
        <div
          style={{
            position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 150,
            background: "rgba(5,0,12,0.92)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "radialFadeIn 0.25s ease-out",
          }}
          onClick={() => setOpen(false)}
        >
          {/* Scanlines on overlay */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            pointerEvents: "none",
          }} />

          {/* Outer ring */}
          <div style={{
            position: "absolute",
            width: RADIUS * 2 + 80, height: RADIUS * 2 + 80,
            borderRadius: "50%",
            border: "1px solid rgba(188,19,254,0.15)",
            animation: "radialRingSpin 20s linear infinite",
          }} />

          {/* Inner ring */}
          <div style={{
            position: "absolute",
            width: RADIUS * 2 + 20, height: RADIUS * 2 + 20,
            borderRadius: "50%",
            border: "1px solid rgba(188,19,254,0.08)",
          }} />

          {/* Center hub */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: RADIUS * 2 + 80, height: RADIUS * 2 + 80,
            }}
          >
            {/* Center logo */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(10,0,20,0.95)",
              border: "2px solid rgba(188,19,254,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(188,19,254,0.3), inset 0 0 20px rgba(188,19,254,0.1)",
              zIndex: 10,
            }}>
              <img src={LOGO_URL} alt="AMH" style={{
                height: 34, width: "auto",
                filter: "drop-shadow(0 0 6px rgba(188,19,254,0.6))",
                WebkitFilter: "drop-shadow(0 0 6px rgba(188,19,254,0.6))",
              }} />
            </div>

            {/* Nav items around the wheel */}
            {WHEEL_ITEMS.map((item, i) => {
              const angle = startAngle + (i * 360 / count);
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * RADIUS;
              const y = Math.sin(rad) * RADIUS;
              const isSelected = selected === i;
              const delay = i * 0.06;

              return (
                <div key={item.label} style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                  zIndex: 5,
                  animation: `radialItemPop 0.35s ${delay}s ease-out both`,
                  opacity: 0,
                }}>
                  {/* Connector line from center */}
                  <svg style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    overflow: "visible", pointerEvents: "none",
                    width: 1, height: 1,
                  }}>
                    <line
                      x1="0" y1="0" x2={-x} y2={-y}
                      stroke={item.color}
                      strokeWidth="1"
                      opacity="0.15"
                      strokeDasharray="3,3"
                    />
                  </svg>

                  {/* Item node */}
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelected(i);
                      setTimeout(() => { setOpen(false); setSelected(null); }, 300);
                    }}
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 4,
                      textDecoration: "none",
                    }}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: isSelected ? `${item.color}33` : "rgba(10,0,20,0.9)",
                      border: `1.5px solid ${isSelected ? item.color : item.color + "55"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, color: item.color,
                      boxShadow: isSelected
                        ? `0 0 25px ${item.color}66, inset 0 0 15px ${item.color}22`
                        : `0 0 10px ${item.color}22`,
                      transition: "all 0.2s ease",
                      filter: `drop-shadow(0 0 4px ${item.color}66)`,
                      WebkitFilter: `drop-shadow(0 0 4px ${item.color}66)`,
                    }}>
                      {item.icon}
                    </div>
                    {/* Label */}
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 9, letterSpacing: "0.2em",
                      color: isSelected ? item.color : "#8b7aaa",
                      textShadow: isSelected ? `0 0 8px ${item.color}` : "none",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}>{item.label}</span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* HUD text */}
          <div style={{
            position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)",
            textAlign: "center",
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10, letterSpacing: "0.3em", color: "#5b4a7a",
            }}>SELECT DESTINATION</span>
          </div>
        </div>
      )}
    </>
  );
}

// ---------- CYBER FRAME WRAPPER ----------
function CyberFrame({ children, style: extra = {} }) {
  return (
    <div style={{ position: "relative", padding: 20, ...extra }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: "2px solid #bc13fe", borderLeft: "2px solid #bc13fe", opacity: 0.6 }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: "2px solid #bc13fe", borderRight: "2px solid #bc13fe", opacity: 0.6 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 20, height: 20, borderBottom: "2px solid #bc13fe", borderLeft: "2px solid #bc13fe", opacity: 0.6 }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderBottom: "2px solid #bc13fe", borderRight: "2px solid #bc13fe", opacity: 0.6 }} />
      {children}
    </div>
  );
}

// ---------- HEX ARTIST CARD ----------
function HexCard({ name, genre, color = "#bc13fe" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        width: 140, height: 140,
        background: hov ? `linear-gradient(135deg, #00f0ff, ${color})` : `linear-gradient(135deg, ${color}55, ${color}22)`,
        clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", WebkitClipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.4s ease",
        transform: hov ? "scale(1.08)" : "scale(1)",
        boxShadow: hov ? `0 0 30px ${color}66` : "none",
      }}>
        <div style={{
          width: 132, height: 132,
          background: hov ? "linear-gradient(135deg, #1a0533, #2d1b4e)" : "#0d0221",
          clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", WebkitClipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.4s ease",
        }}>
          <span style={{ fontSize: 36, opacity: 0.3, color: color }}>♫</span>
        </div>
      </div>
      <span style={{ color: hov ? "#e0d0ff" : "#a78bca", fontSize: 12, letterSpacing: "0.15em", transition: "color 0.3s", textAlign: "center" }}>{name}</span>
      <span style={{ color: "#5b4a7a", fontSize: 10, letterSpacing: "0.1em", marginTop: -8 }}>{genre}</span>
    </div>
  );
}

// ---------- SECTION: HERO ----------
function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 1s ease",
    }}>
      {/* Music symbols */}
      <div style={{ display: "flex", gap: 24, fontSize: 28, marginBottom: 32, alignItems: "center" }}>
        {[{ s: "𝄞", c: "#00f0ff" }, { s: "♩", c: "#ff2a6d" }, { s: "♫", c: "#bc13fe" }, { s: "𝄢", c: "#f5f500" }].map(({ s, c }, i) => (
          <span key={i} style={{ color: c, filter: `drop-shadow(0 0 8px ${c})`, WebkitFilter: `drop-shadow(0 0 8px ${c})`, animation: `pulse ${1.8 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }}>{s}</span>
        ))}
      </div>

      <h1 style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 7vw, 72px)",
        color: "#e0d0ff", letterSpacing: "0.15em", fontWeight: 400, margin: 0, lineHeight: 1.1,
        textShadow: "0 0 20px rgba(188,19,254,0.5), 0 0 60px rgba(188,19,254,0.2)",
      }}>
        AMPLIFY YOUR MUSIC.
        <br />
        <span style={{ color: "#bc13fe", textShadow: "0 0 20px #bc13fe, 0 0 60px rgba(188,19,254,0.4)" }}>
          OWN YOUR SOUND.
        </span>
      </h1>

      <p style={{
        color: "#8b7aaa", fontSize: "clamp(12px, 1.6vw, 16px)", letterSpacing: "0.2em",
        maxWidth: 600, margin: "24px 0 0", lineHeight: 1.8,
      }}>
        San Antonio's premier music marketing platform. Professional promotion,
        distribution, and sync licensing for independent artists.
      </p>

      {/* Stats bar */}
      <div style={{
        display: "flex", gap: "clamp(20px, 5vw, 48px)", marginTop: 40, flexWrap: "wrap", justifyContent: "center",
      }}>
        {[
          { val: "2018", label: "ESTABLISHED" },
          { val: "1M+", label: "STREAMS" },
          { val: "19+", label: "ARTISTS" },
          { val: "210", label: "SAN ANTONIO" },
        ].map(({ val, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(20px, 3vw, 32px)",
              color: "#00f0ff", textShadow: "0 0 10px rgba(0,240,255,0.5)",
            }}>{val}</div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Dual CTAs */}
      <div style={{ display: "flex", gap: 16, marginTop: 48, flexWrap: "wrap", justifyContent: "center" }}>
        <HeroButton primary label="EXPLORE AMPLIFY" icon="▲" href="/amplify" />
        <HeroButton label="ENTER TONE ZONE" icon="◈" href="/news" />
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "float 2s ease-in-out infinite",
      }}>
        <span style={{ color: "#5b4a7a", fontSize: 10, letterSpacing: "0.3em" }}>SCROLL</span>
        <span style={{ color: "#bc13fe", fontSize: 18 }}>▾</span>
      </div>
    </section>
  );
}

function HeroButton({ label, icon, primary, href = "#" }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-block", textDecoration: "none",
        background: primary
          ? (hov ? "linear-gradient(135deg, #711c91, #bc13fe)" : "linear-gradient(135deg, #711c91aa, #bc13feaa)")
          : "transparent",
        border: primary ? "1px solid #bc13fe" : "1px solid rgba(188,19,254,0.4)",
        color: primary ? "#e0d0ff" : (hov ? "#bc13fe" : "#8b7aaa"),
        padding: "14px 32px", fontSize: 12, letterSpacing: "0.25em", cursor: "pointer",
        fontFamily: "'Share Tech Mono', monospace",
        clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)", WebkitClipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
        transition: "all 0.3s ease",
        transform: hov ? "scale(1.04)" : "scale(1)",
        boxShadow: hov ? "0 0 20px rgba(188,19,254,0.4)" : "none",
      }}
    >
      {icon} {label}
    </a>
  );
}

// ---------- SECTION: WHAT WE DO ----------
const SERVICES = [
  { title: "MARKETING &\nPROMOTION", desc: "Strategic campaigns across Spotify, YouTube, TikTok, and Instagram. Data-driven targeting to reach your audience.", iconType: "transmit", color: "#bc13fe" },
  { title: "DISTRIBUTION", desc: "Get your music on every major platform. Professional release management and metadata optimization.", iconType: "globe", color: "#00f0ff" },
  { title: "SYNC\nLICENSING", desc: "Place your tracks in TV, film, commercials, and games. Real revenue from real placements.", iconType: "film", color: "#ff2a6d" },
  { title: "ARTIST\nDEVELOPMENT", desc: "1-on-1 coaching, brand strategy, and career planning. We build artists, not just playlists.", iconType: "bolt", color: "#f5f500" },
];

// Animated SVG icons for each service
function AnimatedIcon({ type, color, size = 44 }) {
  if (type === "transmit") {
    // Broadcast tower with concentric signal arcs
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" style={{ overflow: "visible" }}>
        {/* Tower base */}
        <line x1="22" y1="18" x2="16" y2="40" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="18" x2="28" y2="40" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {/* Tower crossbars */}
        <line x1="18.4" y1="28" x2="25.6" y2="28" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <line x1="17" y1="34" x2="27" y2="34" stroke={color} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
        {/* Antenna tip */}
        <line x1="22" y1="8" x2="22" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Tip dot */}
        <circle cx="22" cy="7" r="2" fill={color}>
          <animate attributeName="r" values="1.5;2.5;1.5" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.6;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
        {/* Signal arc 1 (inner) */}
        <path d="M16 10 A8 8 0 0 1 28 10" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" />
          <animate attributeName="d" values="M18 9 A5 5 0 0 1 26 9;M16 7 A8 8 0 0 1 28 7;M18 9 A5 5 0 0 1 26 9" dur="2s" repeatCount="indefinite" />
        </path>
        {/* Signal arc 2 (mid) */}
        <path d="M13 8 A12 12 0 0 1 31 8" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="d" values="M15 7 A9 9 0 0 1 29 7;M12 4 A13 13 0 0 1 32 4;M15 7 A9 9 0 0 1 29 7" dur="2s" begin="0.4s" repeatCount="indefinite" />
        </path>
        {/* Signal arc 3 (outer) */}
        <path d="M10 6 A16 16 0 0 1 34 6" stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.3;0" dur="2s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="d" values="M12 5 A13 13 0 0 1 32 5;M8 1 A18 18 0 0 1 36 1;M12 5 A13 13 0 0 1 32 5" dur="2s" begin="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
    );
  }

  if (type === "globe") {
    // Spinning globe with meridian lines
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        {/* Outer circle */}
        <circle cx="22" cy="22" r="16" stroke={color} strokeWidth="1.5" opacity="0.6" />
        {/* Equator */}
        <ellipse cx="22" cy="22" rx="16" ry="5" stroke={color} strokeWidth="1" opacity="0.4" />
        {/* Spinning meridian */}
        <ellipse cx="22" cy="22" rx="8" ry="16" stroke={color} strokeWidth="1.5" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="6s" repeatCount="indefinite" />
        </ellipse>
        {/* Second meridian offset */}
        <ellipse cx="22" cy="22" rx="13" ry="16" stroke={color} strokeWidth="1" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="60 22 22" to="420 22 22" dur="6s" repeatCount="indefinite" />
        </ellipse>
        {/* Glow dot orbiting */}
        <circle cx="22" cy="6" r="2" fill={color} opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (type === "film") {
    // Film frame with scanning light bar
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        {/* Film frame */}
        <rect x="6" y="8" width="32" height="28" rx="2" stroke={color} strokeWidth="1.5" opacity="0.6" />
        {/* Sprocket holes left */}
        <rect x="8" y="12" width="4" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.4" />
        <rect x="8" y="19" width="4" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.4" />
        <rect x="8" y="26" width="4" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.4" />
        {/* Sprocket holes right */}
        <rect x="32" y="12" width="4" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.4" />
        <rect x="32" y="19" width="4" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.4" />
        <rect x="32" y="26" width="4" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.4" />
        {/* Play triangle */}
        <polygon points="18,16 18,28 28,22" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </polygon>
        {/* Scanning light bar */}
        <line x1="6" y1="8" x2="38" y2="8" stroke={color} strokeWidth="2" opacity="0.6" strokeLinecap="round">
          <animate attributeName="y1" values="8;36;8" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" values="8;36;8" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.6;0.1" dur="3s" repeatCount="indefinite" />
        </line>
      </svg>
    );
  }

  if (type === "bolt") {
    // Lightning bolt with energy pulse
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" style={{ overflow: "visible" }}>
        {/* Main bolt */}
        <path d="M24 4 L16 20 L22 20 L18 40 L30 18 L24 18 Z" stroke={color} strokeWidth="1.5" fill={`${color}22`} strokeLinejoin="round">
          <animate attributeName="fill" values={`${color}11;${color}33;${color}11`} dur="1.8s" repeatCount="indefinite" />
        </path>
        {/* Energy ring 1 */}
        <circle cx="22" cy="22" r="18" stroke={color} strokeWidth="1" fill="none" opacity="0">
          <animate attributeName="r" values="12;22" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Energy ring 2 */}
        <circle cx="22" cy="22" r="18" stroke={color} strokeWidth="0.5" fill="none" opacity="0">
          <animate attributeName="r" values="12;22" dur="2s" begin="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        {/* Spark dots */}
        <circle cx="14" cy="14" r="1" fill={color} opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="28" r="1" fill={color} opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="28" cy="10" r="1" fill={color} opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="0.8s" begin="1.0s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  return null;
}

function WhatWeDoSection() {
  return (
    <section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
      <SectionHeader label="CORE SYSTEMS" title="WHAT WE DO" />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20, marginTop: 48,
      }}>
        {SERVICES.map((svc) => (
          <ServiceCard key={svc.title} {...svc} />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ title, desc, iconType, color }) {
  const [hov, setHov] = useState(false);
  return (
    <CyberFrame style={{
      background: hov ? "rgba(188,19,254,0.06)" : "rgba(10,0,16,0.8)",
      border: `1px solid ${hov ? color + "66" : "rgba(188,19,254,0.15)"}`,
      transition: "all 0.4s ease", cursor: "pointer",
      transform: hov ? "translateY(-4px)" : "translateY(0)",
      boxShadow: hov ? `0 0 30px ${color}22` : "none",
    }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ padding: "8px 0", textAlign: "center" }}
      >
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", filter: `drop-shadow(0 0 8px ${color})`, WebkitFilter: `drop-shadow(0 0 8px ${color})` }}>
          <AnimatedIcon type={iconType} color={color} size={44} />
        </div>
        <h3 style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 14, letterSpacing: "0.2em",
          color: hov ? color : "#e0d0ff", margin: "0 0 12px", whiteSpace: "pre-line", lineHeight: 1.4,
          transition: "color 0.3s",
        }}>{title}</h3>
        <p style={{ color: "#8b7aaa", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{desc}</p>
        <div style={{
          marginTop: 16, height: 1,
          background: `linear-gradient(90deg, transparent, ${color}44, transparent)`,
        }} />
      </div>
    </CyberFrame>
  );
}

// ---------- SECTION: AMPLIFY PREVIEW ----------
const TIERS = [
  {
    name: "BASIC", price: "$100", period: "/mo", color: "#bc13fe",
    features: ["Playlist Pitching", "Social Media Promotion", "Monthly Analytics Report"],
    tag: null,
  },
  {
    name: "PRO", price: "$250", period: "/mo", color: "#00f0ff",
    features: ["Everything in Basic", "Sync Licensing Submissions", "1-on-1 Strategy Session"],
    tag: "MOST POPULAR",
  },
  {
    name: "ELITE", price: "$500", period: "/mo", color: "#ff2a6d",
    features: ["Everything in Pro", "Dedicated Campaign Manager", "Priority Tone Zone Feature"],
    tag: "MAX POWER",
  },
];

function AmplifySection() {
  return (
    <section style={{ padding: "100px 24px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
      <SectionHeader label="SUBSCRIPTION TIERS" title="AMPLIFY YOUR CAREER" />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 20, marginTop: 48, alignItems: "start",
      }}>
        {TIERS.map((tier, i) => (
          <TierCard key={tier.name} {...tier} elevated={i === 1} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <span style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.2em" }}>
          ALL TIERS INCLUDE ACCESS TO THE AMH COMMUNITY · CANCEL ANYTIME
        </span>
      </div>
    </section>
  );
}

function TierCard({ name, price, period, color, features, tag, elevated }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: hov ? "rgba(188,19,254,0.06)" : "rgba(10,0,16,0.9)",
        border: `1px solid ${hov ? color : "rgba(188,19,254,0.2)"}`,
        padding: "32px 24px", textAlign: "center",
        transition: "all 0.4s ease", cursor: "pointer",
        transform: hov ? "translateY(-8px) scale(1.02)" : (elevated ? "translateY(-8px)" : "translateY(0)"),
        boxShadow: hov ? `0 0 40px ${color}33, inset 0 0 40px ${color}08` : (elevated ? `0 0 20px ${color}15` : "none"),
        clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)", WebkitClipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
      }}
    >
      {tag && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: `${color}22`, border: `1px solid ${color}44`,
          padding: "4px 12px", fontSize: 8, letterSpacing: "0.2em", color: color,
        }}>{tag}</div>
      )}
      <h3 style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 18, letterSpacing: "0.3em",
        color: color, margin: "0 0 16px",
        textShadow: hov ? `0 0 10px ${color}` : "none",
      }}>{name}</h3>
      <div style={{ marginBottom: 24 }}>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(36px, 5vw, 48px)",
          color: "#e0d0ff",
        }}>{price}</span>
        <span style={{ color: "#5b4a7a", fontSize: 14 }}>{period}</span>
      </div>
      <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 20, marginBottom: 24 }}>
        {features.map((f) => (
          <div key={f} style={{
            color: "#a78bca", fontSize: 12, lineHeight: 1.5, padding: "6px 0",
            borderBottom: "1px solid rgba(188,19,254,0.06)",
          }}>
            <span style={{ color: color, marginRight: 8 }}>▸</span>{f}
          </div>
        ))}
      </div>
      <a href={`/amplify#${name.toLowerCase()}`} style={{
        display: "block", textDecoration: "none", textAlign: "center",
        background: hov ? `${color}22` : "transparent",
        border: `1px solid ${color}66`, color: color,
        padding: "10px 24px", fontSize: 11, letterSpacing: "0.2em",
        cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
        transition: "all 0.3s", width: "100%",
        clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)", WebkitClipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
      }}>
        SELECT {name}
      </a>
    </div>
  );
}

// ---------- SECTION: TONE ZONE SPOTLIGHT ----------
const ARTISTS = [
  { name: "BxneYvrdBxyz", genre: "HIP-HOP" },
  { name: "Trevion500", genre: "R&B" },
  { name: "YungNygma", genre: "RAP" },
  { name: "JusDeno", genre: "HIP-HOP" },
  { name: "Drunk Wizdumb", genre: "ALT RAP" },
  { name: "Deacon Rap", genre: "RAP" },
];

function ToneZoneSection() {
  return (
    <section style={{ padding: "100px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader label="REPPIN' THE 210" title="THE TONE ZONE" />
        <p style={{
          color: "#8b7aaa", fontSize: 13, letterSpacing: "0.1em", textAlign: "center",
          maxWidth: 500, margin: "16px auto 48px", lineHeight: 1.7,
        }}>
          San Antonio's finest. These artists are pushing the sound forward.
        </p>
      </div>
      <div style={{
        display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap",
        maxWidth: 1100, margin: "0 auto", padding: "0 24px",
      }}>
        {ARTISTS.map((a, i) => (
          <HexCard key={a.name} {...a} color={["#bc13fe", "#00f0ff", "#ff2a6d", "#bc13fe", "#00f0ff", "#ff2a6d"][i]} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 48 }}>
        <HeroButton label="VIEW ALL ARTISTS" icon="◈" href="/news" />
      </div>
    </section>
  );
}

// ---------- SECTION: GET FEATURED ----------
function GetFeaturedSection() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
        <div style={{
          maxWidth: 700, margin: "0 auto",
          background: "rgba(10,0,16,0.85)", border: "1px solid rgba(0,240,255,0.2)",
          padding: "48px 32px", textAlign: "center",
          clipPath: "polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)",
          WebkitClipPath: "polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)",
          boxShadow: "0 0 40px rgba(0,240,255,0.08), inset 0 0 40px rgba(0,240,255,0.03)",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 12 }}>OPEN CALL</div>
          <h2 style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(22px, 4.5vw, 36px)",
            letterSpacing: "0.2em", color: "#00f0ff", margin: "0 0 16px", fontWeight: 400,
            textShadow: "0 0 15px rgba(0,240,255,0.4)",
          }}>GET FEATURED</h2>
          <div style={{
            height: 2, width: 60, margin: "0 auto 24px",
            background: "linear-gradient(90deg, transparent, #00f0ff, #bc13fe, transparent)",
            boxShadow: "0 0 10px rgba(0,240,255,0.5)",
          }} />
          <p style={{
            color: "#a78bca", fontSize: 13, lineHeight: 1.8, maxWidth: 500, margin: "0 auto 8px",
          }}>
            Looking to have your content featured on our site? We spotlight San Antonio
            creatives pushing the sound forward. Send us your music for review.
          </p>
          <p style={{
            color: "#00f0ff", fontSize: 11, letterSpacing: "0.15em", margin: "0 0 28px",
            textShadow: "0 0 8px rgba(0,240,255,0.3)",
          }}>
            ◈ MUST BE BORN IN OR REP SAN ANTONIO ◈
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "transparent", border: "1px solid #00f0ff",
              color: "#00f0ff", padding: "14px 36px", fontSize: 12, letterSpacing: "0.25em",
              cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
              clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
              WebkitClipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
              transition: "all 0.3s",
              boxShadow: "0 0 14px rgba(0,240,255,0.25), inset 0 0 14px rgba(0,240,255,0.05)",
            }}
            onMouseEnter={e => { e.target.style.boxShadow = "0 0 30px rgba(0,240,255,0.45)"; e.target.style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { e.target.style.boxShadow = "0 0 14px rgba(0,240,255,0.25), inset 0 0 14px rgba(0,240,255,0.05)"; e.target.style.transform = "scale(1)"; }}
          >
            ▶ SUBMIT FOR REVIEW
          </button>
        </div>
      </section>

      {/* Modal */}
      {showModal && <FeaturedModal onClose={() => setShowModal(false)} />}
    </>
  );
}

function FeaturedModal({ onClose }) {
  const [form, setForm] = useState({ artistName: "", realName: "", email: "", socials: "", musicLinks: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.artistName || !form.email || !form.musicLinks) {
      setStatus("error");
      setStatusMsg("REQUIRED: Artist name, email, and music links");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          featured: true,
          artistName: form.artistName,
          realName: form.realName,
          socials: form.socials,
          musicLinks: form.musicLinks,
          message: form.message,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setStatusMsg("TRANSMISSION RECEIVED — WE'LL GET BACK TO YOU");
      } else {
        setStatus("error");
        setStatusMsg("TRANSMISSION FAILED — TRY AGAIN OR EMAIL US DIRECTLY");
      }
    } catch {
      setStatus("error");
      setStatusMsg("TRANSMISSION FAILED — TRY AGAIN OR EMAIL US DIRECTLY");
    }
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#0a0a0f", border: "1px solid rgba(0,240,255,0.3)",
        boxShadow: "0 0 60px rgba(0,240,255,0.15), inset 0 0 40px rgba(0,0,0,0.5)",
        width: "min(560px, 95vw)", maxHeight: "90vh", overflowY: "auto",
        scrollbarWidth: "none",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: "1px solid rgba(0,240,255,0.15)",
          background: "rgba(0,240,255,0.03)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3d2060" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00f0ff" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#bc13fe" }} />
            <span style={{ color: "#5b4a7a", fontSize: 10, letterSpacing: "0.2em", marginLeft: 8 }}>GET FEATURED — SUBMISSION FORM</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#5b4a7a", fontSize: 18,
              cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = "#ff2a6d"}
            onMouseLeave={e => e.target.style.color = "#5b4a7a"}
          >✕</button>
        </div>

        {/* Form body */}
        <div style={{ padding: "24px 24px 32px" }}>
          <p style={{ color: "#a78bca", fontSize: 12, lineHeight: 1.7, marginBottom: 24 }}>
            Submit your music for review. We feature San Antonio creatives who are
            born in or rep the 210. Fill out the details below and we'll get back to you.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Artist Name */}
            <ModalField label="ARTIST / STAGE NAME *" value={form.artistName} onChange={v => update("artistName", v)} placeholder="Your artist name" />
            {/* Real Name */}
            <ModalField label="REAL NAME" value={form.realName} onChange={v => update("realName", v)} placeholder="Your legal name (optional)" />
            {/* Email */}
            <ModalField label="EMAIL *" value={form.email} onChange={v => update("email", v)} placeholder="your@email.com" type="email" />
            {/* Social Media */}
            <ModalField label="SOCIAL MEDIA LINKS" value={form.socials} onChange={v => update("socials", v)} placeholder="Instagram, TikTok, Twitter URLs" />
            {/* Music Links */}
            <ModalField label="LINKS TO YOUR MUSIC *" value={form.musicLinks} onChange={v => update("musicLinks", v)} placeholder="Spotify, SoundCloud, YouTube, etc." />
            {/* Message */}
            <div>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.25em", color: "#5b4a7a", marginBottom: 6 }}>
                MESSAGE (OPTIONAL)
              </label>
              <textarea
                value={form.message}
                onChange={e => update("message", e.target.value)}
                placeholder="Tell us about yourself and your music..."
                rows={3}
                style={{
                  width: "100%", background: "rgba(0,240,255,0.03)",
                  border: "1px solid rgba(0,240,255,0.2)", color: "#e0d0ff",
                  padding: "10px 14px", fontSize: 12,
                  fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.03em",
                  resize: "vertical", transition: "all 0.2s",
                  outline: "none",
                }}
                onFocus={e => { e.target.style.borderColor = "#00f0ff"; e.target.style.boxShadow = "0 0 12px rgba(0,240,255,0.2)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,240,255,0.2)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* SA Requirement notice */}
          <div style={{
            marginTop: 20, padding: "10px 14px",
            background: "rgba(188,19,254,0.04)", border: "1px solid rgba(188,19,254,0.12)",
            fontSize: 10, color: "#8b7aaa", lineHeight: 1.6, letterSpacing: "0.05em",
          }}>
            ◈ By submitting, you confirm you are born in or currently represent
            San Antonio, TX as a creative. We review all submissions and will
            respond within 5–7 business days.
          </div>

          {/* Status message */}
          {statusMsg && (
            <p style={{
              marginTop: 16, fontSize: 11, letterSpacing: "0.15em", textAlign: "center",
              color: status === "success" ? "#00f0ff" : "#ff2a6d",
              textShadow: status === "success" ? "0 0 8px rgba(0,240,255,0.4)" : "0 0 8px rgba(255,42,109,0.4)",
            }}>{statusMsg}</p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || status === "success"}
              style={{
                background: status === "success" ? "rgba(0,240,255,0.1)" : "transparent",
                border: "1px solid #00f0ff", color: "#00f0ff",
                padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em",
                cursor: status === "loading" || status === "success" ? "default" : "pointer",
                fontFamily: "'Share Tech Mono', monospace",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                transition: "all 0.3s",
                opacity: status === "loading" || status === "success" ? 0.6 : 1,
              }}
            >
              {status === "loading" ? "TRANSMITTING..." : status === "success" ? "✓ SENT" : "▶ SUBMIT FOR REVIEW"}
            </button>
            <a
              href="mailto:artists.musicians.hub@gmail.com?subject=Get Featured on AMH&body=Artist Name:%0AReal Name:%0ASocial Media Links:%0AMusic Links:%0AMessage:"
              style={{
                background: "transparent", border: "1px solid rgba(188,19,254,0.4)",
                color: "#8b7aaa", padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em",
                textDecoration: "none", fontFamily: "'Share Tech Mono', monospace",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                transition: "all 0.3s", display: "inline-block",
              }}
              onMouseEnter={e => { e.target.style.color = "#bc13fe"; e.target.style.borderColor = "#bc13fe"; }}
              onMouseLeave={e => { e.target.style.color = "#8b7aaa"; e.target.style.borderColor = "rgba(188,19,254,0.4)"; }}
            >
              ✉ EMAIL US DIRECTLY
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 9, letterSpacing: "0.25em", color: "#5b4a7a", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: "rgba(0,240,255,0.03)",
          border: "1px solid rgba(0,240,255,0.2)", color: "#e0d0ff",
          padding: "10px 14px", fontSize: 12,
          fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.03em",
          transition: "all 0.2s", outline: "none",
        }}
        onFocus={e => { e.target.style.borderColor = "#00f0ff"; e.target.style.boxShadow = "0 0 12px rgba(0,240,255,0.2)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(0,240,255,0.2)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

// ---------- SECTION: SOCIAL PROOF ----------
function SocialProofSection() {
  return (
    <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        background: "rgba(10,0,16,0.8)", border: "1px solid rgba(188,19,254,0.15)",
        padding: "48px 32px", textAlign: "center",
        clipPath: "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)", WebkitClipPath: "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#5b4a7a", marginBottom: 24 }}>MISSION STATUS</div>
        <div style={{
          display: "flex", justifyContent: "center", gap: "clamp(24px, 6vw, 64px)", flexWrap: "wrap",
        }}>
          {[
            { val: "1,000,000+", label: "TOTAL STREAMS", color: "#bc13fe" },
            { val: "500+", label: "PLAYLIST PLACEMENTS", color: "#00f0ff" },
            { val: "50+", label: "SYNC LICENSES", color: "#ff2a6d" },
            { val: "7+", label: "YEARS ACTIVE", color: "#f5f500" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(22px, 3.5vw, 36px)",
                color, textShadow: `0 0 15px ${color}66`, lineHeight: 1,
              }}>{val}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", marginTop: 8 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 32, padding: "20px 0 0", borderTop: "1px solid rgba(188,19,254,0.1)",
        }}>
          <p style={{
            color: "#a78bca", fontSize: 13, fontStyle: "italic", lineHeight: 1.7, maxWidth: 500, margin: "0 auto",
          }}>
            "AMH didn't just market my music — they built a strategy that changed my career trajectory."
          </p>
          <p style={{ color: "#5b4a7a", fontSize: 10, letterSpacing: "0.2em", marginTop: 8 }}>— AMH ARTIST</p>
        </div>
      </div>
    </section>
  );
}

// ---------- SECTION: SPLIT PANEL CTA ----------
function SplitCTASection() {
  return (
    <section style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20,
      }}>
        {/* Artists side */}
        <SplitPanel
          color="#bc13fe"
          icon="▲"
          title="FOR ARTISTS"
          subtitle="READY TO AMPLIFY?"
          desc="Join the AMPLIFY program and get professional marketing, distribution, and sync licensing backing your music."
          cta="GET STARTED"
          href="/amplify"
        />
        {/* Fans side */}
        <SplitPanel
          color="#00f0ff"
          icon="◈"
          title="FOR LISTENERS"
          subtitle="DISCOVER SA MUSIC"
          desc="Explore The Tone Zone — San Antonio's best independent artists, curated playlists, and fresh releases."
          cta="EXPLORE ARTISTS"
          href="/news"
        />
      </div>
    </section>
  );
}

function SplitPanel({ color, icon, title, subtitle, desc, cta, href }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}08` : "rgba(10,0,16,0.8)",
        border: `1px solid ${hov ? color + "55" : "rgba(188,19,254,0.15)"}`,
        padding: "40px 28px", textAlign: "center",
        transition: "all 0.4s ease", cursor: "pointer",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 0 30px ${color}22` : "none",
        clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)", WebkitClipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
      }}
    >
      <div style={{ fontSize: 32, color, filter: `drop-shadow(0 0 10px ${color})`, WebkitFilter: `drop-shadow(0 0 10px ${color})`, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#5b4a7a", marginBottom: 8 }}>{title}</div>
      <h3 style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 20, letterSpacing: "0.2em",
        color: hov ? color : "#e0d0ff", margin: "0 0 16px", transition: "color 0.3s",
        textShadow: hov ? `0 0 10px ${color}` : "none",
      }}>{subtitle}</h3>
      <p style={{ color: "#8b7aaa", fontSize: 12, lineHeight: 1.7, margin: "0 0 24px" }}>{desc}</p>
      <a href={href} style={{
        display: "inline-block", background: "transparent", border: `1px solid ${color}66`,
        color, padding: "10px 24px", fontSize: 11, letterSpacing: "0.2em",
        textDecoration: "none", fontFamily: "'Share Tech Mono', monospace",
        clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)", WebkitClipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
        transition: "all 0.3s",
        boxShadow: hov ? `0 0 15px ${color}33` : "none",
      }}>{cta}</a>
    </div>
  );
}

// ---------- FOOTER ----------
const FOOTER_NAV = [
  { section: "NAVIGATE", links: [{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Services", href: "/services" }] },
  { section: "PROGRAMS", links: [{ label: "AMPLIFY", href: "/amplify" }, { label: "Tone Zone", href: "/news" }, { label: "Submit Content", href: "/submit" }] },
  { section: "CONNECT", links: [{ label: "Contact", href: "/contact" }, { label: "Blog", href: "/blog" }, { label: "Shop", href: "/shop" }] },
];

const SOCIALS = [
  { label: "IG", icon: "◉", href: "#" },
  { label: "YT", icon: "▶", href: "#" },
  { label: "SP", icon: "●", href: "#" },
  { label: "TW", icon: "◆", href: "#" },
];

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(188,19,254,0.15)", padding: "48px 24px 32px", position: "relative", zIndex: 2, background: "rgba(5,0,10,0.6)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Centered logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={LOGO_URL} alt="Artists Musicians Hub" style={{ height: 60, width: "auto", filter: "drop-shadow(0 0 10px rgba(188,19,254,0.5)) drop-shadow(0 0 30px rgba(188,19,254,0.2))", WebkitFilter: "drop-shadow(0 0 10px rgba(188,19,254,0.5)) drop-shadow(0 0 30px rgba(188,19,254,0.2))" }} />
          <div style={{ height: 2, width: 60, margin: "12px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)" }} />
        </div>
        {/* Nav columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {FOOTER_NAV.map(col => (
            <div key={col.section}>
              <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#bc13fe", marginBottom: 16, fontFamily: "'Share Tech Mono', monospace" }}>{col.section}</div>
              {col.links.map(link => (<a key={link.label} href={link.href} style={{ display: "block", color: "#8b7aaa", fontSize: 12, textDecoration: "none", padding: "5px 0", letterSpacing: "0.05em" }}>{link.label}</a>))}
            </div>
          ))}
        </div>
        {/* Socials */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
          {SOCIALS.map(s => (<a key={s.label} href={s.href} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(188,19,254,0.3)", color: "#8b7aaa", fontSize: 12, textDecoration: "none", transition: "all 0.3s", clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)", WebkitClipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }} title={s.label}>{s.icon}</a>))}
        </div>
      </div>
      {/* Bottom bar */}
      <div style={{ maxWidth: 1000, margin: "24px auto 0", paddingTop: 20, borderTop: "1px solid rgba(188,19,254,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "#3d2060", fontSize: 10, letterSpacing: "0.15em" }}>© 2026 ARTISTS MUSICIANS HUB. ALL RIGHTS RESERVED.</span>
        <div style={{ display: "flex", gap: 16 }}>
          {["Privacy", "Terms", "Refunds"].map(link => (<a key={link} href={`/${link.toLowerCase()}`} style={{ color: "#3d2060", fontSize: 10, letterSpacing: "0.1em", textDecoration: "none" }}>{link}</a>))}
        </div>
      </div>
    </footer>
  );
}

// ---------- SHARED: SECTION HEADER ----------
function SectionHeader({ label, title }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>{label}</div>
      <h2 style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 5vw, 42px)",
        letterSpacing: "0.2em", color: "#e0d0ff", margin: 0, fontWeight: 400,
        textShadow: "0 0 15px rgba(188,19,254,0.3)",
      }}>{title}</h2>
      <div style={{
        height: 2, width: 60, margin: "16px auto 0",
        background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)",
        boxShadow: "0 0 10px rgba(188,19,254,0.5)",
      }} />
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function AMHHomePage() {
  return (
    <div style={{
      background: "#0a0a0f",
      color: "#e0d0ff",
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Global background layers */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
      }} />
      <ElectricGrid />

      {/* Navigation */}
      <XMBNav />
      <RadialNav />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <HeroSection />
        <WhatWeDoSection />
        <AmplifySection />
        <ToneZoneSection />
        <GetFeaturedSection />
        <SocialProofSection />
        <SplitCTASection />
        <Footer />
      </div>

      {/* Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.45} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
        @keyframes radialFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes radialItemPop { from{opacity:0} to{opacity:1} }
        @keyframes radialRingSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes triggerPulse { 0%,100%{box-shadow:0 0 15px rgba(188,19,254,0.3)} 50%{box-shadow:0 0 25px rgba(188,19,254,0.5), 0 0 50px rgba(188,19,254,0.15)} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        body { background: #0a0a0f; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
        img { max-width: 100%; height: auto; }
        a:hover { color: #bc13fe !important; }

        /* ── MODAL FORM STYLES ── */
        input::placeholder, textarea::placeholder { color: #3d2060 !important; }
        input:focus, textarea:focus { outline: none; }
        div[style*="overflowY"]::-webkit-scrollbar { display: none; }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
        button:disabled { cursor: default !important; }

        /* ── RADIAL WHEEL: hidden on desktop ── */
        .radial-trigger { display: none !important; }
        .mobile-topbar { display: none !important; }

        /* ── TABLET (769px – 1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .desktop-nav > div:nth-child(2) > a { padding: 8px 10px !important; }
          .desktop-nav > div:nth-child(2) > a > span:last-of-type { font-size: 8px !important; letter-spacing: 0.12em !important; }
          section { padding-left: 32px !important; padding-right: 32px !important; }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          /* Hide desktop XMB nav, show radial wheel */
          .desktop-nav { display: none !important; }
          .radial-trigger { display: flex !important; animation: triggerPulse 3s ease-in-out infinite; }
          .mobile-topbar { display: flex !important; }

          /* All sections: center text */
          section { text-align: center !important; }
          section h3, section p { text-align: center !important; }

          /* Service cards: single column, centered */
          section > div[style*="grid"] {
            grid-template-columns: 1fr !important;
            max-width: 360px;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          /* Tier cards: single column */
          section > div[style*="grid"][style*="260px"] {
            max-width: 340px;
          }

          /* Split CTA: stack */
          section > div[style*="300px"] {
            grid-template-columns: 1fr !important;
            max-width: 400px;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          /* Footer: center everything */
          footer > div { text-align: center !important; }
          footer > div > div { text-align: center !important; align-items: center !important; }
          footer > div > div > div:last-child { justify-content: center !important; }
          footer > div:last-child { justify-content: center !important; text-align: center !important; }
          footer > div:last-child > div { justify-content: center !important; }
        }

        @media (max-width: 480px) {
          .radial-trigger { bottom: 18px !important; right: 18px !important; width: 50px !important; height: 50px !important; font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// NAV STYLES
// ============================================================
const nav = {
  root: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 56,
    background: "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.8) 70%, transparent 100%)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(188,19,254,0.1)",
  },
  brand: { display: "flex", alignItems: "center", height: "100%" },
  items: { display: "flex", gap: 4, alignItems: "center" },
  item: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
    padding: "8px 16px", textDecoration: "none", cursor: "pointer",
    transition: "all 0.3s ease", position: "relative", borderRadius: 2,
  },
  itemActive: { background: "rgba(188,19,254,0.08)" },
  itemHover: { background: "rgba(188,19,254,0.04)" },
  icon: { fontSize: 16, color: "#5b4a7a", transition: "all 0.3s" },
  iconActive: { color: "#bc13fe", filter: "drop-shadow(0 0 6px #bc13fe)", WebkitFilter: "drop-shadow(0 0 6px #bc13fe)" },
  label: {
    fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a",
    fontFamily: "'Share Tech Mono', monospace", transition: "color 0.3s",
  },
  labelActive: { color: "#e0d0ff" },
  activeDot: {
    position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
    width: 3, height: 3, borderRadius: "50%", background: "#bc13fe",
    boxShadow: "0 0 6px #bc13fe",
  },
  hudRight: { display: "flex", alignItems: "center" },
  hudText: { fontSize: 9, letterSpacing: "0.2em", color: "#3d2060" },
};
