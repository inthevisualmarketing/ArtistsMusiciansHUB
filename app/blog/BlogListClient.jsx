"use client";
import { useState, useEffect, useRef } from "react";

function formatDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

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

// ============================================================
// POST CARD
// ============================================================
function PostCard({ post, index, categories }) {
  const [hov, setHov] = useState(false);
  const cat = categories.find(c => c.id === post.category);
  const delay = Math.min(index * 0.04, 0.6);

  return (
    <a
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "block", textDecoration: "none",
        animation: `cardFadeIn 0.5s ${delay}s ease-out both`, opacity: 0,
      }}
    >
      <div style={{
        background: hov ? "rgba(10,0,16,0.95)" : "rgba(10,0,16,0.8)",
        border: `1px solid ${hov ? (cat?.color || "#bc13fe") + "44" : "rgba(188,19,254,0.1)"}`,
        overflow: "hidden", transition: "all 0.35s ease",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? `0 0 20px ${(cat?.color || "#bc13fe")}15` : "none",
        position: "relative",
      }}>
        {/* Holographic sweep */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 60%)",
          transform: hov ? "translateX(200%)" : "translateX(-200%)",
          transition: "transform 0.6s ease", pointerEvents: "none", zIndex: 1,
        }} />

        {/* Image */}
        {post.image && (
          <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
            <img src={post.image} alt={post.title} style={{
              width: "100%", height: "100%", objectFit: "cover",
              filter: hov ? "brightness(1) saturate(1)" : "brightness(0.6) saturate(0.6)",
              transition: "filter 0.4s",
            }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(10,0,16,0.9) 100%)" }} />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: post.image ? "16px 20px 20px" : "24px 20px" }}>
          {/* Category + date */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{
              fontSize: 9, letterSpacing: "0.2em",
              color: cat?.color || "#bc13fe",
              textShadow: `0 0 8px ${(cat?.color || "#bc13fe")}66`,
            }}>{cat?.label || post.category.toUpperCase()}</span>
            <span style={{ fontSize: 9, letterSpacing: "0.1em", color: "#5b4a7a" }}>{formatDate(post.date)}</span>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 14, letterSpacing: "0.05em",
            color: hov ? "#ffffff" : "#e0d0ff",
            margin: "0 0 8px", fontWeight: 400, lineHeight: 1.4,
            transition: "color 0.3s",
          }}>{post.title}</h3>

          {/* Excerpt */}
          <p style={{
            fontSize: 12, color: "#8b7aaa", lineHeight: 1.6, margin: "0 0 12px",
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{post.excerpt}</p>

          {/* Reading time + CTA */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "#5b4a7a" }}>
              {post.readTime} MIN READ
            </span>
            <span style={{
              fontSize: 9, letterSpacing: "0.15em",
              color: hov ? (cat?.color || "#bc13fe") : "#5b4a7a",
              textShadow: hov ? `0 0 6px ${(cat?.color || "#bc13fe")}55` : "none",
              transition: "color 0.3s",
            }}>READ →</span>
          </div>
        </div>

        {/* Bottom glow */}
        <div style={{
          height: 1,
          background: hov
            ? `linear-gradient(90deg, transparent, ${cat?.color || "#bc13fe"}, transparent)`
            : "linear-gradient(90deg, transparent, rgba(188,19,254,0.08), transparent)",
          transition: "all 0.3s",
        }} />
      </div>
    </a>
  );
}

