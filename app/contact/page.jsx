"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// AMH CONTACT PAGE — PlayStation × Cyberpunk HUD
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
    let animId, pulses = [], nextId = 0;
    const occupied = new Map();
    const COLORS = ["188,19,254", "188,19,254", "0,240,255", "255,42,109"];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    function pickDir(c, r, a, cs, rs) { const d = [{ dc:1,dr:0 },{ dc:-1,dr:0 },{ dc:0,dr:1 },{ dc:0,dr:-1 }]; const v = d.filter(x => { const nc=c+x.dc,nr=r+x.dr; return nc>=0&&nc<=cs&&nr>=0&&nr<=rs; }); const p = a ? v.filter(x => !(x.dc===a.dc&&x.dr===a.dr)) : v; return (p.length?p:v)[Math.floor(Math.random()*(p.length||v.length))]; }
    function createPulse() { const cs=Math.floor(canvas.width/GRID_SIZE),rs=Math.floor(canvas.height/GRID_SIZE); return { id:nextId++,color:COLORS[Math.floor(Math.random()*COLORS.length)],col:Math.floor(Math.random()*cs),row:Math.floor(Math.random()*rs),dir:pickDir(0,0,null,cs,rs),t:0,speed:0.003+Math.random()*0.003,trailLength:3+Math.floor(Math.random()*3),alpha:0.12+Math.random()*0.1,trail:[],done:false,_steps:0,cols:cs,rows:rs }; }
    pulses.push(createPulse()); setTimeout(() => { if(pulses.filter(p=>!p.done).length<2) pulses.push(createPulse()); }, 2400);
    function maybeRespawn() { if(pulses.filter(p=>!p.done).length<2) pulses.push(createPulse()); }
    function draw() { ctx.clearRect(0,0,canvas.width,canvas.height); pulses.forEach(p => { if(p.done) return; const px=p.col*GRID_SIZE+p.dir.dc*GRID_SIZE*p.t,py=p.row*GRID_SIZE+p.dir.dr*GRID_SIZE*p.t; p.trail.push({x:px,y:py}); if(p.trail.length>p.trailLength*18) p.trail.shift(); p.t+=p.speed; if(p.t>=1){ p.t=0;p.col+=p.dir.dc;p.row+=p.dir.dr; if(p.col<=0||p.col>=p.cols){p.dir={dc:-p.dir.dc,dr:p.dir.dr};p.col=Math.max(0,Math.min(p.cols,p.col));} if(p.row<=0||p.row>=p.rows){p.dir={dc:p.dir.dc,dr:-p.dir.dr};p.row=Math.max(0,Math.min(p.rows,p.row));} const k=`${p.col},${p.row}`,o=occupied.get(k); if(o!==undefined&&o!==p.id){const ot=pulses.find(q=>q.id===o&&!q.done);if(ot){p.dir=pickDir(p.col,p.row,p.dir,p.cols,p.rows);ot.dir=pickDir(ot.col,ot.row,ot.dir,ot.cols,ot.rows);}} occupied.set(k,p.id); if(Math.random()<0.08)p.dir=pickDir(p.col,p.row,p.dir,p.cols,p.rows); p._steps++;if(p._steps>600){p.done=true;setTimeout(maybeRespawn,800+Math.random()*1200);} } if(p.trail.length<2)return; for(let i=1;i<p.trail.length;i++){const a=p.trail[i-1],b=p.trail[i],pr=i/p.trail.length; ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(${p.color},${pr*p.alpha*0.35})`;ctx.lineWidth=4;ctx.lineCap="round";ctx.stroke(); ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(${p.color},${pr*p.alpha})`;ctx.lineWidth=1;ctx.stroke();} const h=p.trail[p.trail.length-1]; if(h){const g=ctx.createRadialGradient(h.x,h.y,0,h.x,h.y,5);g.addColorStop(0,`rgba(${p.color},${p.alpha*1.4})`);g.addColorStop(1,`rgba(${p.color},0)`);ctx.beginPath();ctx.arc(h.x,h.y,5,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();} }); pulses=pulses.filter(p=>!p.done); animId=requestAnimationFrame(draw); }
    draw(); return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed",top:0,right:0,bottom:0,left:0,pointerEvents:"none",zIndex:0 }} />;
}

function SectionHeader({ label, title }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>{label}</div>
      <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 5vw, 42px)", letterSpacing: "0.2em", color: "#e0d0ff", margin: 0, fontWeight: 400, textShadow: "0 0 15px rgba(188,19,254,0.3)" }}>{title}</h2>
      <div style={{ height: 2, width: 60, margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)", boxShadow: "0 0 10px rgba(188,19,254,0.5)" }} />
    </div>
  );
}

