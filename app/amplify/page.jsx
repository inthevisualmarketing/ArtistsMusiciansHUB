"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// AMH AMPLIFY PAGE — PlayStation × Cyberpunk HUD
// About AMPLIFY · Expandable Tier Cards · Full Details
// ============================================================

const GRID_SIZE = 40;
const LOGO_URL = "https://res.cloudinary.com/dbpremci4/image/upload/w_200,h_200,c_fit/white-hub-logo-transparent";

// ---------- ELECTRIC GRID ----------
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
    resize(); window.addEventListener("resize", resize);
    function pickDir(col, row, avoid, cols, rows) {
      const dirs = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }];
      const valid = dirs.filter(d => { const nc = col + d.dc, nr = row + d.dr; return nc >= 0 && nc <= cols && nr >= 0 && nr <= rows; });
      const pool = avoid ? valid.filter(d => !(d.dc === avoid.dc && d.dr === avoid.dr)) : valid;
      return (pool.length ? pool : valid)[Math.floor(Math.random() * (pool.length || valid.length))];
    }
    function createPulse() {
      const cols = Math.floor(canvas.width / GRID_SIZE), rows = Math.floor(canvas.height / GRID_SIZE);
      return { id: nextId++, color: COLORS[Math.floor(Math.random() * COLORS.length)], col: Math.floor(Math.random() * cols), row: Math.floor(Math.random() * rows), dir: pickDir(0, 0, null, cols, rows), t: 0, speed: 0.003 + Math.random() * 0.003, trailLength: 3 + Math.floor(Math.random() * 3), alpha: 0.12 + Math.random() * 0.1, trail: [], done: false, _steps: 0, cols, rows };
    }
    pulses.push(createPulse());
    setTimeout(() => { if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse()); }, 2400);
    function maybeRespawn() { if (pulses.filter(p => !p.done).length < 2) pulses.push(createPulse()); }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulses.forEach(p => {
        if (p.done) return;
        const px = p.col * GRID_SIZE + p.dir.dc * GRID_SIZE * p.t, py = p.row * GRID_SIZE + p.dir.dr * GRID_SIZE * p.t;
        p.trail.push({ x: px, y: py }); if (p.trail.length > p.trailLength * 18) p.trail.shift();
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0; p.col += p.dir.dc; p.row += p.dir.dr;
          if (p.col <= 0 || p.col >= p.cols) { p.dir = { dc: -p.dir.dc, dr: p.dir.dr }; p.col = Math.max(0, Math.min(p.cols, p.col)); }
          if (p.row <= 0 || p.row >= p.rows) { p.dir = { dc: p.dir.dc, dr: -p.dir.dr }; p.row = Math.max(0, Math.min(p.rows, p.row)); }
          const key = `${p.col},${p.row}`, otherId = occupied.get(key);
          if (otherId !== undefined && otherId !== p.id) { const other = pulses.find(q => q.id === otherId && !q.done); if (other) { p.dir = pickDir(p.col, p.row, p.dir, p.cols, p.rows); other.dir = pickDir(other.col, other.row, other.dir, other.cols, other.rows); } }
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
      pulses = pulses.filter(p => !p.done); animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ---------- SECTION HEADER ----------
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

// ---------- CYBER FRAME ----------
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

// ============================================================
// HERO
// ============================================================
function AmplifyHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);

  return (
    <section style={{
      minHeight: "auto", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "120px 24px 40px",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 1s ease", position: "relative",
    }}>
      {/* Animated lightning bolt */}
      <div style={{ marginBottom: 24, filter: "drop-shadow(0 0 12px rgba(188,19,254,0.6))", WebkitFilter: "drop-shadow(0 0 12px rgba(188,19,254,0.6))" }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ overflow: "visible" }}>
          {/* Main bolt */}
          <polygon points="32,4 18,30 27,30 22,60 48,24 37,24" stroke="#bc13fe" strokeWidth="2" fill="rgba(188,19,254,0.1)" strokeLinejoin="round">
            <animate attributeName="fill" values="rgba(188,19,254,0.05);rgba(188,19,254,0.25);rgba(188,19,254,0.05)" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="stroke" values="#bc13fe;#e0d0ff;#bc13fe" dur="1.5s" repeatCount="indefinite" />
          </polygon>
          {/* Flicker overlay — rapid brightness flash */}
          <polygon points="32,4 18,30 27,30 22,60 48,24 37,24" stroke="white" strokeWidth="1" fill="rgba(255,255,255,0.15)" strokeLinejoin="round" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0;0;0.3;0;0;0" dur="3s" repeatCount="indefinite" />
          </polygon>
          {/* Inner bright core */}
          <polygon points="32,10 23,30 28,30 24,52 42,26 36,26" fill="rgba(188,19,254,0.15)" opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
          </polygon>
          {/* Energy ring 1 */}
          <circle cx="32" cy="32" r="28" stroke="#bc13fe" strokeWidth="1" fill="none" opacity="0">
            <animate attributeName="r" values="18;34" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Energy ring 2 */}
          <circle cx="32" cy="32" r="28" stroke="#bc13fe" strokeWidth="0.5" fill="none" opacity="0">
            <animate attributeName="r" values="18;34" dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          {/* Energy ring 3 */}
          <circle cx="32" cy="32" r="28" stroke="#bc13fe" strokeWidth="0.3" fill="none" opacity="0">
            <animate attributeName="r" values="18;38" dur="2s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0" dur="2s" begin="1s" repeatCount="indefinite" />
          </circle>
          {/* Spark dots */}
          <circle cx="18" cy="16" r="1.5" fill="#bc13fe" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="46" cy="38" r="1" fill="#00f0ff" opacity="0">
            <animate attributeName="opacity" values="0;0.8;0" dur="0.8s" begin="0.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="10" r="1" fill="#ff2a6d" opacity="0">
            <animate attributeName="opacity" values="0;0.7;0" dur="0.7s" begin="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="14" cy="42" r="1" fill="#bc13fe" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="0.9s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>
        SUBSCRIPTION PROGRAM
      </div>

      <h1 style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(36px, 8vw, 80px)",
        color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: 0, lineHeight: 1,
        textShadow: "0 0 20px rgba(188,19,254,0.5), 0 0 60px rgba(188,19,254,0.2)",
      }}>
        <span style={{ color: "#bc13fe", textShadow: "0 0 30px #bc13fe, 0 0 80px rgba(188,19,254,0.3)" }}>
          AMPLIFY
        </span>
      </h1>

      <p style={{
        color: "#8b7aaa", fontSize: "clamp(12px, 1.6vw, 15px)", letterSpacing: "0.15em",
        maxWidth: 560, margin: "20px 0 0", lineHeight: 1.8,
      }}>
        Real growth. Organic marketing. No fake followers, no bots.
        Professional tools to elevate your music career in the era of WEB3.
      </p>

      {/* Quick tier preview */}
      <div style={{ display: "flex", gap: 24, marginTop: 40, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { name: "BASIC", price: "$100", color: "#bc13fe" },
          { name: "PRO", price: "$250", color: "#00f0ff" },
          { name: "ELITE", price: "$500", color: "#ff2a6d" },
        ].map(t => (
          <a key={t.name} href={`#${t.name.toLowerCase()}`} style={{
            textDecoration: "none", textAlign: "center", padding: "8px 20px",
            border: `1px solid ${t.color}44`, transition: "all 0.3s",
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
          }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: t.color }}>{t.name}</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 20, color: "#e0d0ff", marginTop: 2 }}>{t.price}<span style={{ fontSize: 11, color: "#5b4a7a" }}>/mo</span></div>
          </a>
        ))}
      </div>

      {/* Scroll indicator — in flow, not absolute */}
      <div style={{
        marginTop: 48,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "float 2s ease-in-out infinite",
      }}>
        <span style={{ color: "#5b4a7a", fontSize: 10, letterSpacing: "0.3em" }}>LEARN MORE</span>
        <span style={{ color: "#bc13fe", fontSize: 18 }}>▾</span>
      </div>
    </section>
  );
}

