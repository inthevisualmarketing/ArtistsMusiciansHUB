"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// AMH ABOUT US PAGE — PlayStation × Cyberpunk HUD
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

function CyberFrame({ children, style: extra = {} }) {
  return (
    <div style={{ position: "relative", padding: 20, ...extra }}>
      <div style={{ position:"absolute",top:0,left:0,width:20,height:20,borderTop:"2px solid #bc13fe",borderLeft:"2px solid #bc13fe",opacity:0.6 }} />
      <div style={{ position:"absolute",top:0,right:0,width:20,height:20,borderTop:"2px solid #bc13fe",borderRight:"2px solid #bc13fe",opacity:0.6 }} />
      <div style={{ position:"absolute",bottom:0,left:0,width:20,height:20,borderBottom:"2px solid #bc13fe",borderLeft:"2px solid #bc13fe",opacity:0.6 }} />
      <div style={{ position:"absolute",bottom:0,right:0,width:20,height:20,borderBottom:"2px solid #bc13fe",borderRight:"2px solid #bc13fe",opacity:0.6 }} />
      {children}
    </div>
  );
}

// ============================================================
// HERO
// ============================================================
function AboutHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);
  return (
    <section style={{
      minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "120px 24px 40px",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease",
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>SINCE 2018 · SAN ANTONIO TX</div>
      <h1 style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 7vw, 64px)",
        color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: 0, lineHeight: 1.1,
        textShadow: "0 0 20px rgba(188,19,254,0.5), 0 0 60px rgba(188,19,254,0.2)",
      }}>
        OUR <span style={{ color: "#bc13fe", textShadow: "0 0 20px #bc13fe" }}>STORY</span>
      </h1>
      <p style={{ color: "#8b7aaa", fontSize: "clamp(12px, 1.6vw, 15px)", letterSpacing: "0.15em", maxWidth: 580, margin: "20px 0 0", lineHeight: 1.8 }}>
        Building careers. Amplifying voices. Connecting artists
        with the world — one stream at a time.
      </p>
    </section>
  );
}