// ============================================================
// FOOTER
// ============================================================
const FOOTER_NAV = [
  { section: "NAVIGATE", links: [{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Services", href: "/services" }] },
  { section: "PROGRAMS", links: [{ label: "AMPLIFY", href: "/amplify" }, { label: "Tone Zone", href: "/news" }, { label: "Blog", href: "/blog" }] },
  { section: "COMMUNITY", links: [{ label: "Ambassadors", href: "/ambassadors" }, { label: "Shop", href: "/shop" }, { label: "Contact", href: "/contact" }] },
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
          {FOOTER_NAV.map(col => (<div key={col.section}><div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#bc13fe", marginBottom: 16, fontFamily: "'Share Tech Mono', monospace" }}>{col.section}</div>{col.links.map(l => (<a key={l.label} href={l.href} style={{ display: "block", color: "#8b7aaa", fontSize: 12, textDecoration: "none", padding: "5px 0" }}>{l.label}</a>))}</div>))}
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
// BLOG PAGE
// ============================================================
export default function BlogListClient({ posts: POSTS, categories: CATEGORIES }) {
  const [filter, setFilter] = useState("ALL");
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 200); }, []);

  const filtered = filter === "ALL" ? POSTS : POSTS.filter(p => p.category === filter);

  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Hero */}
        <section style={{
          padding: "120px 24px 40px", textAlign: "center",
          opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>INSIGHTS · SPOTLIGHTS · NEWS</div>
          <h1 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 7vw, 56px)", color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: 0, textShadow: "0 0 20px rgba(188,19,254,0.4)" }}>
            THE <span style={{ color: "#bc13fe", textShadow: "0 0 20px #bc13fe" }}>BLOG</span>
          </h1>
          <div style={{ height: 2, width: 60, margin: "20px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)", boxShadow: "0 0 10px rgba(188,19,254,0.5)" }} />
          <p style={{ color: "#8b7aaa", fontSize: 13, maxWidth: 500, margin: "16px auto 0", lineHeight: 1.7 }}>
            Artist spotlights, growth strategies, industry insights, and Artists Musicians HUB updates.
          </p>

          {/* RSS link */}
          <a href="/blog/rss.xml" style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
            fontSize: 10, letterSpacing: "0.2em", color: "#5b4a7a", textDecoration: "none",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#5b4a7a"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/></svg>
            RSS FEED
          </a>
        </section>

        {/* Category filters */}
        <section style={{ padding: "0 24px 32px" }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 800, margin: "0 auto" }}>
            <button
              onClick={() => setFilter("ALL")}
              style={{
                background: filter === "ALL" ? "rgba(188,19,254,0.15)" : "transparent",
                border: `1px solid ${filter === "ALL" ? "#bc13fe" : "rgba(188,19,254,0.15)"}`,
                color: filter === "ALL" ? "#bc13fe" : "#5b4a7a",
                padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em",
                cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
                transition: "all 0.2s",
                textShadow: filter === "ALL" ? "0 0 8px rgba(188,19,254,0.5)" : "none",
                boxShadow: filter === "ALL" ? "0 0 12px rgba(188,19,254,0.2)" : "none",
              }}
            >ALL</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                style={{
                  background: filter === cat.id ? `${cat.color}15` : "transparent",
                  border: `1px solid ${filter === cat.id ? cat.color : "rgba(188,19,254,0.15)"}`,
                  color: filter === cat.id ? cat.color : "#5b4a7a",
                  padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em",
                  cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                  clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
                  transition: "all 0.2s",
                  textShadow: filter === cat.id ? `0 0 8px ${cat.color}66` : "none",
                  boxShadow: filter === cat.id ? `0 0 12px ${cat.color}22` : "none",
                }}
              >{cat.label}</button>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, letterSpacing: "0.2em", color: "#5b4a7a" }}>
            {filtered.length} POST{filtered.length !== 1 ? "S" : ""}
          </div>
        </section>

        {/* Post grid */}
        <section style={{ padding: "0 24px 60px" }}>
          <div className="blog-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20, maxWidth: 1100, margin: "0 auto",
          }}>
            {filtered.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} categories={CATEGORIES} />
            ))}
          </div>
        </section>

        <Footer />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}body{background:#0a0a0f;-webkit-font-smoothing:antialiased}
        a:hover{color:#bc13fe !important}
        @keyframes cardFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:640px){.blog-grid{grid-template-columns:1fr !important}}
      `}</style>
    </div>
  );
}
