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

export default function TermsPage() {
  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto", padding: "100px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <a href="/"><img src={LOGO_URL} alt="AMH" style={{ height: 50, width: "auto", filter: "drop-shadow(0 0 8px rgba(188,19,254,0.5))", marginBottom: 20 }} /></a>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>LEGAL</div>
          <h1 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 5vw, 38px)", letterSpacing: "0.2em", color: "#e0d0ff", margin: 0, fontWeight: 400, textShadow: "0 0 15px rgba(188,19,254,0.3)" }}>TERMS & CONDITIONS</h1>
          <div style={{ height: 2, width: 60, margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)" }} />
          <p style={{ color: "#5b4a7a", fontSize: 11, letterSpacing: "0.15em", marginTop: 16 }}>EFFECTIVE DATE: MARCH 7, 2026 · LAST UPDATED: MARCH 7, 2026</p>
        </div>

        <div style={{ background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.15)", padding: "32px 28px" }}>

          <LegalSection title="1. AGREEMENT TO TERMS">
            <p>By accessing or using the Artists Musicians HUB website (artistsmusicianshub.com) and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use our website or services. These terms constitute a legally binding agreement between you and Artists Musicians HUB ("AMH"), a business operating in San Antonio, Bexar County, Texas, governed by the laws of the State of Texas.</p>
          </LegalSection>

          <LegalSection title="2. SERVICES">
            <p>AMH provides music marketing, distribution, sync licensing, artist development, and promotional services. Our primary subscription offering is the AMPLIFY program, available in three tiers: Basic ($100/month), Pro ($250/month), and Elite ($500/month). Service descriptions are provided on our website and may be updated from time to time at our discretion.</p>
          </LegalSection>

          <LegalSection title="3. SUBSCRIPTIONS AND PAYMENT">
            <p>AMPLIFY subscriptions are billed monthly through Stripe, our third-party payment processor. By subscribing, you authorize recurring monthly charges to your chosen payment method. Subscriptions begin upon successful payment and renew automatically each month until cancelled. You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period — you will retain access to services through the remainder of the period you have already paid for.</p>
          </LegalSection>

          <LegalSection title="4. NO REFUND POLICY">
            <p style={{ color: "#ff2a6d" }}><strong>ALL SALES ARE FINAL. ARTISTS MUSICIANS HUB DOES NOT OFFER REFUNDS FOR ANY SERVICES, SUBSCRIPTIONS, OR PRODUCTS PURCHASED THROUGH OUR WEBSITE OR PLATFORM.</strong></p>
            <p style={{ marginTop: 12 }}>This includes, without limitation: AMPLIFY subscription fees (Basic, Pro, and Elite tiers), any one-time service fees, merchandise, digital products, and consultation fees. By completing a purchase, you acknowledge and agree that you are not entitled to a refund under any circumstances. This policy is permitted under Texas law, which allows retailers and service providers to establish their own return and refund policies (Texas State Law Library, Consumer Returns).</p>
            <p style={{ marginTop: 12 }}>If you believe there has been a billing error, contact us at artists.musicians.hub@gmail.com within 7 days of the charge and we will investigate.</p>
          </LegalSection>

          <LegalSection title="5. INTELLECTUAL PROPERTY">
            <p>All content on the AMH website — including text, graphics, logos, images, audio, video, the AMH brand identity, and The Tone Zone name — is the property of Artists Musicians HUB or its licensors and is protected by United States copyright and trademark law. You may not reproduce, distribute, modify, or create derivative works from any AMH content without prior written permission.</p>
            <p style={{ marginTop: 12 }}>Artists who submit content to AMH retain ownership of their original works. By submitting content, you grant AMH a non-exclusive, royalty-free license to use, display, and promote your submitted content across our platform, website, and social media channels for marketing purposes.</p>
          </LegalSection>

          <LegalSection title="6. USER CONDUCT">
            <p>When using our services, you agree not to: submit false or misleading information, impersonate any person or entity, use our platform for unlawful purposes, attempt to gain unauthorized access to our systems, interfere with the operation of our website, or use automated tools (bots, scrapers) to access our content or services.</p>
            <p style={{ marginTop: 12 }}>Violation of these terms may result in immediate termination of your account and access to our services without refund.</p>
          </LegalSection>

          <LegalSection title="7. MUSIC RELEASES UNDER AMH">
            <p>For AMPLIFY Pro and Elite members whose music is released under the Artists Musicians HUB name: AMH acts as a distribution partner. The artist retains creative ownership of their work. Specific distribution terms, revenue splits, and licensing arrangements will be outlined in a separate distribution agreement executed between AMH and the artist prior to release.</p>
          </LegalSection>

          <LegalSection title="8. LIMITATION OF LIABILITY">
            <p>To the maximum extent permitted by Texas law, Artists Musicians HUB, its owner, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services. Our total liability for any claim shall not exceed the amount you paid to AMH in the twelve (12) months preceding the claim. This limitation applies regardless of the theory of liability (contract, tort, negligence, or otherwise).</p>
          </LegalSection>

          <LegalSection title="9. DISCLAIMER OF WARRANTIES">
            <p>Our services are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. AMH does not guarantee specific results, stream counts, revenue, placements, or career outcomes from use of our services.</p>
          </LegalSection>

          <LegalSection title="10. INDEMNIFICATION">
            <p>You agree to indemnify and hold harmless Artists Musicians HUB, its owner, employees, and affiliates from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of our services, your violation of these terms, or your violation of any third-party rights.</p>
          </LegalSection>

          <LegalSection title="11. GOVERNING LAW AND JURISDICTION">
            <p>These Terms and Conditions are governed by and construed in accordance with the laws of the State of Texas, without regard to conflict of law principles. Any disputes arising under these terms shall be resolved exclusively in the courts of Bexar County, Texas. You consent to the personal jurisdiction of such courts.</p>
          </LegalSection>

          <LegalSection title="12. TEXAS DECEPTIVE TRADE PRACTICES ACT">
            <p>Nothing in these terms is intended to waive any rights you may have under the Texas Deceptive Trade Practices-Consumer Protection Act (DTPA), Texas Business and Commerce Code, Chapter 17, Subchapter E. To the extent any provision conflicts with the DTPA, the DTPA shall prevail.</p>
          </LegalSection>

          <LegalSection title="13. MODIFICATIONS">
            <p>AMH reserves the right to modify these Terms and Conditions at any time. Material changes will be posted on this page with an updated effective date. Continued use of our services after changes constitutes your acceptance of the revised terms.</p>
          </LegalSection>

          <LegalSection title="14. SEVERABILITY">
            <p>If any provision of these terms is held invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.</p>
          </LegalSection>

          <LegalSection title="15. CONTACT">
            <p style={{ color: "#e0d0ff" }}>Artists Musicians HUB<br />San Antonio, Bexar County, Texas<br />Email: artists.musicians.hub@gmail.com<br />Phone: (210) 891-4991<br />Website: artistsmusicianshub.com</p>
          </LegalSection>

        </div>

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
