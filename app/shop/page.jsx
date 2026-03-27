"use client";
import { useState, useEffect, useRef } from "react";

const LOGO_URL = "https://res.cloudinary.com/dbpremci4/image/upload/w_200,h_200,c_fit/white-hub-logo-transparent";
const BEANIE_IMG = "https://res.cloudinary.com/dbpremci4/image/fetch/w_500,h_500,c_fill,q_auto,f_auto/https://irp.cdn-website.com/4b2bab8b/dms3rep/multi/cuffed-beanie-white-front-63e78d6e95a7e.jpg";
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

export default function ShopPage() {
  const [v, setV] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [hov, setHov] = useState(false);

  useEffect(() => { setTimeout(() => setV(true), 200); }, []);

  const handleNotify = async () => {
    if (!email || !email.includes("@")) {
      setStatus("error"); setStatusMsg("INVALID EMAIL"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success"); setStatusMsg("SIGNAL LOCKED — WE'LL NOTIFY YOU"); setEmail("");
      } else {
        setStatus("error"); setStatusMsg("TRANSMISSION FAILED — TRY AGAIN");
      }
    } catch {
      setStatus("error"); setStatusMsg("CONNECTION ERROR — TRY AGAIN");
    }
  };

  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />

      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 60px" }}>
        {/* Corner brackets */}
        <div style={{ position: "fixed", top: 80, left: 20, width: 28, height: 28, borderTop: "2px solid rgba(188,19,254,0.3)", borderLeft: "2px solid rgba(188,19,254,0.3)" }} />
        <div style={{ position: "fixed", top: 80, right: 20, width: 28, height: 28, borderTop: "2px solid rgba(188,19,254,0.3)", borderRight: "2px solid rgba(188,19,254,0.3)" }} />
        <div style={{ position: "fixed", bottom: 20, left: 20, width: 28, height: 28, borderBottom: "2px solid rgba(188,19,254,0.3)", borderLeft: "2px solid rgba(188,19,254,0.3)" }} />
        <div style={{ position: "fixed", bottom: 20, right: 20, width: 28, height: 28, borderBottom: "2px solid rgba(188,19,254,0.3)", borderRight: "2px solid rgba(188,19,254,0.3)" }} />

        <div style={{ textAlign: "center", maxWidth: 600, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease" }}>
          {/* Logo */}
          <img src={LOGO_URL} alt="AMH" style={{ height: 60, marginBottom: 24, filter: "drop-shadow(0 0 12px rgba(188,19,254,0.5))" }} />

          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>MERCH · GEAR · CULTURE</div>

          <h1 style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 7vw, 56px)", color: "#ffffff",
            letterSpacing: "0.2em", fontWeight: 400, margin: "0 0 8px",
            textShadow: "0 0 20px rgba(188,19,254,0.4)",
          }}>
            HUB <span style={{ color: "#bc13fe", textShadow: "0 0 20px #bc13fe" }}>SHOP</span>
          </h1>

          <div style={{ height: 2, width: 60, margin: "0 auto 24px", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)", boxShadow: "0 0 10px rgba(188,19,254,0.5)" }} />

          <p style={{
            fontSize: 14, letterSpacing: "0.3em", color: "#00f0ff",
            textShadow: "0 0 10px rgba(0,240,255,0.4)",
            animation: "pulse 2s ease-in-out infinite",
          }}>COMING SOON</p>

          {/* Beanie preview */}
          <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: 220, height: 220, margin: "40px auto",
              background: "rgba(10,0,16,0.9)", border: `1px solid ${hov ? "rgba(188,19,254,0.4)" : "rgba(188,19,254,0.12)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.4s ease",
              transform: hov ? "scale(1.03)" : "scale(1)",
              boxShadow: hov ? "0 0 30px rgba(188,19,254,0.2)" : "none",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Holographic sweep */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
              transform: hov ? "translateX(200%)" : "translateX(-200%)",
              transition: "transform 0.6s ease", pointerEvents: "none", zIndex: 1,
            }} />
            <img src={BEANIE_IMG} alt="AMH Beanie" style={{
              maxWidth: "80%", maxHeight: "80%", objectFit: "contain",
              filter: hov ? "brightness(1.1)" : "brightness(0.8)",
              transition: "filter 0.4s",
            }} />
            {/* Corner accents */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "1.5px solid #bc13fe", borderLeft: "1.5px solid #bc13fe", opacity: hov ? 0.6 : 0.15, transition: "opacity 0.3s" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "1.5px solid #bc13fe", borderRight: "1.5px solid #bc13fe", opacity: hov ? 0.6 : 0.15, transition: "opacity 0.3s" }} />
          </div>

          <p style={{ color: "#8b7aaa", fontSize: 12, letterSpacing: "0.08em", marginBottom: 8 }}>
            AMH CUFFED BEANIE — FIRST DROP
          </p>
          <p style={{ color: "#5b4a7a", fontSize: 11, marginBottom: 36 }}>
            Official Artists Musicians HUB merch is on the way. Beanies, tees, and more.
          </p>

          {/* Teaser categories */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            {["BEANIES", "TEES", "HOODIES", "ACCESSORIES"].map((item, i) => (
              <div key={item} style={{
                padding: "10px 20px",
                border: "1px dashed rgba(188,19,254,0.15)",
                fontSize: 10, letterSpacing: "0.2em", color: "#3d2060",
                clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              }}>{item}</div>
            ))}
          </div>

          {/* Notify form */}
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#5b4a7a", marginBottom: 12 }}>GET NOTIFIED WHEN WE DROP</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNotify()}
                placeholder="your@email.com"
                disabled={status === "success"}
                style={{
                  flex: 1, background: "rgba(188,19,254,0.03)", border: "1px solid rgba(188,19,254,0.2)",
                  color: "#e0d0ff", padding: "12px 16px", fontSize: 13,
                  fontFamily: "'Share Tech Mono', monospace", transition: "all 0.2s",
                }}
              />
              <button
                onClick={handleNotify}
                disabled={status === "loading" || status === "success"}
                style={{
                  background: "transparent", border: "1px solid rgba(188,19,254,0.4)",
                  color: status === "success" ? "#00f0ff" : "#bc13fe",
                  padding: "12px 20px", fontSize: 11, letterSpacing: "0.15em",
                  cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                  boxShadow: "0 0 10px rgba(188,19,254,0.2)",
                  textShadow: "0 0 6px rgba(188,19,254,0.3)",
                  whiteSpace: "nowrap", transition: "all 0.3s",
                }}
              >{status === "loading" ? "..." : status === "success" ? "✓" : "NOTIFY ME"}</button>
            </div>
            {statusMsg && (
              <p style={{
                color: status === "success" ? "#00f0ff" : "#ff2a6d",
                fontSize: 10, letterSpacing: "0.15em", marginTop: 10,
                textShadow: status === "success" ? "0 0 6px rgba(0,240,255,0.3)" : "none",
              }}>{statusMsg}</p>
            )}
          </div>

          {/* Links */}
          <div style={{ marginTop: 48, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/ambassadors" style={{ fontSize: 11, letterSpacing: "0.15em", color: "#8b7aaa", textDecoration: "none" }}>BECOME AN AMBASSADOR →</a>
            <a href="/" style={{ fontSize: 11, letterSpacing: "0.15em", color: "#5b4a7a", textDecoration: "none" }}>← BACK TO HOME</a>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0f;-webkit-font-smoothing:antialiased}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        input::placeholder{color:#3d2060 !important}
        input:focus{outline:none;border-color:rgba(188,19,254,0.4) !important;box-shadow:0 0 12px rgba(188,19,254,0.2)}
        button:hover:not(:disabled){box-shadow:0 0 20px rgba(188,19,254,0.4) !important}
        button:disabled{opacity:0.6;cursor:default}
        a:hover{color:#bc13fe !important}
      `}</style>
    </div>
  );
}
