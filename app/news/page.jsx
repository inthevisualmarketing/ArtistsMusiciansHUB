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

function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>{label}</div>
      <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 5vw, 42px)", letterSpacing: "0.2em", color: "#e0d0ff", margin: 0, fontWeight: 400, textShadow: "0 0 15px rgba(188,19,254,0.3)" }}>{title}</h2>
      <div style={{ height: 2, width: 60, margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)", boxShadow: "0 0 10px rgba(188,19,254,0.5)" }} />
      {subtitle && <p style={{ color: "#8b7aaa", fontSize: 12, letterSpacing: "0.1em", marginTop: 14, maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>{subtitle}</p>}
    </div>
  );
}

// ============================================================
// HERO
// ============================================================
function NewsHero() {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 200); }, []);
  return (
    <section style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 40px", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease" }}>
      {/* Animated signal icon */}
      <div style={{ marginBottom: 24, filter: "drop-shadow(0 0 10px rgba(0,240,255,0.5))" }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ overflow: "visible" }}>
          <circle cx="30" cy="30" r="6" fill="#00f0ff" opacity="0.8">
            <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="30" r="14" stroke="#00f0ff" strokeWidth="1.5" fill="none" opacity="0">
            <animate attributeName="r" values="8;18" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="30" r="22" stroke="#bc13fe" strokeWidth="1" fill="none" opacity="0">
            <animate attributeName="r" values="14;26" dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="30" r="28" stroke="#ff2a6d" strokeWidth="0.5" fill="none" opacity="0">
            <animate attributeName="r" values="20;32" dur="2s" begin="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="2s" begin="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>DISCOVER · CONNECT · SUPPORT</div>
      <h1 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 7vw, 60px)", color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: 0, lineHeight: 1.1, textShadow: "0 0 20px rgba(188,19,254,0.5)" }}>
        THE <span style={{ color: "#00f0ff", textShadow: "0 0 20px #00f0ff" }}>TONE ZONE</span>
      </h1>
      <p style={{ color: "#8b7aaa", fontSize: "clamp(12px, 1.6vw, 15px)", letterSpacing: "0.1em", maxWidth: 560, margin: "20px 0 0", lineHeight: 1.8 }}>
        San Antonio's home for independent artists, producers, and DJs. Explore the 210's most talented creatives — all in one place, always free.
      </p>
      <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {[{ val: "50+", label: "ARTISTS" }, { val: "210", label: "AREA CODE" }, { val: "FREE", label: "ALWAYS" }].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 24, color: "#bc13fe", textShadow: "0 0 8px rgba(188,19,254,0.4)" }}>{s.val}</div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// ARTIST DATA — ALL 50+ from both galleries
// ============================================================
const D = "https://irp.cdn-website.com/4b2bab8b/dms3rep/multi/";
const D2 = "https://irp-cdn.multiscreensite.com/4b2bab8b/dms3rep/multi/";

