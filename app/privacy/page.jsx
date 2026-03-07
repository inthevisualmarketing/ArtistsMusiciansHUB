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

export default function PrivacyPage() {
  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto", padding: "100px 24px 60px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <a href="/"><img src={LOGO_URL} alt="AMH" style={{ height: 50, width: "auto", filter: "drop-shadow(0 0 8px rgba(188,19,254,0.5))", marginBottom: 20 }} /></a>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>LEGAL</div>
          <h1 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 5vw, 38px)", letterSpacing: "0.2em", color: "#e0d0ff", margin: 0, fontWeight: 400, textShadow: "0 0 15px rgba(188,19,254,0.3)" }}>PRIVACY POLICY</h1>
          <div style={{ height: 2, width: 60, margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)" }} />
          <p style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.15em", marginTop: 16 }}>EFFECTIVE DATE: MARCH 7, 2026 · LAST UPDATED: MARCH 7, 2026</p>
        </div>

        {/* Content */}
        <div style={{ background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.15)", padding: "32px 28px" }}>

          <LegalSection title="1. INTRODUCTION">
            <p>Artists Musicians HUB ("AMH," "we," "us," or "our") is a music marketing and distribution platform operated from San Antonio, Bexar County, Texas. This Privacy Policy describes how we collect, use, store, and protect your personal information when you visit our website at artistsmusicianshub.com or use our services, including the AMPLIFY subscription program and The Tone Zone.</p>
            <p style={{ marginTop: 12 }}>This policy is designed to comply with the Texas Data Privacy and Security Act (TDPSA), effective July 1, 2024, as codified in Texas Business and Commerce Code Chapter 541.</p>
          </LegalSection>

          <LegalSection title="2. INFORMATION WE COLLECT">
            <p><strong style={{ color: "#e0d0ff" }}>Information You Provide:</strong> Name, email address, phone number, and message content when you submit our contact form or subscribe to our services. Payment information when you purchase an AMPLIFY subscription (processed by Stripe — we do not store card details).</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: "#e0d0ff" }}>Information Collected Automatically:</strong> IP address, browser type, device type, pages visited, time spent on pages, and referring URL. We use Google Analytics (ID: G-WPWD1K1CH7) to collect this data. Google Analytics uses cookies to track website usage.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: "#e0d0ff" }}>Information We Do NOT Collect:</strong> We do not collect sensitive personal data as defined by TDPSA Section 541.001(23), including racial or ethnic origin, religious beliefs, health diagnoses, sexual orientation, biometric data, genetic data, or precise geolocation data.</p>
          </LegalSection>

          <LegalSection title="3. HOW WE USE YOUR INFORMATION">
            <p>We use the information we collect for the following purposes:</p>
            <p style={{ marginTop: 8 }}>To provide and maintain our services, including processing AMPLIFY subscriptions. To respond to your contact form inquiries. To send service-related communications such as confirmation emails. To improve our website and user experience through analytics. To comply with legal obligations under Texas and federal law.</p>
          </LegalSection>

          <LegalSection title="4. DATA SHARING AND SALE">
            <p>We do not sell your personal data. We do not share your personal data for targeted advertising purposes. We share data only with the following service providers who process data on our behalf:</p>
            <p style={{ marginTop: 8 }}><strong style={{ color: "#e0d0ff" }}>Stripe</strong> — payment processing. <strong style={{ color: "#e0d0ff" }}>Mailgun</strong> — email delivery. <strong style={{ color: "#e0d0ff" }}>Google Analytics</strong> — website usage analytics. <strong style={{ color: "#e0d0ff" }}>Cloudinary</strong> — media hosting. <strong style={{ color: "#e0d0ff" }}>Fly.io</strong> — web hosting.</p>
            <p style={{ marginTop: 8 }}>Each provider is contractually obligated to use your data only for the purposes of providing their services to us.</p>
          </LegalSection>

          <LegalSection title="5. YOUR RIGHTS UNDER TDPSA">
            <p>As a Texas resident, you have the following rights under the Texas Data Privacy and Security Act (TDPSA):</p>
            <p style={{ marginTop: 8 }}><strong style={{ color: "#00f0ff" }}>Right to Know</strong> — You may confirm whether we are processing your personal data and access that data. <strong style={{ color: "#00f0ff" }}>Right to Correct</strong> — You may request correction of inaccurate personal data. <strong style={{ color: "#00f0ff" }}>Right to Delete</strong> — You may request deletion of your personal data. <strong style={{ color: "#00f0ff" }}>Right to Data Portability</strong> — You may obtain a copy of your personal data in a portable format. <strong style={{ color: "#00f0ff" }}>Right to Opt Out</strong> — You may opt out of the sale of personal data, targeted advertising, and profiling.</p>
            <p style={{ marginTop: 12 }}>To exercise any of these rights, contact us at artists.musicians.hub@gmail.com or call (210) 891-4991. We will respond to verified requests within 45 days as required by TDPSA.</p>
          </LegalSection>

          <LegalSection title="6. UNIVERSAL OPT-OUT MECHANISM">
            <p>In compliance with TDPSA Section 541.055(e), effective January 1, 2025, we honor Global Privacy Control (GPC) signals. If your browser sends a GPC signal, we will treat it as a valid opt-out request for the sale of personal data and targeted advertising. Since we do not sell personal data or engage in targeted advertising, GPC signals will be acknowledged but require no change in our data processing.</p>
          </LegalSection>

          <LegalSection title="7. COOKIES AND TRACKING">
            <p>We use cookies and similar technologies through Google Analytics for website performance analysis. You may control cookie preferences through your browser settings. Disabling cookies may affect your experience on our website but will not prevent access to our services.</p>
          </LegalSection>

          <LegalSection title="8. DATA SECURITY">
            <p>We implement administrative, technical, and physical safeguards to protect your personal data. All data transmission is encrypted via HTTPS/TLS. Payment data is processed through Stripe's PCI-DSS compliant infrastructure. We do not store credit card numbers on our servers.</p>
          </LegalSection>

          <LegalSection title="9. DATA RETENTION">
            <p>We retain personal data only for as long as necessary to fulfill the purposes described in this policy, or as required by law. Contact form submissions are retained for business communication purposes. Subscription data is retained for the duration of the subscription and a reasonable period thereafter for accounting and legal compliance.</p>
          </LegalSection>

          <LegalSection title="10. CHILDREN'S PRIVACY">
            <p>Our services are not directed at children under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 13, we will promptly delete that information. If you believe a child has provided us personal data, please contact us immediately.</p>
          </LegalSection>

          <LegalSection title="11. CHANGES TO THIS POLICY">
            <p>We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>
          </LegalSection>

          <LegalSection title="12. CONTACT US">
            <p>For privacy-related inquiries, data access requests, or to exercise your TDPSA rights:</p>
            <p style={{ marginTop: 8, color: "#e0d0ff" }}>Artists Musicians HUB<br />San Antonio, Bexar County, Texas<br />Email: artists.musicians.hub@gmail.com<br />Phone: (210) 891-4991<br />Website: artistsmusicianshub.com</p>
          </LegalSection>

        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/" style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", fontFamily: "'Share Tech Mono', monospace" }}>⌂ BACK TO HOME</a>
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