// ============================================================
// HERO
// ============================================================
function ContactHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);
  return (
    <section style={{
      minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "120px 24px 20px",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease",
    }}>
      {/* Animated signal icon */}
      <div style={{ marginBottom: 20, filter: "drop-shadow(0 0 10px rgba(0,240,255,0.5))", WebkitFilter: "drop-shadow(0 0 10px rgba(0,240,255,0.5))" }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ overflow: "visible" }}>
          {/* Envelope */}
          <rect x="6" y="14" width="40" height="26" rx="2" stroke="#00f0ff" strokeWidth="1.5" fill="rgba(0,240,255,0.05)" />
          <polyline points="6,14 26,30 46,14" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
          {/* Signal arcs above */}
          <path d="M20 10 A8 8 0 0 1 32 10" stroke="#00f0ff" strokeWidth="1" fill="none" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M16 6 A13 13 0 0 1 36 6" stroke="#00f0ff" strokeWidth="0.8" fill="none" opacity="0">
            <animate attributeName="opacity" values="0;0.4;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
          </path>
          <path d="M12 2 A18 18 0 0 1 40 2" stroke="#00f0ff" strokeWidth="0.5" fill="none" opacity="0">
            <animate attributeName="opacity" values="0;0.2;0" dur="2s" begin="0.8s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>OPEN CHANNEL</div>
      <h1 style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 7vw, 60px)",
        color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: 0, lineHeight: 1.1,
        textShadow: "0 0 20px rgba(188,19,254,0.5)",
      }}>
        GET IN <span style={{ color: "#00f0ff", textShadow: "0 0 20px #00f0ff" }}>TOUCH</span>
      </h1>
      <p style={{ color: "#8b7aaa", fontSize: "clamp(12px, 1.6vw, 14px)", letterSpacing: "0.15em", maxWidth: 480, margin: "16px 0 0", lineHeight: 1.8 }}>
        Ready to amplify? Have a question? Drop us a transmission.
      </p>
    </section>
  );
}