const TONE_ZONE_ARTISTS = [
  // Active Tone Zone gallery
  { name: "BxneYvrdBxyz", genre: "ALT RAP", color: "#bc13fe", image: D+"B2FEAF5E-A0A0-470C-808C-6E0B110D9A1C.jpg", link: "https://www.instagram.com/bxneyvrdbxyz" },
  { name: "Trevion500", genre: "R&B / LABEL OWNER", color: "#00f0ff", image: D+"photo_2025-08-25_21-42-03.jpg", link: "https://www.trevion500.net/" },
  { name: "YungNygma", genre: "ALT RAP", color: "#ff2a6d", image: D+"attistspage2.jpg", link: "https://www.instagram.com/yungnygma" },
  { name: "DAKIDD", genre: "RECORDING ARTIST", color: "#bc13fe", image: D+"amhubaritsits.jpg", link: "https://www.instagram.com/dakiddfrmdatone" },
  { name: "Noonty", genre: "ARTIST", color: "#f5f500", image: D+"sil+prime-Enhanced-NR.jpg", link: "https://www.instagram.com/dorianxavier_/" },
  { name: "Ape $terling", genre: "HIP-HOP", color: "#00f0ff", image: D+"290351402_582308276752508_4388939695854190780_n.jpg", link: "https://www.instagram.com/ape_sterling/" },
  { name: "Lil Yodaa", genre: "ARTIST", color: "#ff2a6d", image: D2+"lil+Yodaa.jpg", link: "https://youtu.be/BSz8VKtfNEU" },
  { name: "Dai Made", genre: "SINGER / HIP-HOP", color: "#bc13fe", image: D+"daimade2.png", link: "https://www.instagram.com/motivefromtheheart/" },
  { name: "7Kaos", genre: "SONGWRITER / RAPPER", color: "#00f0ff", image: D+"317577965_461840632799889_4883644037431492099_n.jpg", link: "https://www.instagram.com/siete_caos/" },
  { name: "Orayvia Godoy", genre: "ARTIST / SONGWRITER", color: "#ff2a6d", image: D+"316834450_643643764223507_8341038716577873299_n.jpg", link: "https://direct.me/official-orayvia" },
  { name: "MvsterKey", genre: "HIP-HOP / RAP", color: "#bc13fe", image: D+"masterkey.enhanced.png", link: "https://linktr.ee/mvsterkey" },
  { name: "Nakkiki", genre: "SINGER / HIP-HOP", color: "#f5f500", image: D+"302054798_1252720045484512_5959186148786625561_n.jpg", link: "https://www.instagram.com/nakakiiii/" },
  { name: "INRG", genre: "RECORDING ARTIST", color: "#00f0ff", image: D+"inrg.jpg", link: "https://www.inrgofficialworld.com/" },
  { name: "IAGO CANE", genre: "ARTIST / RAPPER", color: "#ff2a6d", image: D+"IAGO+CANE+aka+BIG+CHANGO.png", link: "https://open.spotify.com/artist/68gWitVtjgGKIb4uCxYyWE" },
  { name: "Prayzd", genre: "HIP-HOP / RAP", color: "#bc13fe", image: D+"307416537_1086582672018412_159821077530534840_n.jpg", link: "https://www.instagram.com/prayzdofficial/" },
  { name: "Oh It's Chris", genre: "PRODUCER", color: "#00f0ff", image: D+"309860073_1090467918527233_8528524820240210101_n.jpg", link: "https://www.instagram.com/oh_itschris" },
  { name: "There Go My Baby", genre: "SINGER / HIP-HOP", color: "#ff2a6d", image: D+"baby.jpg", link: "https://linktr.ee/there_go_my_baby" },
  { name: "Charwellz", genre: "PRODUCER / ARTIST", color: "#bc13fe", image: D+"DSC09771-21879-c822e2b7.jpg", link: "https://direct.me/charwellz" },
  { name: "Drunk Wizdumb", genre: "ARTIST & PRODUCER", color: "#f5f500", image: D+"wiz2.jpg", link: "https://www.instagram.com/drunkwizdumb/" },
  { name: "Yae 2 Crucial", genre: "SINGER / ENTREPRENEUR", color: "#00f0ff", image: D+"318178096_1766511537068072_4067012985243639104_n.jpg", link: "https://linktr.ee/yae2crucial_mbg" },
  { name: "Southside Hoodlum", genre: "ARTIST / RAPPER", color: "#ff2a6d", image: D+"southside2.remini-enhanced.jpg", link: "https://www.instagram.com/southsidehoodlum/" },
  { name: "Social Ice", genre: "RAPPER / HIP-HOP", color: "#bc13fe", image: D+"socialice2sizedenhanced.png", link: "https://socialice.onuniverse.com/" },
  { name: "Josh Stone", genre: "HIP-HOP / PRODUCER", color: "#00f0ff", image: D+"josh-159b754d.jpg", link: "https://direct.me/etherealvisions" },
  { name: "Cadillac Pac", genre: "SONGWRITER / ARTIST", color: "#ff2a6d", image: D+"192408916_299585495165425_4654335278424267034_n.jpg", link: "https://www.instagram.com/cadillac.pac/" },
  { name: "Baby FaxeKey", genre: "HIP-HOP / RAP", color: "#bc13fe", image: D+"309441450_2210586919101040_3995464088853589218_n.jpg", link: "https://www.instagram.com/babyfaxekey/" },
  { name: "Ryley Hall", genre: "SINGER / ACTOR / PRODUCER", color: "#f5f500", image: D+"310000286_1083968702510320_2538588837469067610_n.jpg", link: "https://www.instagram.com/therealryleyh/" },
  { name: "Mike Dimes", genre: "RAPPER / ARTIST", color: "#00f0ff", image: D+"mikedimes1edited.png", link: "https://www.mikedimesofficial.com/" },
  { name: "Qwest", genre: "ARTIST & 210RAPDAILY", color: "#ff2a6d", image: D+"qwest1.jpg", link: "https://linktr.ee/Qwest97" },
  { name: "Dont3", genre: "PRODUCER / ENGINEER", color: "#bc13fe", image: D+"donte3.jpg", link: "https://www.instagram.com/dont3__/" },
  { name: "Cobe", genre: "HIP-HOP / RAP", color: "#00f0ff", image: D+"309570222_831352241213750_2630612273274988027_n.jpg", link: "https://soundcloud.com/corbincortes" },
  { name: "Alex Graves", genre: "DRUMMER", color: "#ff2a6d", image: D+"IMG_9514.jpg", link: "https://www.instagram.com/alexander_graves/" },
  { name: "Lil Jordiee", genre: "TRAP / RAP", color: "#bc13fe", image: D+"307445058_432354002221542_6441255476222965382_n.jpg", link: "https://linktr.ee/liljordieee" },
  { name: "OH.Tae", genre: "SINGER / SONGWRITER", color: "#f5f500", image: D+"oh.taefinalenhanced.jpg", link: "#" },
  { name: "Kevin McGee", genre: "RECORDING ARTIST", color: "#00f0ff", image: D+"317843073_1557515221339487_5320028854114945150_n.jpg", link: "https://linktr.ee/Kevin_McGee33" },
  // Featured / legacy gallery
  { name: "J-Ro", genre: "HIP-HOP / RAP", color: "#bc13fe", image: D+"307084836_477198427674700_5658475281106553215_n.jpg", link: "https://soundcloud.com/spiritual_jayy" },
  { name: "JusDeno", genre: "PRODUCER / ENGINEER", color: "#00f0ff", image: D+"justdeno1-2597478b.jpg", link: "https://www.instagram.com/jusdeno/" },
  { name: "RYCCHIE", genre: "HIP-HOP / RAP", color: "#ff2a6d", image: D+"309281527_5626103140789292_8459778396902273118_n.jpg", link: "https://www.instagram.com/westsyderycchie_/" },
  { name: "ArtByHallo", genre: "DIGITAL CREATOR", color: "#f5f500", image: D+"art.jpg", link: "https://www.instagram.com/artbyhallo/" },
  { name: "MilesPer Hour", genre: "RAPPER / HIP-HOP", color: "#bc13fe", image: D+"317698012_1145058849482403_8907681085994754992_n.jpg", link: "https://linktr.ee/MilesAheadOfU" },
  { name: "Cxmpst", genre: "SINGER / RAPPER", color: "#00f0ff", image: D+"318174875_532066395236909_5207812801461491892_n.jpg", link: "https://linktr.ee/cxmpst" },
  { name: "KellzontheKeyz", genre: "MUSICIAN", color: "#ff2a6d", image: D2+"265407429_4458370134211401_5767684849342337351_n.jpg", link: "https://distrokid.com/hyperfollow/kellzonthekeyz/lean-on-me-feat-drunk-wizdumb--j-lyricz" },
  { name: "MGE Martian", genre: "RAPPER", color: "#bc13fe", image: D+"318204570_687451232730283_8117795245041700022_n.jpg", link: "https://distrokid.com/hyperfollow/martiangangempire/crash-landing" },
  { name: "DXL0", genre: "RECORDING ARTIST", color: "#00f0ff", image: D+"318327111_1106821736701323_3765197433491707037_n-89b79b8f.jpg", link: "https://direct.me/dxl0" },
  { name: "ImTrying", genre: "SINGER / PRODUCER", color: "#ff2a6d", image: D+"285668783_779859793333722_5128271336913269424_n.jpg", link: "https://linktr.ee/imtryingmusic" },
  { name: "Donov3n", genre: "R&B SINGER", color: "#f5f500", image: D+"dono.jpg", link: "#" },
  { name: "Naalah", genre: "HIP-HOP / SINGER", color: "#bc13fe", image: D+"318329086_2367344466761297_7370371116563724899_n.jpg", link: "https://songwhip.com/naalah" },
  { name: "98Priest", genre: "HIP-HOP / RAP", color: "#00f0ff", image: D+"98.jpg", link: "https://linktr.ee/98Priest" },
  { name: "King Kyle Lee", genre: "ARTIST / RAPPER", color: "#ff2a6d", image: D+"kingkylelee.remini-enhanced.jpg", link: "https://www.instagram.com/kingkylelee/" },
  { name: "Zemira Israel", genre: "MUSICIAN / BAND", color: "#bc13fe", image: D2+"Zemira+Israel+in+Yellow.-enhanced.jpg", link: "#" },
  { name: "Highstrung", genre: "RAPPER", color: "#f5f500", image: D2+"Highstrung+cover+photo.jpg", link: "https://youtu.be/l3sBIa5D-eM" },
  { name: "Diemasua", genre: "PRODUCER / ENGINEER", color: "#00f0ff", image: D+"studioshoot1.1-a4088a78.jpg", link: "https://linktr.ee/Diemasua" },
  { name: "Mandi Castillo", genre: "SINGER (THE VOICE)", color: "#ff2a6d", image: D2+"93754192_912595149169693_8768392322471238618_n.jpg", link: "#" },
  { name: "Nothing More", genre: "GRAMMY NOMINATED", color: "#bc13fe", image: D2+"nothing+more+band+news-c95cb205.jpg", link: "https://nothingmore.net/" },
  { name: "Daniela Riojas", genre: "MELODIC ARTIST", color: "#00f0ff", image: D2+"Daniela+Riojas+news.jpg", link: "https://www.intikhana.com/" },
  { name: "Ada Fox", genre: "ARTIST (AMERICAN IDOL)", color: "#ff2a6d", image: D2+"Ada+Fox+news.jpg", link: "http://officialadavox.com/" },
  { name: "Paris DE'VIL", genre: "THE RAPPIN VIXEN", color: "#f5f500", image: D+"251197220_313292916913047_4731661691202797447_n.jpg", link: "https://www.instagram.com/parisde.vil/" },
  { name: "Only3ree", genre: "PRODUCER / ARTIST", color: "#bc13fe", image: D+"242200070_3064334203807563_6398107681307218950_n.jpg", link: "https://linktr.ee/3.southeast" },
  { name: "PrayxPlot", genre: "DESIGNER / STYLIST", color: "#00f0ff", image: D+"310446344_807708363839795_7045360168989618415_n.jpg", link: "https://linktr.ee/prayxplot" },
  { name: "Xavier Omar", genre: "R&B ARTIST", color: "#ff2a6d", image: D2+"92459770_149625583210356_3344583156725818603_n.jpg", link: "#" },
  { name: "Blake", genre: "ATLANTIC RECORDS", color: "#bc13fe", image: D2+"blake+news.jpg", link: "#" },
  { name: "House of KENZO", genre: "LIVE BAND", color: "#f5f500", image: D2+"House+of+KENZO.jpeg", link: "#" },
];

