"use client";
import { useState, useEffect, useRef } from "react";

const LOGO_URL = "https://res.cloudinary.com/dbpremci4/image/upload/w_200,h_200,c_fit/white-hub-logo-transparent";
const GRID_SIZE = 40;

function ElectricGrid() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); let animId, pulses = [], nextId = 0;
    const occupied = new Map(); const COLORS = ["188,19,254","188,19,254","0,240,255","255,42,109"];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    function pickDir(c,r,a,cs,rs){const d=[{dc:1,dr:0},{dc:-1,dr:0},{dc:0,dr:1},{dc:0,dr:-1}];const v=d.filter(x=>{const nc=c+x.dc,nr=r+x.dr;return nc>=0&&nc<=cs&&nr>=0&&nr<=rs;});const p=a?v.filter(x=>!(x.dc===a.dc&&x.dr===a.dr)):v;return(p.length?p:v)[Math.floor(Math.random()*(p.length||v.length))];}
    function createPulse(){const cs=Math.floor(canvas.width/GRID_SIZE),rs=Math.floor(canvas.height/GRID_SIZE);return{id:nextId++,color:COLORS[Math.floor(Math.random()*COLORS.length)],col:Math.floor(Math.random()*cs),row:Math.floor(Math.random()*rs),dir:pickDir(0,0,null,cs,rs),t:0,speed:0.003+Math.random()*0.003,trailLength:3+Math.floor(Math.random()*3),alpha:0.12+Math.random()*0.1,trail:[],done:false,_steps:0,cols:cs,rows:rs};}
    pulses.push(createPulse());setTimeout(()=>{if(pulses.filter(p=>!p.done).length<2)pulses.push(createPulse());},2400);
    function maybeRespawn(){if(pulses.filter(p=>!p.done).length<2)pulses.push(createPulse());}
    function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);pulses.forEach(p=>{if(p.done)return;const px=p.col*GRID_SIZE+p.dir.dc*GRID_SIZE*p.t,py=p.row*GRID_SIZE+p.dir.dr*GRID_SIZE*p.t;p.trail.push({x:px,y:py});if(p.trail.length>p.trailLength*18)p.trail.shift();p.t+=p.speed;if(p.t>=1){p.t=0;p.col+=p.dir.dc;p.row+=p.dir.dr;if(p.col<=0||p.col>=p.cols){p.dir={dc:-p.dir.dc,dr:p.dir.dr};p.col=Math.max(0,Math.min(p.cols,p.col));}if(p.row<=0||p.row>=p.rows){p.dir={dc:p.dir.dc,dr:-p.dir.dr};p.row=Math.max(0,Math.min(p.rows,p.row));}const k=`${p.col},${p.row}`,o=occupied.get(k);if(o!==undefined&&o!==p.id){const ot=pulses.find(q=>q.id===o&&!q.done);if(ot){p.dir=pickDir(p.col,p.row,p.dir,p.cols,p.rows);ot.dir=pickDir(ot.col,ot.row,ot.dir,ot.cols,ot.rows);}}occupied.set(k,p.id);if(Math.random()<0.08)p.dir=pickDir(p.col,p.row,p.dir,p.cols,p.rows);p._steps++;if(p._steps>600){p.done=true;setTimeout(maybeRespawn,800+Math.random()*1200);}}if(p.trail.length<2)return;for(let i=1;i<p.trail.length;i++){const a=p.trail[i-1],b=p.trail[i],pr=i/p.trail.length;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(${p.color},${pr*p.alpha*0.35})`;ctx.lineWidth=4;ctx.lineCap="round";ctx.stroke();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(${p.color},${pr*p.alpha})`;ctx.lineWidth=1;ctx.stroke();}const h=p.trail[p.trail.length-1];if(h){const g=ctx.createRadialGradient(h.x,h.y,0,h.x,h.y,5);g.addColorStop(0,`rgba(${p.color},${p.alpha*1.4})`);g.addColorStop(1,`rgba(${p.color},0)`);ctx.beginPath();ctx.arc(h.x,h.y,5,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();}});pulses=pulses.filter(p=>!p.done);animId=requestAnimationFrame(draw);}
    draw();return()=>{cancelAnimationFrame(animId);window.removeEventListener("resize",resize);};
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}} />;
}

