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
  return <canvas ref={canvasRef} style={{position:"fixed",top:0,right:0,bottom:0,left:0,pointerEvents:"none",zIndex:0}} />;
}

function LegalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, letterSpacing: "0.2em", color: "#bc13fe", margin: "0 0 12px", textShadow: "0 0 8px rgba(188,19,254,0.3)" }}>{title}</h3>
      <div style={{ color: "#a78bca", fontSize: 13, lineHeight: 1.8, borderLeft: "2px solid rgba(188,19,254,0.2)", paddingLeft: 16 }}>
        {children}
      </div>
    </div>
  );
}

export default function RefundsPage() {
  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto", padding: "100px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <a href="/"><img src={LOGO_URL} alt="AMH" style={{ height: 50, width: "auto", filter: "drop-shadow(0 0 8px rgba(188,19,254,0.5))", marginBottom: 20 }} /></a>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>LEGAL</div>
          <h1 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 5vw, 38px)", letterSpacing: "0.2em", color: "#e0d0ff", margin: 0, fontWeight: 400, textShadow: "0 0 15px rgba(188,19,254,0.3)" }}>REFUND POLICY</h1>
          <div style={{ height: 2, width: 60, margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)" }} />
          <p style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.15em", marginTop: 16 }}>EFFECTIVE DATE: MARCH 7, 2026 · LAST UPDATED: MARCH 7, 2026</p>
        </div>

        <div style={{ background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.15)", padding: "32px 28px" }}>

          {/* Prominent no-refund notice */}
          <div style={{
            background: "rgba(255,42,109,0.06)", border: "1px solid rgba(255,42,109,0.3)",
            padding: "24px 20px", marginBottom: 32, textAlign: "center",
          }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#ff2a6d", marginBottom: 8 }}>IMPORTANT NOTICE</div>
            <p style={{ color: "#ff2a6d", fontSize: 16, fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.15em", margin: 0, lineHeight: 1.6, fontWeight: "bold" }}>
              ALL SALES ARE FINAL.<br />NO REFUNDS WILL BE ISSUED.
            </p>
          </div>

          <LegalSection title="1. POLICY OVERVIEW">
            <p>Artists Musicians HUB ("AMH") maintains a strict no-refund policy on all services, subscriptions, and products sold through our website and platform. By completing a purchase, you acknowledge and agree that all sales are final and that you are not entitled to a refund, return, or exchange under any circumstances.</p>
            <p style={{ marginTop: 12 }}>This policy is clearly stated prior to any purchase and is in compliance with Texas law, which permits businesses to establish and enforce their own refund policies.</p>
          </LegalSection>

          <LegalSection title="2. WHAT THIS POLICY COVERS">
            <p>This no-refund policy applies to all purchases made through AMH, including but not limited to:</p>
            <p style={{ marginTop: 8 }}>
              <span style={{ color: "#e0d0ff" }}>AMPLIFY Basic</span> subscription ($100/month) —
              <span style={{ color: "#e0d0ff" }}> AMPLIFY Pro</span> subscription ($250/month) —
              <span style={{ color: "#e0d0ff" }}> AMPLIFY Elite</span> subscription ($500/month) —
              One-time service fees —
              Merchandise and apparel —
              Digital products and downloads —
              Consultation and coaching fees —
              Booking and event management fees
            </p>
          </LegalSection>

          <LegalSection title="3. SUBSCRIPTION CANCELLATION">
            <p>While we do not offer refunds, you may cancel your AMPLIFY subscription at any time. Upon cancellation:</p>
            <p style={{ marginTop: 8 }}>Your subscription will remain active through the end of your current billing period. You will not be charged for subsequent months. No partial refunds will be issued for unused time remaining in the current billing period. Access to subscription benefits will end when the current period expires.</p>
            <p style={{ marginTop: 12 }}>To cancel, email artists.musicians.hub@gmail.com or call (210) 891-4991.</p>
          </LegalSection>

          <LegalSection title="4. BILLING ERRORS">
            <p>If you believe you have been charged in error (such as a duplicate charge or an incorrect amount), contact us within 7 days of the charge at artists.musicians.hub@gmail.com. We will review the charge and, if a billing error is confirmed, issue a correction. This does not constitute a refund of legitimately charged services.</p>
          </LegalSection>

          <LegalSection title="5. SERVICE DISPUTES">
            <p>If you are dissatisfied with a service, we encourage you to contact us directly so we can address your concerns. AMH is committed to providing quality services and will work with you to find a resolution where possible. However, dissatisfaction with services does not entitle you to a refund under this policy.</p>
          </LegalSection>

          <LegalSection title="6. CHARGEBACKS">
            <p>Initiating a chargeback or payment dispute with your bank or credit card provider for a legitimate charge constitutes a breach of these terms. AMH reserves the right to immediately terminate your account and access to all services, pursue collection of any outstanding amounts, and report the dispute to relevant authorities if appropriate.</p>
          </LegalSection>

          <LegalSection title="7. TEXAS CONSUMER RIGHTS">
            <p>This refund policy does not limit any rights you may have under the Texas Deceptive Trade Practices-Consumer Protection Act (DTPA), Texas Business and Commerce Code, Chapter 17, Subchapter E. If you believe you have been the victim of fraud or deceptive practices, you may file a complaint with the Texas Attorney General's Consumer Protection Division.</p>
            <p style={{ marginTop: 8, color: "#5b4a7a", fontSize: 11 }}>Texas Attorney General Consumer Protection: www.texasattorneygeneral.gov/consumer-protection</p>
          </LegalSection>

          <LegalSection title="8. CONTACT US">
            <p>For billing inquiries, cancellation requests, or questions about this policy:</p>
            <p style={{ marginTop: 8, color: "#e0d0ff" }}>Artists Musicians HUB<br />San Antonio, Bexar County, Texas<br />Email: artists.musicians.hub@gmail.com<br />Phone: (210) 891-4991<br />Website: artistsmusicianshub.com</p>
          </LegalSection>

        </div>

        {/* Navigation */}
        <div style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/terms" style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", fontFamily: "'Share Tech Mono', monospace" }}>TERMS & CONDITIONS</a>
          <a href="/privacy" style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", fontFamily: "'Share Tech Mono', monospace" }}>PRIVACY POLICY</a>
          <a href="/" style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", fontFamily: "'Share Tech Mono', monospace" }}>⌂ HOME</a>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}body{background:#0a0a0f;-webkit-font-smoothing:antialiased}
        img{max-width:100%;height:auto}a:hover{color:#bc13fe !important}
      `}</style>
    </div>
  );
}