// ============================================================
// ARTIST CARD — hex avatar with real image + holographic hover
// ============================================================
function ArtistCard({ name, genre, color, index, image, link }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const delay = Math.min(index * 0.03, 0.8);
  const hasLink = link && link !== "#";

  const Wrapper = hasLink ? "a" : "div";
  const wrapperProps = hasLink ? { href: link, target: "_blank", rel: "noopener noreferrer", style: { textDecoration: "none" } } : {};

  return (
    <Wrapper
      {...wrapperProps}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...wrapperProps.style,
        position: "relative", cursor: hasLink ? "pointer" : "default",
        animation: `cardFadeIn 0.5s ${delay}s ease-out both`,
        opacity: 0, display: "block",
      }}
    >
      <div style={{
        background: hov ? `${color}0a` : "rgba(10,0,16,0.85)",
        border: `1px solid ${hov ? color + "55" : "rgba(188,19,254,0.12)"}`,
        padding: "20px 16px 16px", textAlign: "center",
        transition: "all 0.35s ease",
        transform: hov ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hov ? `0 0 25px ${color}22, 0 8px 30px rgba(0,0,0,0.3)` : "0 2px 10px rgba(0,0,0,0.2)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Holographic sweep */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
          transform: hov ? "translateX(200%)" : "translateX(-200%)",
          transition: "transform 0.6s ease",
          pointerEvents: "none", zIndex: 1,
        }} />

        {/* Corner accents */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`, opacity: hov ? 0.6 : 0.15, transition: "opacity 0.3s" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`, opacity: hov ? 0.6 : 0.15, transition: "opacity 0.3s" }} />

        {/* Hex avatar with real image */}
        <div style={{
          width: 72, height: 72, margin: "0 auto 12px",
          clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          WebkitClipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          position: "relative", overflow: "hidden",
          border: `1.5px solid ${hov ? color : color + "33"}`,
          transition: "all 0.3s",
          boxShadow: hov ? `0 0 15px ${color}33` : "none",
        }}>
          {image && !imgErr ? (
            <img
              src={image}
              alt={name}
              onError={() => setImgErr(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                filter: hov ? "brightness(1.1)" : "brightness(0.85) saturate(0.8)",
                transition: "filter 0.3s",
              }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: `linear-gradient(135deg, ${color}22, ${color}08)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 18, color: color + "88", letterSpacing: "0.1em" }}>{initials}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: "0.08em",
          color: hov ? "#e0d0ff" : "#a78bca", margin: "0 0 4px", fontWeight: 400,
          transition: "color 0.3s", lineHeight: 1.3, position: "relative", zIndex: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{name}</h3>

        {/* Genre tag */}
        <div style={{ fontSize: 8, letterSpacing: "0.15em", color: hov ? color : "#5b4a7a", transition: "color 0.3s", position: "relative", zIndex: 2 }}>{genre}</div>

        {/* Bottom glow line */}
        <div style={{
          height: 1, marginTop: 10,
          background: hov ? `linear-gradient(90deg, transparent, ${color}, transparent)` : "linear-gradient(90deg, transparent, rgba(188,19,254,0.1), transparent)",
          transition: "all 0.3s",
        }} />
      </div>
    </Wrapper>
  );
}

// ============================================================
// TONE ZONE GALLERY
// ============================================================
function ToneZoneGallery() {
  const [filter, setFilter] = useState("ALL");
  const [showAll, setShowAll] = useState(false);

  const genres = ["ALL", "HIP-HOP", "R&B", "PRODUCER", "SINGER", "OTHER"];

  const filtered = filter === "ALL"
    ? TONE_ZONE_ARTISTS
    : TONE_ZONE_ARTISTS.filter(a => {
        const g = a.genre.toUpperCase();
        if (filter === "HIP-HOP") return g.includes("HIP-HOP") || g.includes("RAP") || g.includes("TRAP") || g.includes("RAPPER");
        if (filter === "R&B") return g.includes("R&B") || g.includes("RNB") || g.includes("MELODIC");
        if (filter === "PRODUCER") return g.includes("PRODUCER") || g.includes("ENGINEER") || g.includes("DJ");
        if (filter === "SINGER") return g.includes("SINGER") || g.includes("SONGWRITER") || g.includes("MUSICIAN") || g.includes("BAND");
        return !g.includes("HIP-HOP") && !g.includes("RAP") && !g.includes("R&B") && !g.includes("PRODUCER") && !g.includes("SINGER");
      });

  const visible = showAll ? filtered : filtered.slice(0, 24);

  return (
    <section id="tone-zone" style={{ padding: "20px 24px 60px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader
          label="REPPIN 210"
          title="THE TONE ZONE"
          subtitle="Local Artists, Producers, and DJs in San Antonio, TX. This is a free showcase — discover the 210's finest talent."
        />

        {/* Genre filter bar */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          {genres.map(g => (
            <button
              key={g}
              onClick={() => { setFilter(g); setShowAll(false); }}
              style={{
                background: filter === g ? "rgba(188,19,254,0.15)" : "transparent",
                border: `1px solid ${filter === g ? "#bc13fe" : "rgba(188,19,254,0.15)"}`,
                color: filter === g ? "#bc13fe" : "#5b4a7a",
                padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em",
                cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                transition: "all 0.2s",
                clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
                WebkitClipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
              }}
            >{g}</button>
          ))}
        </div>

        {/* Artist count */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, letterSpacing: "0.2em", color: "#3d2060" }}>
          SHOWING {visible.length} OF {filtered.length} ARTISTS
        </div>

        {/* Artist grid */}
        <div className="artist-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12, marginTop: 24,
        }}>
          {visible.map((artist, i) => (
            <ArtistCard key={artist.name} {...artist} index={i} />
          ))}
        </div>

        {/* Show more button */}
        {filtered.length > 24 && !showAll && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={() => setShowAll(true)}
              style={{
                background: "transparent", border: "1px solid rgba(188,19,254,0.3)",
                color: "#8b7aaa", padding: "12px 32px", fontSize: 11, letterSpacing: "0.2em",
                cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                transition: "all 0.3s",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              }}
            >SHOW ALL {filtered.length} ARTISTS</button>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// FREE SERVICE CALLOUT
// ============================================================
function FreeServiceCallout() {
  return (
    <section style={{ padding: "40px 24px", position: "relative", zIndex: 2 }}>
      <div style={{
        maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "40px 28px",
        background: "rgba(0,240,255,0.02)", border: "1px solid rgba(0,240,255,0.15)",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#00f0ff", marginBottom: 12 }}>FOR THE COMMUNITY</div>
        <h3 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(18px, 3vw, 26px)", color: "#e0d0ff", letterSpacing: "0.15em", fontWeight: 400, margin: "0 0 16px" }}>
          THE TONE ZONE IS <span style={{ color: "#00f0ff", textShadow: "0 0 10px rgba(0,240,255,0.4)" }}>100% FREE</span>
        </h3>
        <p style={{ color: "#8b7aaa", fontSize: 13, lineHeight: 1.8, maxWidth: 550, margin: "0 auto 20px" }}>
          Whether you're an artist looking for exposure or a music lover discovering San Antonio's talent, The Tone Zone is open to everyone. No account needed, no fees, no gatekeeping. Just great music from the 210.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/contact" style={{
            display: "inline-block", background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05))",
            border: "1px solid rgba(0,240,255,0.3)", color: "#00f0ff",
            padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em",
            textDecoration: "none", fontFamily: "'Share Tech Mono', monospace",
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
          }}>SUBMIT YOUR MUSIC</a>
          <a href="/amplify" style={{
            display: "inline-block", background: "transparent",
            border: "1px solid rgba(188,19,254,0.3)", color: "#8b7aaa",
            padding: "12px 28px", fontSize: 11, letterSpacing: "0.2em",
            textDecoration: "none", fontFamily: "'Share Tech Mono', monospace",
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            WebkitClipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
          }}>JOIN AMPLIFY</a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// BLOG SECTIONS — PLACEHOLDERS
// ============================================================
function BlogPlaceholder({ label, title, subtitle, tag }) {
  const placeholders = [
    { title: "Coming Soon", desc: "New content drops weekly. Stay tuned.", color: "#bc13fe" },
    { title: "Coming Soon", desc: "Artist spotlights, tips, and more.", color: "#00f0ff" },
    { title: "Coming Soon", desc: "Fresh perspectives from the 210.", color: "#ff2a6d" },
  ];

  return (
    <section style={{ padding: "40px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionHeader label={label} title={title} subtitle={subtitle} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginTop: 32 }}>
          {placeholders.map((p, i) => (
            <div key={i} style={{
              background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.1)",
              padding: "32px 20px", textAlign: "center",
            }}>
              <div style={{ width: 40, height: 40, margin: "0 auto 16px", border: `1px dashed ${p.color}33`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: p.color, fontSize: 16 }}>◈</span>
              </div>
              <h4 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "#5b4a7a", letterSpacing: "0.15em", margin: "0 0 8px" }}>{p.title}</h4>
              <p style={{ fontSize: 11, color: "#3d2060", letterSpacing: "0.05em", margin: 0 }}>{p.desc}</p>
            </div>
          ))}
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
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={LOGO_URL} alt="Artists Musicians Hub" style={{ height: 60, width: "auto", filter: "drop-shadow(0 0 10px rgba(188,19,254,0.5))", WebkitFilter: "drop-shadow(0 0 10px rgba(188,19,254,0.5))" }} />
          <div style={{ height: 2, width: 60, margin: "12px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {FOOTER_NAV.map(col => (<div key={col.section}><div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#bc13fe", marginBottom: 16, fontFamily: "'Share Tech Mono', monospace" }}>{col.section}</div>{col.links.map(l => (<a key={l.label} href={l.href} style={{ display: "block", color: "#8b7aaa", fontSize: 12, textDecoration: "none", padding: "5px 0" }}>{l.label}</a>))}</div>))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
          {SOCIALS.map(s => (<a key={s.label} href={s.href} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(188,19,254,0.3)", color: "#8b7aaa", fontSize: 12, textDecoration: "none", clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)", WebkitClipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }} title={s.label}>{s.icon}</a>))}
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: "24px auto 0", paddingTop: 20, borderTop: "1px solid rgba(188,19,254,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "#3d2060", fontSize: 10, letterSpacing: "0.15em" }}>© 2026 ARTISTS MUSICIANS HUB. ALL RIGHTS RESERVED.</span>
        <div style={{ display: "flex", gap: 16 }}>{["Privacy", "Terms", "Refunds"].map(l => (<a key={l} href={`/${l.toLowerCase()}`} style={{ color: "#3d2060", fontSize: 10, textDecoration: "none" }}>{l}</a>))}</div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function NewsPage() {
  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />
      <div style={{ position: "relative", zIndex: 2 }}>
        <NewsHero />
        <ToneZoneGallery />
        <FreeServiceCallout />
        <BlogPlaceholder
          label="GET TO KNOW THE CREATIVE"
          title="ARTIST SPOTLIGHTS"
          subtitle="Interviews with the creative minds behind the music. Stories, inspiration, and more."
        />
        <BlogPlaceholder
          label="BOOST YOUR KNOWLEDGE"
          title="GROWTH TIPS"
          subtitle="Tips, resources, and industry insights to level up your music career."
        />
        <Footer />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}body{background:#0a0a0f;-webkit-font-smoothing:antialiased}
        img{max-width:100%;height:auto}a:hover{color:#bc13fe !important}
        button:hover:not(:disabled){box-shadow:0 0 15px rgba(188,19,254,0.3)}
        @keyframes cardFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:480px){.artist-grid{grid-template-columns:repeat(2,1fr) !important}}
      `}</style>
    </div>
  );
}