// ============================================================
// ABOUT AMPLIFY
// ============================================================
function AboutAmplifySection() {
  return (
    <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionHeader label="THE MISSION" title="WHAT IS AMPLIFY?" />

        <div style={{ marginTop: 48 }}>
          <CyberFrame style={{
            background: "rgba(10,0,16,0.85)",
            border: "1px solid rgba(188,19,254,0.15)",
          }}>
            <div style={{ padding: "12px 8px" }}>
              {[
                "AMPLIFY is a revolutionary service designed for musicians and music producers who crave more from their work and are determined to achieve success without relying on fake followers or bots.",
                "We understand that the journey of an artist is no longer confined by the limitations of traditional methods. In the era of WEB3 and trailblazing music pioneers, the opportunities to elevate your career have expanded exponentially.",
                "At the Artists Musicians HUB, we believe that true success in the music industry comes from genuine talent, dedication, and innovative approaches. Our mission is to empower artists to break free from outdated standards and forge a path of their own, fueled by authentic engagement and meaningful connections.",
                "Our platform is not just about boosting numbers or creating a fleeting buzz. We are here to build a supportive ecosystem that nurtures your artistry, fosters lasting connections, and propels your career to new heights.",
                "Whether you're a seasoned artist looking to reinvent your image or an emerging producer eager to showcase your unique sound, AMPLIFY is the ultimate catalyst for your success.",
              ].map((text, i) => (
                <p key={i} style={{
                  color: i === 0 ? "#e0d0ff" : "#a78bca",
                  fontSize: i === 0 ? 14 : 13,
                  lineHeight: 1.8, margin: i === 0 ? "0 0 20px" : "0 0 16px",
                  letterSpacing: "0.02em",
                  textAlign: "center",
                }}>
                  {text}
                </p>
              ))}

              {/* Key values */}
              <div style={{
                display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
                marginTop: 28, paddingTop: 24,
                borderTop: "1px solid rgba(188,19,254,0.1)",
              }}>
                {[
                  { val: "REAL GROWTH", icon: "▲", color: "#bc13fe" },
                  { val: "NO BOTS", icon: "✕", color: "#ff2a6d" },
                  { val: "WEB3 READY", icon: "◈", color: "#00f0ff" },
                  { val: "ORGANIC", icon: "♫", color: "#f5f500" },
                ].map(v => (
                  <div key={v.val} style={{
                    padding: "8px 16px", border: `1px solid ${v.color}33`,
                    display: "flex", alignItems: "center", gap: 8,
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    WebkitClipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                  }}>
                    <span style={{ color: v.color, fontSize: 14, filter: `drop-shadow(0 0 4px ${v.color})` }}>{v.icon}</span>
                    <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#8b7aaa" }}>{v.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </CyberFrame>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TIER DATA
// ============================================================
const TIERS = [
  {
    id: "basic",
    name: "BASIC",
    price: "$100",
    color: "#bc13fe",
    tag: "FOUNDATION",
    tagline: "This is where it all begins.",
    stripeUrl: "https://buy.stripe.com/AMH_BASIC_LINK", // Replace with real Stripe payment link
    summary: "Ideal for aspiring musicians and producers who want to explore our platform and take their first steps towards success.",
    features: [
      {
        title: "Access to the TONE ZONE",
        desc: "Be listed in our exclusive TONE ZONE — a dedicated section on our website where San Antonio artists are showcased for free. Gain exposure to a wide audience and potential collaborators.",
      },
      {
        title: "Submission Opportunities",
        desc: "Showcase your music to our extensive network of music supervisors, licensing opportunities, and industry professionals.",
      },
      {
        title: "Access to the TONE ZONE Blog",
        desc: "Contribute to our TONE ZONE blog and share industry tips and growth tactics with fellow artists and our community. Gain visibility as an industry thought leader.",
      },
      {
        title: "Release Under AMH",
        desc: "Your music will be released under the Artists Musicians HUB label, gaining the credibility and network of an established platform.",
      },
    ],
  },
  {
    id: "pro",
    name: "PRO",
    price: "$250",
    color: "#00f0ff",
    tag: "MOST POPULAR",
    tagline: "Ready to take your music career to the next level?",
    stripeUrl: "https://buy.stripe.com/AMH_PRO_LINK", // Replace with real Stripe payment link
    summary: "A comprehensive package with advanced features to help you accelerate your growth and success.",
    includes: "All AMPLIFY Basic benefits, plus:",
    features: [
      {
        title: "Personalized Website",
        desc: "Stand out from the crowd with your own artist website, hosted on a domain you purchase with GoDaddy. Showcase your music, projects, and achievements in a professional and stylish manner.",
      },
      {
        title: "Priority Submission Opportunities",
        desc: "Get first access to exclusive licensing and collaboration opportunities, ensuring your music reaches the right ears at the right time.",
      },
      {
        title: "1-on-1 Coaching Sessions",
        desc: "Receive tailored guidance and feedback from our marketing and sync licensing specialists to maximize your music's potential.",
      },
      {
        title: "Booking Agent Services",
        desc: "We'll act as your booking agent, handling event management, show promotions, and organizing bookings to ensure you have a busy and exciting schedule.",
      },
    ],
  },
  {
    id: "elite",
    name: "ELITE",
    price: "$500",
    color: "#ff2a6d",
    tag: "MAX POWER",
    tagline: "The ultimate music career transformation.",
    stripeUrl: "https://buy.stripe.com/AMH_ELITE_LINK", // Replace with real Stripe payment link
    summary: "Opens doors to unparalleled opportunities and personalized support. Everything in Pro, and more.",
    includes: "All AMPLIFY Pro benefits, plus:",
    features: [
      {
        title: "Featured Artist Spotlight",
        desc: "Stand out from the crowd and bask in the limelight with our exclusive Featured Artist Spotlight. We'll showcase you in our newsletters, blog posts, and social media channels — gaining you visibility among industry professionals, music enthusiasts, and potential collaborators.",
      },
      {
        title: "Customized Marketing Campaign",
        desc: "Our team of experts will work closely with you to develop and execute a personalized marketing campaign that aligns with your unique brand and musical style. From captivating visuals to targeted promotions, this campaign will propel your music across various digital platforms.",
      },
      {
        title: "Premium Sync Licensing Opportunities",
        desc: "Gain access to high-value sync licensing opportunities in TV, film, commercials, and more. Imagine your music enhancing the emotions of a gripping movie scene or captivating viewers in a top-notch commercial. We'll connect you with opportunities to elevate your career to new heights.",
      },
    ],
  },
];

// ============================================================
// EXPANDABLE TIER CARD
// ============================================================
function TierSection() {
  const [expanded, setExpanded] = useState(null);

  return (
    <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionHeader label="CHOOSE YOUR PATH" title="MEMBERSHIP TIERS" />
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 20 }}>
          {TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              isOpen={expanded === tier.id}
              onToggle={() => setExpanded(expanded === tier.id ? null : tier.id)}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <span style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.2em" }}>
            ALL TIERS INCLUDE ACCESS TO THE AMH COMMUNITY · CANCEL ANYTIME
          </span>
        </div>
      </div>
    </section>
  );
}

function TierCard({ tier, isOpen, onToggle }) {
  const [hov, setHov] = useState(false);
  const { name, price, color, tag, tagline, summary, includes, features, id, stripeUrl } = tier;

  return (
    <div
      id={id}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isOpen ? `${color}06` : "rgba(10,0,16,0.9)",
        border: `1px solid ${isOpen || hov ? color : "rgba(188,19,254,0.2)"}`,
        transition: "all 0.4s ease",
        boxShadow: isOpen ? `0 0 40px ${color}22, inset 0 0 40px ${color}05` : (hov ? `0 0 20px ${color}15` : "none"),
        overflow: "hidden",
      }}
    >
      {/* Header — uniform stacked layout, clickable */}
      <div
        onClick={onToggle}
        style={{
          padding: "28px 28px 24px", cursor: "pointer",
          textAlign: "center", position: "relative",
        }}
      >
        {/* Tier name + tag row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 6 }}>
          <h3 style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(20px, 3vw, 28px)",
            letterSpacing: "0.25em", color, margin: 0,
            textShadow: isOpen ? `0 0 12px ${color}` : "none",
          }}>{name}</h3>
          {tag && (
            <span style={{
              fontSize: 8, letterSpacing: "0.2em", color,
              padding: "3px 10px", border: `1px solid ${color}44`,
              background: `${color}11`,
            }}>{tag}</span>
          )}
        </div>

        {/* Tagline */}
        <p style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.1em", margin: "0 0 16px" }}>{tagline}</p>

        {/* Price */}
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 5vw, 44px)",
            color: "#e0d0ff",
          }}>{price}</span>
          <span style={{ color: "#5b4a7a", fontSize: 13 }}>/mo</span>
        </div>

        {/* Toggle arrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: "50%",
          border: `1px solid ${color}44`,
          color, fontSize: 14,
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease",
          marginTop: 4,
        }}>▾</div>
      </div>

      {/* Expandable content */}
      <div style={{
        maxHeight: isOpen ? "2000px" : "0px",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.5s ease, opacity 0.4s ease",
      }}>
        <div style={{
          padding: "0 28px 28px",
          borderTop: `1px solid ${color}15`,
        }}>
          {/* Summary */}
          <p style={{
            color: "#a78bca", fontSize: 13, lineHeight: 1.8,
            margin: "20px 0", maxWidth: 700, textAlign: "center",
            marginLeft: "auto", marginRight: "auto",
          }}>{summary}</p>

          {/* Includes badge */}
          {includes && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{
                display: "inline-block", padding: "6px 16px",
                background: `${color}11`, border: `1px solid ${color}33`,
                fontSize: 10, letterSpacing: "0.15em", color,
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                WebkitClipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              }}>
                {includes}
              </span>
            </div>
          )}

          {/* Features grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: features.length > 3 ? "repeat(auto-fit, minmax(280px, 1fr))" : "1fr",
            gap: 16,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                padding: "16px 20px",
                background: `${color}05`,
                borderLeft: `2px solid ${color}44`,
                transition: "all 0.3s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color, fontSize: 12 }}>▸</span>
                  <h4 style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
                    letterSpacing: "0.15em", color: "#e0d0ff", margin: 0,
                  }}>{f.title}</h4>
                </div>
                <p style={{ color: "#8b7aaa", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Stripe CTA */}
          <div style={{ marginTop: 28, textAlign: "center" }}>
            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: `${color}15`,
                border: `1px solid ${color}66`, color,
                padding: "14px 40px", fontSize: 12, letterSpacing: "0.25em",
                cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                transition: "all 0.3s", textDecoration: "none",
                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                WebkitClipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                boxShadow: `0 0 20px ${color}22`,
              }}
            >
              ▶ SUBSCRIBE TO {name}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPARISON STRIP