// ============================================================
// CONTACT FORM + INFO
// ============================================================
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus("error"); setStatusMsg("FILL ALL REQUIRED FIELDS"); return;
    }
    if (!form.email.includes("@")) {
      setStatus("error"); setStatusMsg("INVALID EMAIL FORMAT"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success"); setStatusMsg("TRANSMISSION RECEIVED");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error"); setStatusMsg("TRANSMISSION FAILED — TRY AGAIN");
      }
    } catch {
      setStatus("error"); setStatusMsg("CONNECTION ERROR — TRY AGAIN");
    }
  };

  // Success state — full replacement of form
  if (status === "success") {
    return (
      <section style={{ padding: "40px 24px 80px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "rgba(10,0,16,0.9)", border: "1px solid rgba(0,240,255,0.25)",
            padding: "48px 32px",
            clipPath: "polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)",
            WebkitClipPath: "polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)",
          }}>
            {/* Animated checkmark */}
            <div style={{ marginBottom: 20 }}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="24" stroke="#00f0ff" strokeWidth="1.5" fill="rgba(0,240,255,0.05)" />
                <polyline points="17,28 25,36 39,20" stroke="#00f0ff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" fill="freeze" />
                  <animate attributeName="stroke-dasharray" from="0 40" to="40 0" dur="0.6s" fill="freeze" />
                </polyline>
                <circle cx="28" cy="28" r="24" stroke="#00f0ff" strokeWidth="0.5" fill="none" opacity="0">
                  <animate attributeName="r" values="24;32" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#00f0ff", marginBottom: 12 }}>TRANSMISSION RECEIVED</div>

            <h2 style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(18px, 3vw, 24px)",
              color: "#e0d0ff", letterSpacing: "0.15em", fontWeight: 400, margin: "0 0 16px",
            }}>
              MESSAGE DELIVERED
            </h2>

            <p style={{ color: "#a78bca", fontSize: 13, lineHeight: 1.8, margin: "0 0 8px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              We've received your message and sent a confirmation to your email. Our team will get back to you within 24-48 hours.
            </p>

            <p style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.1em", margin: "0 0 28px" }}>
              Check your inbox for our confirmation.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => { setStatus("idle"); setStatusMsg(""); }}
                style={{
                  background: "rgba(0,240,255,0.1)", border: "1px solid #00f0ff66",
                  color: "#00f0ff", padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em",
                  cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", transition: "all 0.3s",
                  clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                }}
              >
                SEND ANOTHER
              </button>
              <a
                href="/"
                style={{
                  display: "inline-block", background: "transparent",
                  border: "1px solid rgba(188,19,254,0.4)", color: "#8b7aaa",
                  padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em",
                  textDecoration: "none", fontFamily: "'Share Tech Mono', monospace", transition: "all 0.3s",
                  clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                }}
              >
                ⌂ BACK HOME
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "40px 24px 80px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* FORM */}
        <div style={{
          background: "rgba(10,0,16,0.9)", border: "1px solid rgba(188,19,254,0.2)",
          padding: "32px 28px", marginBottom: 32,
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#bc13fe", marginBottom: 24, fontFamily: "'Share Tech Mono', monospace", textAlign: "center" }}>
            SEND TRANSMISSION
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormField label="NAME *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Your name" />
              <FormField label="EMAIL *" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="your@email.com" type="email" />
            </div>
            <FormField label="SUBJECT" value={form.subject} onChange={v => setForm({ ...form, subject: v })} placeholder="What's this about?" />
            <div>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.25em", color: "#5b4a7a", marginBottom: 6 }}>MESSAGE *</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what you need..."
                rows={5}
                style={{
                  width: "100%", background: "rgba(188,19,254,0.03)",
                  border: "1px solid rgba(188,19,254,0.2)", color: "#e0d0ff",
                  padding: "12px 14px", fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.03em", resize: "vertical", transition: "all 0.2s", outline: "none",
                }}
                onFocus={e => { e.target.style.borderColor = "#bc13fe"; e.target.style.boxShadow = "0 0 12px rgba(188,19,254,0.2)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(188,19,254,0.2)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                style={{
                  background: "rgba(188,19,254,0.1)",
                  border: "1px solid #bc13fe",
                  color: "#bc13fe",
                  padding: "14px 40px", fontSize: 12, letterSpacing: "0.25em",
                  cursor: status === "loading" ? "default" : "pointer",
                  fontFamily: "'Share Tech Mono', monospace", transition: "all 0.3s",
                  clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                  WebkitClipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "TRANSMITTING..." : "▶ TRANSMIT"}
              </button>
            </div>

            {statusMsg && status === "error" && (
              <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#ff2a6d", margin: 0, textAlign: "center" }}>
                {statusMsg}
              </p>
            )}
          </div>
        </div>

        {/* DIRECT CHANNELS — centered row */}
        <div className="direct-channels" style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center",
        }}>
          <DirectCard icon="✆" label="PHONE" value="(210) 891-4991" href="tel:+12108914991" color="#bc13fe" />
          <DirectCard icon="✉" label="EMAIL" value="artists.musicians.hub@gmail.com" href="mailto:artists.musicians.hub@gmail.com" color="#00f0ff" />
          <DirectCard icon="◈" label="LOCATION" value="San Antonio, Texas" href={null} color="#ff2a6d" />
        </div>

        {/* Response time note */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.15em" }}>
            WE TYPICALLY RESPOND WITHIN 24-48 HOURS
          </span>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 9, letterSpacing: "0.25em", color: "#5b4a7a", marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", background: "rgba(188,19,254,0.03)",
          border: "1px solid rgba(188,19,254,0.2)", color: "#e0d0ff",
          padding: "12px 14px", fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
          letterSpacing: "0.03em", transition: "all 0.2s", outline: "none",
        }}
        onFocus={e => { e.target.style.borderColor = "#bc13fe"; e.target.style.boxShadow = "0 0 12px rgba(188,19,254,0.2)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(188,19,254,0.2)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function DirectCard({ icon, label, value, href, color }) {
  const [hov, setHov] = useState(false);
  const inner = (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}08` : "rgba(10,0,16,0.9)",
        border: `1px solid ${hov ? color + "44" : "rgba(188,19,254,0.15)"}`,
        padding: "24px 16px", textAlign: "center",
        transition: "all 0.3s ease", cursor: href ? "pointer" : "default",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov ? `0 0 20px ${color}15` : "none",
      }}
    >
      <div style={{ fontSize: 22, color, marginBottom: 10, filter: `drop-shadow(0 0 6px ${color})`, WebkitFilter: `drop-shadow(0 0 6px ${color})` }}>{icon}</div>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#5b4a7a", marginBottom: 6 }}>{label}</div>
      <div style={{ color: hov ? color : "#e0d0ff", fontSize: 11, letterSpacing: "0.03em", wordBreak: "break-all", transition: "color 0.3s", lineHeight: 1.4 }}>{value}</div>
    </div>
  );
  if (href) return <a href={href} style={{ textDecoration: "none" }}>{inner}</a>;
  return inner;
}

// ============================================================
// FOOTER
// ============================================================
const FOOTER_NAV = [
  { section: "NAVIGATE", links: [{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Services", href: "/services" }] },
  { section: "PROGRAMS", links: [{ label: "AMPLIFY", href: "/amplify" }, { label: "Tone Zone", href: "/news" }, { label: "Blog", href: "/blog" }] },
  { section: "COMMUNITY", links: [{ label: "Ambassadors", href: "/ambassadors" }, { label: "Shop", href: "/shop" }, { label: "Contact", href: "/contact" }] },
];
const SOCIALS = [{ label: "IG", icon: "◉", href: "#" }, { label: "YT", icon: "▶", href: "#" }, { label: "SP", icon: "●", href: "#" }, { label: "TW", icon: "◆", href: "#" }];

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
// MAIN
// ============================================================
export default function ContactPage() {
  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />
      <div style={{ position: "relative", zIndex: 2 }}>
        <ContactHero />
        <ContactSection />
        <Footer />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body { background: #0a0a0f; -webkit-font-smoothing: antialiased; }
        img { max-width: 100%; height: auto; }
        a:hover { color: #bc13fe !important; }
        input::placeholder, textarea::placeholder { color: #3d2060 !important; }
        input:focus, textarea:focus { outline: none; }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
        button:disabled { cursor: default !important; }

        @media (max-width: 768px) {
          section { text-align: center !important; }
          /* Stack form name/email fields */
          .form-row { grid-template-columns: 1fr !important; }
          /* Stack direct channel cards */
          .direct-channels {
            grid-template-columns: 1fr !important;
            max-width: 340px;
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