const PERKS = [
  { icon: "◈", title: "REFERRAL COMMISSION", desc: "Earn commission every time someone signs up for AMPLIFY through your unique link. Real money for real impact.", color: "#00f0ff" },
  { icon: "▲", title: "EARLY ACCESS", desc: "Be the first to know about AMH events, artist releases, and platform features before anyone else.", color: "#bc13fe" },
  { icon: "✦", title: "DISCOUNT CODES", desc: "Get exclusive promo codes to share with your followers — they save, you build your rep as a tastemaker.", color: "#ff2a6d" },
  { icon: "◎", title: "COMMUNITY", desc: "Join a network of creatives repping the 210's music scene. Collaboration, connection, and culture.", color: "#f5f500" },
];

const GALLERY_IMAGES = [
  "https://irp.cdn-website.com/md/pexels/dms3rep/multi/pexels-photo-2072454.jpeg",
  "https://irp.cdn-website.com/md/pexels/dms3rep/multi/pexels-photo-2363821.jpeg",
  "https://irp.cdn-website.com/md/pexels/dms3rep/multi/pexels-photo-14565976.jpeg",
  "https://irp.cdn-website.com/md/pexels/dms3rep/multi/pexels-photo-2406549.jpeg",
];

// ============================================================
// PERK CARD
// ============================================================
function PerkCard({ icon, title, desc, color, index }) {
  const [hov, setHov] = useState(false);
  const delay = index * 0.1;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}08` : "rgba(10,0,16,0.85)",
        border: `1px solid ${hov ? color + "44" : "rgba(188,19,254,0.12)"}`,
        padding: "28px 24px", textAlign: "center",
        transition: "all 0.35s ease",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? `0 0 25px ${color}18` : "none",
        animation: `cardFadeIn 0.5s ${delay}s ease-out both`, opacity: 0,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Corner accents */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}`, opacity: hov ? 0.6 : 0.15, transition: "opacity 0.3s" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}`, opacity: hov ? 0.6 : 0.15, transition: "opacity 0.3s" }} />

      <div style={{ fontSize: 28, color, marginBottom: 16, filter: `drop-shadow(0 0 8px ${color}55)`, transition: "all 0.3s" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, letterSpacing: "0.15em", color: "#ffffff", margin: "0 0 12px", fontWeight: 400 }}>{title}</h3>
      <p style={{ fontSize: 12, color: "#8b7aaa", lineHeight: 1.7, margin: 0 }}>{desc}</p>
      <div style={{ height: 1, marginTop: 16, background: hov ? `linear-gradient(90deg, transparent, ${color}, transparent)` : "linear-gradient(90deg, transparent, rgba(188,19,254,0.08), transparent)", transition: "all 0.3s" }} />
    </div>
  );
}

// ============================================================
// APPLICATION FORM
// ============================================================
function AmbassadorForm() {
  const [form, setForm] = useState({ name: "", email: "", socials: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.socials.trim()) {
      setStatus("error"); setStatusMsg("PLEASE FILL IN ALL REQUIRED FIELDS"); return;
    }
    if (!form.email.includes("@")) {
      setStatus("error"); setStatusMsg("INVALID EMAIL FORMAT"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: "Brand Ambassador Application",
          message: `BRAND AMBASSADOR APPLICATION\n\nName: ${form.name}\nEmail: ${form.email}\nSocial Media: ${form.socials}\n\nWhy I want to join:\n${form.message || "Not provided"}`,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setStatusMsg("APPLICATION RECEIVED — WE'LL BE IN TOUCH");
        setForm({ name: "", email: "", socials: "", message: "" });
      } else {
        setStatus("error"); setStatusMsg("TRANSMISSION FAILED — TRY AGAIN");
      }
    } catch {
      setStatus("error"); setStatusMsg("CONNECTION ERROR — TRY AGAIN");
    }
  };

  const inputStyle = {
    width: "100%", background: "rgba(188,19,254,0.03)", border: "1px solid rgba(188,19,254,0.2)",
    color: "#e0d0ff", padding: "12px 16px", fontSize: 13, fontFamily: "'Share Tech Mono', monospace",
    letterSpacing: "0.03em", transition: "all 0.2s",
  };

  return (
    <div style={{
      maxWidth: 600, margin: "0 auto", padding: "32px 24px",
      background: "rgba(10,0,16,0.9)", border: "1px solid rgba(188,19,254,0.15)",
      boxShadow: "0 0 40px rgba(188,19,254,0.08)",
    }}>
      <h3 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 16, letterSpacing: "0.2em", color: "#ffffff", textAlign: "center", margin: "0 0 8px", fontWeight: 400 }}>
        APPLY NOW
      </h3>
      <div style={{ height: 2, width: 40, margin: "0 auto 28px", background: "linear-gradient(90deg, transparent, #bc13fe, transparent)", boxShadow: "0 0 8px rgba(188,19,254,0.4)" }} />

      {status === "success" ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 40, color: "#00f0ff", marginBottom: 16, textShadow: "0 0 20px #00f0ff" }}>✓</div>
          <p style={{ color: "#00f0ff", fontSize: 13, letterSpacing: "0.15em", textShadow: "0 0 8px rgba(0,240,255,0.3)" }}>{statusMsg}</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", display: "block", marginBottom: 6 }}>NAME *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", display: "block", marginBottom: 6 }}>EMAIL *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", display: "block", marginBottom: 6 }}>SOCIAL MEDIA @ HANDLES *</label>
              <input value={form.socials} onChange={e => setForm(f => ({ ...f, socials: e.target.value }))} placeholder="@instagram, @twitter, @tiktok" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", display: "block", marginBottom: 6 }}>HOW WILL OUR PROGRAM BENEFIT FROM YOU JOINING?</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us about yourself and why you'd be a great ambassador..." rows={4}
                style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} />
            </div>
          </div>

          {statusMsg && status === "error" && (
            <p style={{ color: "#ff2a6d", fontSize: 11, letterSpacing: "0.15em", textAlign: "center", marginBottom: 12 }}>{statusMsg}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            style={{
              width: "100%", background: "linear-gradient(135deg, rgba(188,19,254,0.15), rgba(188,19,254,0.05))",
              border: "1px solid rgba(188,19,254,0.4)", color: "#bc13fe",
              padding: "14px 24px", fontSize: 13, letterSpacing: "0.2em",
              cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
              clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
              transition: "all 0.3s",
              boxShadow: "0 0 14px rgba(188,19,254,0.2)",
              textShadow: "0 0 8px rgba(188,19,254,0.4)",
            }}
          >{status === "loading" ? "TRANSMITTING..." : "▶ SUBMIT APPLICATION"}</button>
        </>
      )}
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
const FOOTER_NAV = [
  { section: "NAVIGATE", links: [{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Services", href: "/services" }] },
  { section: "PROGRAMS", links: [{ label: "AMPLIFY", href: "/amplify" }, { label: "Tone Zone", href: "/news" }, { label: "Blog", href: "/blog" }] },
  { section: "CONNECT", links: [{ label: "Contact", href: "/contact" }, { label: "Ambassadors", href: "/ambassadors" }, { label: "Shop", href: "/shop" }] },
];

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(188,19,254,0.15)", padding: "48px 24px 32px", position: "relative", zIndex: 2, background: "rgba(5,0,10,0.6)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={LOGO_URL} alt="Artists Musicians Hub" style={{ height: 60, filter: "drop-shadow(0 0 10px rgba(188,19,254,0.5))" }} />
          <div style={{ height: 2, width: 60, margin: "12px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {FOOTER_NAV.map(col => (<div key={col.section}><div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#bc13fe", marginBottom: 16, fontFamily: "'Share Tech Mono', monospace", textShadow: "0 0 6px rgba(188,19,254,0.3)" }}>{col.section}</div>{col.links.map(l => (<a key={l.label} href={l.href} style={{ display: "block", color: "#8b7aaa", fontSize: 12, textDecoration: "none", padding: "5px 0" }}>{l.label}</a>))}</div>))}
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: "24px auto 0", paddingTop: 20, borderTop: "1px solid rgba(188,19,254,0.08)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "#3d2060", fontSize: 10, letterSpacing: "0.15em" }}>© 2026 ARTISTS MUSICIANS HUB</span>
        <div style={{ display: "flex", gap: 16 }}>{["Privacy", "Terms", "Refunds"].map(l => (<a key={l} href={`/${l.toLowerCase()}`} style={{ color: "#3d2060", fontSize: 10, textDecoration: "none" }}>{l}</a>))}</div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AmbassadorsPage() {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 200); }, []);

  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* HERO */}
        <section style={{
          minHeight: "55vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "120px 24px 40px",
          opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>REP THE 210 · EARN · GROW</div>
          <h1 style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(28px, 6vw, 52px)", color: "#ffffff",
            letterSpacing: "0.15em", fontWeight: 400, margin: 0, lineHeight: 1.15,
            textShadow: "0 0 20px rgba(188,19,254,0.4)",
          }}>
            BRAND <span style={{ color: "#bc13fe", textShadow: "0 0 20px #bc13fe" }}>AMBASSADOR</span> PROGRAM
          </h1>
          <div style={{ height: 2, width: 60, margin: "24px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)", boxShadow: "0 0 10px rgba(188,19,254,0.5)" }} />
          <p style={{ color: "#8b7aaa", fontSize: 13, maxWidth: 520, margin: "20px auto 0", lineHeight: 1.8 }}>
            Join the movement. Rep Artists Musicians HUB, earn commission, and help put San Antonio's music scene on the map.
          </p>
        </section>

        {/* WHAT WE DO */}
        <section style={{ padding: "20px 24px 60px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#5b4a7a", marginBottom: 12 }}>THE MISSION</div>
              <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(18px, 3.5vw, 28px)", color: "#ffffff", letterSpacing: "0.1em", fontWeight: 400, margin: "0 0 16px", lineHeight: 1.3 }}>
                What Do We Hope to Achieve?
              </h2>
              <p style={{ color: "#8b7aaa", fontSize: 13, lineHeight: 1.9 }}>
                We are a music marketing agency dedicated to promoting and producing the best in independent music. Our brand ambassador program is a vital part of our mission to spread the love for music and help artists reach their full potential.
              </p>
              <p style={{ color: "#8b7aaa", fontSize: 13, lineHeight: 1.9, marginTop: 12 }}>
                Are you passionate about music and culture? Do you love to express your unique style and share your passion with others? Then you're the perfect candidate to rep AMH.
              </p>
            </div>
            {/* Gallery mosaic */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {GALLERY_IMAGES.map((img, i) => (
                <div key={i} style={{
                  overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(188,19,254,0.1)",
                }}>
                  <img src={img} alt="" style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: "brightness(0.7) saturate(0.8)",
                    transition: "filter 0.4s",
                  }}
                  onMouseEnter={e => e.target.style.filter = "brightness(1) saturate(1)"}
                  onMouseLeave={e => e.target.style.filter = "brightness(0.7) saturate(0.8)"}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERKS */}
        <section style={{ padding: "40px 24px 60px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>WHAT YOU GET</div>
              <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(20px, 4vw, 32px)", color: "#ffffff", letterSpacing: "0.15em", fontWeight: 400, margin: 0, textShadow: "0 0 10px rgba(188,19,254,0.2)" }}>
                AMBASSADOR PERKS
              </h2>
              <div style={{ height: 2, width: 60, margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)", boxShadow: "0 0 8px rgba(188,19,254,0.4)" }} />
            </div>
            <div className="perks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {PERKS.map((perk, i) => <PerkCard key={perk.title} {...perk} index={i} />)}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: "40px 24px 60px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>THE PROCESS</div>
            <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(20px, 4vw, 32px)", color: "#ffffff", letterSpacing: "0.15em", fontWeight: 400, margin: "0 0 32px", textShadow: "0 0 10px rgba(188,19,254,0.2)" }}>
              HOW IT WORKS
            </h2>
            <div style={{ display: "grid", gap: 0 }}>
              {[
                { step: "01", text: "Apply below with your info and social handles", color: "#bc13fe" },
                { step: "02", text: "Our team reviews your application within 48 hours", color: "#00f0ff" },
                { step: "03", text: "Get your unique referral link and ambassador assets", color: "#ff2a6d" },
                { step: "04", text: "Start sharing, earning commission, and repping the 210", color: "#f5f500" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", borderBottom: i < 3 ? "1px solid rgba(188,19,254,0.08)" : "none" }}>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: 24, color: s.color,
                    textShadow: `0 0 10px ${s.color}55`, minWidth: 50, textAlign: "center",
                  }}>{s.step}</div>
                  <p style={{ color: "#8b7aaa", fontSize: 13, margin: 0, textAlign: "left" }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* APPLICATION FORM */}
        <section style={{ padding: "40px 24px 80px" }}>
          <AmbassadorForm />
        </section>

        <Footer />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}body{background:#0a0a0f;-webkit-font-smoothing:antialiased}
        a:hover{color:#bc13fe !important}
        input::placeholder,textarea::placeholder{color:#3d2060 !important}
        input:focus,textarea:focus{outline:none;border-color:rgba(188,19,254,0.4) !important;box-shadow:0 0 12px rgba(188,19,254,0.2)}
        button:hover:not(:disabled){box-shadow:0 0 25px rgba(188,19,254,0.4) !important;transform:scale(1.02)}
        button:disabled{opacity:0.6;cursor:default}
        @keyframes cardFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:768px){
          .perks-grid{grid-template-columns:1fr !important}
          section > div[style*="grid"][style*="1fr 1fr"]{grid-template-columns:1fr !important}
        }
      `}</style>
    </div>
  );
}