// ============================================================
// MISSION
// ============================================================
function MissionSection() {
  return (
    <section style={{ padding: "60px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionHeader label="THE MISSION" title="WHO WE ARE" />
        <div style={{ marginTop: 48 }}>
          <CyberFrame style={{ background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.15)" }}>
            <div style={{ padding: "12px 8px", textAlign: "center" }}>
              <p style={{ color: "#e0d0ff", fontSize: 14, lineHeight: 1.8, margin: "0 0 20px" }}>
                The Artists Musicians HUB is a marketing and distribution agency for musical artists, creatives, and focused entities. Our mission is to give a platform for creatives from all over the world and all musical genres.
              </p>
              <p style={{ color: "#a78bca", fontSize: 13, lineHeight: 1.8, margin: "0 0 16px" }}>
                We have surpassed 1 million streams for our artists and performers. We have professionals in Photography, Marketing, Videography, and Public Relations. Our platform facilitates the development of artists and musicians at all stages of their careers.
              </p>
              <p style={{ color: "#a78bca", fontSize: 13, lineHeight: 1.8, margin: "0 0 16px" }}>
                Additionally, we specialize in all things digital including the creation of complete ad campaigns on Facebook, Google, Bing, and Yahoo. We recognize the significance of fostering strong relationships and providing your audience with the most effective material to communicate your ideas.
              </p>
              <p style={{ color: "#a78bca", fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                Globally, we offer customized marketing services to small enterprises, individuals, and corporations.
              </p>
            </div>
          </CyberFrame>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// STATS
// ============================================================
function StatsSection() {
  return (
    <section style={{ padding: "60px 24px", position: "relative", zIndex: 2 }}>
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "40px 32px", textAlign: "center",
        background: "rgba(10,0,16,0.8)", border: "1px solid rgba(188,19,254,0.15)",
        clipPath: "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)",
        WebkitClipPath: "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#5b4a7a", marginBottom: 28 }}>PERFORMANCE METRICS</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 56px)", flexWrap: "wrap" }}>
          {[
            { val: "1M+", label: "STREAMS", color: "#bc13fe" },
            { val: "3.9M", label: "IMPRESSIONS", color: "#00f0ff" },
            { val: "3.5M", label: "REACH", color: "#ff2a6d" },
            { val: "5.0", label: "STAR REVIEWS", color: "#f5f500" },
            { val: "7+", label: "YEARS", color: "#bc13fe" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 4vw, 40px)", color, textShadow: `0 0 15px ${color}66`, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", marginTop: 8 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// WHY CHOOSE US
// ============================================================
function WhyChooseSection() {
  const reasons = [
    { icon: "▲", title: "100% ORGANIC GROWTH", desc: "No bots, no fake followers. Every stream, every follower is real.", color: "#bc13fe" },
    { icon: "◈", title: "#1 MUSIC MARKETING", desc: "International agency with competitive prices and friendly service.", color: "#00f0ff" },
    { icon: "✦", title: "CERTIFIED EXPERTS", desc: "Professionals in marketing, photography, videography, and PR.", color: "#ff2a6d" },
    { icon: "♫", title: "REPEAT CLIENTS", desc: "Excellent feedback and many artists return for ongoing campaigns.", color: "#f5f500" },
  ];

  return (
    <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionHeader label="THE DIFFERENCE" title="WHY CHOOSE US" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 48 }}>
          {reasons.map(r => (
            <WhyCard key={r.title} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyCard({ icon, title, desc, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(188,19,254,0.06)" : "rgba(10,0,16,0.8)",
        border: `1px solid ${hov ? color + "55" : "rgba(188,19,254,0.15)"}`,
        padding: "24px 20px", textAlign: "center", cursor: "default",
        transition: "all 0.4s ease",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 0 25px ${color}22` : "none",
      }}
    >
      <div style={{ fontSize: 24, color, marginBottom: 12, filter: `drop-shadow(0 0 6px ${color})`, WebkitFilter: `drop-shadow(0 0 6px ${color})` }}>{icon}</div>
      <h3 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: hov ? color : "#e0d0ff", margin: "0 0 10px", transition: "color 0.3s" }}>{title}</h3>
      <p style={{ color: "#8b7aaa", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ============================================================
// TEAM
// ============================================================
const TEAM = [
  { name: "Markell Holland", role: "CEO / Owner", color: "#bc13fe", icon: "👑" },
  { name: "Oh It's Chris", role: "Producer", color: "#00f0ff", icon: "🎹" },
  { name: "PRXJEKT", role: "Producer / Engineer", color: "#ff2a6d", icon: "🎛️" },
  { name: "JusDeno", role: "Producer / Engineer", color: "#bc13fe", icon: "🎧" },
  { name: "Deacon Rap", role: "Producer / Engineer / DJ", color: "#ff2a6d", icon: "💿" },
];

function TeamSection() {
  return (
    <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <SectionHeader label="THE CREW" title="MEET THE TEAM" />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, marginTop: 48 }}>
          {TEAM.map(member => (
            <TeamCard key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ name, role, color, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 150, textAlign: "center", cursor: "default",
        transition: "all 0.4s ease",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
      }}
    >
      {/* Hex avatar */}
      <div style={{
        width: 100, height: 100, margin: "0 auto 12px",
        background: hov ? `linear-gradient(135deg, #00f0ff, ${color})` : `linear-gradient(135deg, ${color}44, ${color}18)`,
        clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        WebkitClipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.4s ease",
        boxShadow: hov ? `0 0 25px ${color}55` : "none",
      }}>
        <div style={{
          width: 92, height: 92,
          background: hov ? "linear-gradient(135deg, #1a0533, #2d1b4e)" : "#0d0221",
          clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          WebkitClipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, transition: "all 0.4s",
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, letterSpacing: "0.1em", color: hov ? color : "#e0d0ff", transition: "color 0.3s", marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#5b4a7a" }}>{role}</div>
    </div>
  );
}

// ============================================================
// CTA
// ============================================================
function AboutCTA() {
  return (
    <section style={{ padding: "60px 24px 80px", position: "relative", zIndex: 2 }}>
      <div style={{
        maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "40px 28px",
        background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.2)",
        clipPath: "polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)",
        WebkitClipPath: "polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#5b4a7a", marginBottom: 12 }}>READY TO JOIN?</div>
        <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(20px, 4vw, 30px)", color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: "0 0 12px", textShadow: "0 0 15px rgba(188,19,254,0.3)" }}>WORK WITH US</h2>
        <p style={{ color: "#8b7aaa", fontSize: 12, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 24px" }}>
          Whether you're an artist ready to amplify or a creative looking to collaborate — let's connect.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/amplify" style={{ display: "inline-block", background: "linear-gradient(135deg, #711c91aa, #bc13feaa)", border: "1px solid #bc13fe", color: "#e0d0ff", padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", fontFamily: "'Share Tech Mono', monospace", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", transition: "all 0.3s" }}>▲ EXPLORE AMPLIFY</a>
          <a href="/contact" style={{ display: "inline-block", background: "transparent", border: "1px solid rgba(188,19,254,0.4)", color: "#8b7aaa", padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", fontFamily: "'Share Tech Mono', monospace", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", transition: "all 0.3s" }}>✦ CONTACT US</a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
const FOOTER_NAV = [
  { section: "NAVIGATE", links: [{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Services", href: "/services" }] },
  { section: "PROGRAMS", links: [{ label: "AMPLIFY", href: "/amplify" }, { label: "Tone Zone", href: "/news" }, { label: "Submit Content", href: "/submit" }] },
  { section: "CONNECT", links: [{ label: "Contact", href: "/contact" }, { label: "Blog", href: "/blog" }, { label: "Shop", href: "/shop" }] },
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
export default function AboutPage() {
  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />
      <div style={{ position: "relative", zIndex: 2 }}>
        <AboutHero />
        <MissionSection />
        <StatsSection />
        <WhyChooseSection />
        <TeamSection />
        <AboutCTA />
        <Footer />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.45} 50%{opacity:1} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body { background: #0a0a0f; -webkit-font-smoothing: antialiased; }
        img { max-width: 100%; height: auto; }
        a:hover { color: #bc13fe !important; }
        @media (max-width: 768px) {
          section { text-align: center !important; }
          section h3, section p { text-align: center !important; }
          section > div[style*="grid"] { grid-template-columns: 1fr !important; max-width: 360px; margin-left: auto !important; margin-right: auto !important; }
          footer > div { text-align: center !important; }
          footer > div > div { text-align: center !important; align-items: center !important; }
          footer > div:last-child { justify-content: center !important; text-align: center !important; }
          footer > div:last-child > div { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