// ============================================================
function ComparisonStrip() {
  const rows = [
    { feature: "Tone Zone Listing", basic: true, pro: true, elite: true },
    { feature: "Submission Opportunities", basic: true, pro: true, elite: true },
    { feature: "Priority Submissions", basic: false, pro: true, elite: true },
    { feature: "Personal Artist Website", basic: false, pro: true, elite: true },
    { feature: "1-on-1 Coaching", basic: false, pro: true, elite: true },
    { feature: "Tone Zone Blog Access", basic: true, pro: true, elite: true },
    { feature: "Booking Agent Services", basic: false, pro: true, elite: true },
    { feature: "Release Under AMH", basic: true, pro: true, elite: true },
    { feature: "Featured Artist Spotlight", basic: false, pro: false, elite: true },
    { feature: "Custom Marketing Campaign", basic: false, pro: false, elite: true },
    { feature: "Premium Sync Licensing", basic: false, pro: false, elite: true },
  ];

  return (
    <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionHeader label="SIDE BY SIDE" title="COMPARE TIERS" />

        <div style={{ marginTop: 48, overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: "'Share Tech Mono', monospace",
          }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: "left", color: "#5b4a7a" }}>FEATURE</th>
                <th style={{ ...thStyle, color: "#bc13fe" }}>BASIC</th>
                <th style={{ ...thStyle, color: "#00f0ff" }}>PRO</th>
                <th style={{ ...thStyle, color: "#ff2a6d" }}>ELITE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} style={{ background: i % 2 === 0 ? "rgba(188,19,254,0.02)" : "transparent" }}>
                  <td style={{ ...tdStyle, textAlign: "left", color: "#a78bca" }}>{row.feature}</td>
                  <td style={tdStyle}><Check on={row.basic} color="#bc13fe" /></td>
                  <td style={tdStyle}><Check on={row.pro} color="#00f0ff" /></td>
                  <td style={tdStyle}><Check on={row.elite} color="#ff2a6d" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const thStyle = {
  padding: "12px 8px", fontSize: 10, letterSpacing: "0.2em", textAlign: "center",
  borderBottom: "1px solid rgba(188,19,254,0.15)",
};
const tdStyle = {
  padding: "10px 8px", fontSize: 11, textAlign: "center",
  borderBottom: "1px solid rgba(188,19,254,0.06)",
};

function Check({ on, color }) {
  return on
    ? <span style={{ color, fontSize: 14, filter: `drop-shadow(0 0 4px ${color})`, WebkitFilter: `drop-shadow(0 0 4px ${color})` }}>✓</span>
    : <span style={{ color: "#2d1b4e", fontSize: 12 }}>—</span>;
}

// ============================================================
// BOTTOM CTA
// ============================================================
function BottomCTA() {
  return (
    <section style={{ padding: "60px 24px 80px", position: "relative", zIndex: 2 }}>
      <div style={{
        maxWidth: 700, margin: "0 auto", textAlign: "center",
        padding: "48px 32px",
        background: "rgba(10,0,16,0.85)",
        border: "1px solid rgba(188,19,254,0.2)",
        clipPath: "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)",
        WebkitClipPath: "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#5b4a7a", marginBottom: 12 }}>READY?</div>
        <h2 style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(22px, 4vw, 34px)",
          color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: "0 0 16px",
          textShadow: "0 0 15px rgba(188,19,254,0.3)",
        }}>START YOUR AMPLIFY JOURNEY</h2>
        <p style={{ color: "#8b7aaa", fontSize: 12, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 28px" }}>
          No fake followers. No bots. Just real strategy, real connections,
          and real results for your music career.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/contact" style={{
            display: "inline-block", background: "linear-gradient(135deg, #711c91aa, #bc13feaa)",
            border: "1px solid #bc13fe", color: "#e0d0ff",
            padding: "14px 32px", fontSize: 12, letterSpacing: "0.2em",
            textDecoration: "none", fontFamily: "'Share Tech Mono', monospace",
            clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            WebkitClipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            transition: "all 0.3s",
          }}>
            ▶ GET STARTED
          </a>
          <a href="/" style={{
            display: "inline-block", background: "transparent",
            border: "1px solid rgba(188,19,254,0.4)", color: "#8b7aaa",
            padding: "14px 32px", fontSize: 12, letterSpacing: "0.2em",
            textDecoration: "none", fontFamily: "'Share Tech Mono', monospace",
            clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            WebkitClipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            transition: "all 0.3s",
          }}>
            ⌂ BACK TO HOME
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER (same as homepage)
// ============================================================
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
              {col.links.map(l => (<a key={l.label} href={l.href} style={{ display: "block", color: "#8b7aaa", fontSize: 12, textDecoration: "none", padding: "5px 0", letterSpacing: "0.05em" }}>{l.label}</a>))}
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
          {["Privacy", "Terms", "Refunds"].map(l => (<a key={l} href={`/${l.toLowerCase()}`} style={{ color: "#3d2060", fontSize: 10, letterSpacing: "0.1em", textDecoration: "none" }}>{l}</a>))}
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AmplifyPage() {
  return (
    <div style={{
      background: "#0a0a0f", color: "#e0d0ff",
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      minHeight: "100vh", position: "relative", overflowX: "hidden",
    }}>
      {/* Background layers */}
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

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <AmplifyHero />
        <AboutAmplifySection />
        <TierSection />
        <ComparisonStrip />
        <BottomCTA />
        <Footer />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.45} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body { background: #0a0a0f; -webkit-font-smoothing: antialiased; }
        img { max-width: 100%; height: auto; }
        a:hover { color: #bc13fe !important; }
        table { min-width: 500px; }

        @media (max-width: 768px) {
          section { text-align: center !important; }
          section h3, section p { text-align: center !important; }
          section > div[style*="grid"] {
            grid-template-columns: 1fr !important;
            max-width: 400px;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          footer > div { text-align: center !important; }
          footer > div > div { text-align: center !important; align-items: center !important; }
          footer > div:last-child { justify-content: center !important; text-align: center !important; }
          footer > div:last-child > div { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
