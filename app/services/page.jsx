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

function SectionHeader({ label, title }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 8 }}>{label}</div>
      <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(24px, 5vw, 42px)", letterSpacing: "0.2em", color: "#e0d0ff", margin: 0, fontWeight: 400, textShadow: "0 0 15px rgba(188,19,254,0.3)" }}>{title}</h2>
      <div style={{ height: 2, width: 60, margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent)", boxShadow: "0 0 10px rgba(188,19,254,0.5)" }} />
    </div>
  );
}

function ServicesHero() {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 200); }, []);
  return (
    <section style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 40px", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease" }}>
      <div style={{ marginBottom: 24, filter: "drop-shadow(0 0 10px rgba(188,19,254,0.5))" }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ overflow: "visible" }}>
          <circle cx="28" cy="28" r="10" stroke="#bc13fe" strokeWidth="2" fill="rgba(188,19,254,0.08)"><animate attributeName="r" values="9;11;9" dur="3s" repeatCount="indefinite" /></circle>
          <circle cx="28" cy="28" r="18" stroke="#bc13fe" strokeWidth="1" fill="none" strokeDasharray="6,4" opacity="0.5"><animateTransform attributeName="transform" type="rotate" from="0 28 28" to="360 28 28" dur="10s" repeatCount="indefinite" /></circle>
          <circle cx="28" cy="28" r="24" stroke="#00f0ff" strokeWidth="0.5" fill="none" strokeDasharray="3,6" opacity="0.3"><animateTransform attributeName="transform" type="rotate" from="360 28 28" to="0 28 28" dur="15s" repeatCount="indefinite" /></circle>
        </svg>
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "#5b4a7a", marginBottom: 16 }}>WHAT WE OFFER</div>
      <h1 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "clamp(32px, 7vw, 60px)", color: "#e0d0ff", letterSpacing: "0.2em", fontWeight: 400, margin: 0, lineHeight: 1.1, textShadow: "0 0 20px rgba(188,19,254,0.5)" }}>
        OUR <span style={{ color: "#bc13fe", textShadow: "0 0 20px #bc13fe" }}>SERVICES</span>
      </h1>
      <p style={{ color: "#8b7aaa", fontSize: "clamp(12px, 1.6vw, 15px)", letterSpacing: "0.1em", maxWidth: 600, margin: "20px 0 0", lineHeight: 1.8 }}>
        Our leadership team reflects a group of diverse individuals with an amazing depth of experience across the company. The Artists Musicians HUB is home to the most iconic and influential artists, labels &amp; brands in music. We offer online advertisement, social media marketing, and PR services.
      </p>
    </section>
  );
}

// ============================================================
// SERVICE DATA
// ============================================================
const SERVICES = [
  { id: "social-media", title: "SOCIAL MEDIA MANAGEMENT", color: "#bc13fe",
    intro: "In the music industry, a strong and engaging social media presence is essential for artists, musicians, and creatives to connect with their audience, grow their fan base, and leave a lasting impression. That's where our Social Media Management services come in — to help you navigate the dynamic world of social media and harness its full potential to drive your music career forward.",
    bullets: [
      { label: "Strategic Planning", desc: "Crafting an effective social media strategy is the foundation of successful online engagement. Our expert team will work closely with you to understand your music, brand, and goals. We then develop a tailored plan that aligns with your vision and resonates with your target audience." },
      { label: "Content Creation", desc: "Consistent and compelling content is at the heart of social media success. Our skilled content creators will curate, design, and produce high-quality posts, stories, videos, and graphics that capture your unique style and captivate your followers." },
      { label: "Audience Engagement", desc: "Engaging with your audience is key to building a loyal fan base. We manage interactions, respond to comments and messages, and create a two-way conversation that fosters a deeper connection between you and your fans." },
      { label: "Posting Schedule", desc: "Timing is crucial in the world of social media. We optimize your posting schedule to ensure that your content reaches your audience when they're most active, enhancing visibility and engagement." },
      { label: "Platform Expertise", desc: "Different platforms require different approaches. Whether it's Instagram, Facebook, Twitter, TikTok, or others, our team understands the nuances of each platform and tailors content to maximize impact." },
      { label: "Data-Driven Insights", desc: "Making informed decisions is vital for growth. We analyze data, track performance metrics, and provide insightful reports that give you a clear understanding of what's working and areas for improvement." },
      { label: "Audience Growth", desc: "We implement strategies to organically grow your follower count with genuine, interested fans who align with your music and brand." },
      { label: "Brand Consistency", desc: "Your social media presence should reflect your unique identity. We maintain brand consistency across all posts, ensuring a cohesive and memorable representation of your music." },
      { label: "Campaign Management", desc: "From album releases to live events, we create and manage targeted campaigns that generate buzz and excitement among your audience." },
      { label: "Ad Campaigns", desc: "Utilizing paid social media advertising can significantly boost your reach. We design and execute effective ad campaigns that maximize your budget and deliver tangible results." },
      { label: "Stay Ahead of Trends", desc: "Social media trends change rapidly. Our team stays up-to-date with the latest features, tools, and trends to keep your social media strategy fresh and relevant." },
    ],
    closing: "With our Social Media Management services, you'll have a dedicated team working to amplify your online presence, engage your audience, and create a meaningful connection with your fans. Let us take the reins of your social media, allowing you to focus on what you do best — creating music that resonates and impacts.",
  },
  { id: "ads-campaigns", title: "ADS / CAMPAIGN MANAGEMENT", color: "#00f0ff",
    intro: "Effectively reaching your target audience and standing out amidst the noise requires a strategic approach. At Artists Musicians HUB, we offer Ads and Campaign Management services designed to elevate your music career by leveraging the power of targeted advertising and strategic campaigns.",
    bullets: [
      { label: "Strategic Planning", desc: "Crafting an impactful advertising strategy is essential to achieving your goals. Our experienced team will collaborate with you to understand your music, audience, and objectives. We then develop a customized plan that aligns with your vision and ensures maximum engagement." },
      { label: "Targeted Advertising", desc: "We know that every dollar counts. Our experts employ precise audience targeting, ensuring your ads are seen by those most likely to connect with your music. We optimize demographics, interests, and behaviors to drive engagement and conversions." },
      { label: "Compelling Creatives", desc: "Captivating visuals and compelling ad copy are key to capturing attention. Our skilled creative team designs eye-catching visuals and writes persuasive ad copy that resonates with your audience and communicates your unique brand." },
      { label: "Platform Expertise", desc: "Different platforms require different approaches. Whether it's Facebook, Instagram, TikTok, YouTube, or others, we tailor ads for each platform, ensuring maximum impact and engagement." },
      { label: "Ad Campaigns", desc: "From album releases and music videos to live events and merchandise drops, our team conceptualizes and executes targeted ad campaigns that generate excitement and anticipation among your audience." },
      { label: "Budget Optimization", desc: "We ensure your advertising budget is used efficiently. Through constant monitoring and adjustment, we allocate resources where they matter most, maximizing your ROI." },
      { label: "Data-Driven Insights", desc: "Making informed decisions is vital. We analyze performance metrics, providing you with insightful reports that help you understand what's working and identify areas for improvement." },
      { label: "Conversion Tracking", desc: "We implement tracking systems that allow us to measure the success of your campaigns. This data-driven approach ensures we're focusing on strategies that deliver real results." },
      { label: "Remarketing Strategies", desc: "Don't lose potential fans who showed interest. We develop remarketing campaigns that re-engage users who have interacted with your content before, increasing the chances of conversion." },
      { label: "Continuous Optimization", desc: "The digital landscape is dynamic. We continuously optimize campaigns based on real-time data and industry trends to ensure your ads are always relevant and effective." },
    ],
    closing: "With our Ads and Campaign Management services, you'll have a dedicated team working to amplify your music's reach and impact. Let us take your music to the right audience, delivering your message with precision and flair while you focus on creating the music you love.",
  },
  { id: "artist-development", title: "ARTIST DEVELOPMENT", color: "#ff2a6d",
    intro: "Welcome to Artists Musicians HUB's exclusive AMPLIFY Artist Development Program — a transformative journey designed to empower artists like you to reach new heights in your musical career. If you're looking to amplify your talent, expand your reach, and thrive in the competitive music industry, then this program is tailored just for you.",
    bullets: [
      { label: "Personalized Growth Strategy", desc: "We understand that every artist is unique, and so are your goals. Our AMPLIFY program starts with a personalized assessment of your strengths, aspirations, and areas of growth. This enables us to create a customized roadmap that aligns with your artistic vision." },
      { label: "Strategic Guidance", desc: "Success in the music industry requires a well-defined plan. Our experienced mentors provide strategic guidance on various aspects, including music production, branding, marketing, performance, and more." },
      { label: "Comprehensive Skill Enhancement", desc: "Whether you're an emerging artist or an established musician, there's always room to enhance your skills. Our program offers targeted training sessions, workshops, and webinars that address key areas of development." },
      { label: "Networking Opportunities", desc: "The music industry thrives on connections. As an AMPLIFY member, you'll have access to a vibrant community of fellow artists, producers, and industry professionals." },
      { label: "Performance Showcases", desc: "Getting your music out there is essential. AMPLIFY provides platforms to showcase your talent through exclusive performance opportunities. From local gigs to digital showcases." },
      { label: "Sync Licensing & Revenue Streams", desc: "Our program introduces you to the world of sync licensing — a lucrative avenue for artists to earn from their music placements in media. We guide you on preparing your music for sync licensing and help you explore new revenue streams." },
      { label: "Brand Building & Marketing", desc: "Standing out in the digital age requires effective branding and marketing. Our experts guide you in creating a strong online presence, engaging content, and marketing strategies that resonate with your target audience." },
      { label: "Supportive Community", desc: "The journey to success is more enjoyable when shared. Join a community of like-minded artists who uplift and inspire each other. Collaborate, exchange ideas, and celebrate each other's achievements." },
      { label: "Dedicated Support", desc: "As an AMPLIFY member, you're not alone. Our team is committed to your growth and success. From answering your questions to providing timely assistance, we're here to support you every step of the way." },
    ],
    closing: "AMPLIFY is not just a program; it's a transformational experience that propels your music career to new heights. Whether you're an aspiring artist eager to break into the industry or a seasoned musician seeking fresh avenues for growth, AMPLIFY is your partner in realizing your full potential.",
  },
  { id: "app-development", title: "APP DEVELOPMENT", color: "#f5f500",
    intro: "In a world driven by technology, having a customized and user-centric mobile app can greatly amplify your reach as an artist, musician, or producer. Our App Development services are designed to transform your creative vision into a fully functional and engaging app that connects you with your audience like never before.",
    bullets: [
      { label: "Tailored Solutions", desc: "We understand that every artist and musician has a unique style and audience. Our team works closely with you to comprehend your artistic identity and goals, crafting an app that mirrors your brand and resonates with your fans." },
      { label: "Innovative Design", desc: "Our designers excel in merging aesthetics with practicality. We create visually appealing app interfaces that not only captivate users but also provide a seamless and intuitive navigation experience." },
      { label: "User-Centric Functionality", desc: "The success of an app lies in its usability. We develop apps with user-centric designs and features, ensuring that your audience can easily explore your music, art, merchandise, event details, and more." },
      { label: "Cross-Platform Compatibility", desc: "Our app development covers both iOS and Android platforms, ensuring that your app is accessible to a wide range of users with a seamless and consistent experience." },
      { label: "Integration & Engagement", desc: "Whether you need a music player, event calendar, push notifications, in-app purchases for merchandise, or social media links, our development team can integrate features that enhance user engagement." },
      { label: "Personalized Branding", desc: "Your app is an extension of your brand. We incorporate your logo, color scheme, and visual elements throughout the app, ensuring a cohesive and personalized experience." },
      { label: "Technical Excellence", desc: "Our app developers prioritize speed, performance, and security to deliver an app that not only looks great but functions flawlessly." },
    ],
    closing: "From concept to execution, our App Development services are designed to elevate your artistic presence and connect you with your audience in new and exciting ways.",
  },
  { id: "website-development", title: "WEBSITE DEVELOPMENT", color: "#bc13fe",
    intro: "A strong online presence is essential for artists, musicians, producers, and creative individuals. Our Website Development services are designed to help you establish a captivating and user-friendly online platform that showcases your talents, engages your audience, and drives your artistic endeavors forward.",
    bullets: [
      { label: "Tailored Solutions", desc: "We understand that your website is an extension of your artistic identity. Our team collaborates closely with you to understand your unique vision, needs, and goals. We then create a website that resonates with your brand and speaks directly to your audience." },
      { label: "Creative Design", desc: "Our designers are experts at combining aesthetics with functionality. We craft visually stunning websites that not only catch the eye but also provide an intuitive and seamless user experience." },
      { label: "Responsive & Mobile-First", desc: "In today's mobile-centric world, having a responsive website is crucial. Our websites are built to adapt seamlessly to different screen sizes and devices." },
      { label: "User-Centric Navigation", desc: "We prioritize user experience by creating websites with clear and intuitive navigation. Visitors should be able to easily explore your content, music releases, event details, and more." },
      { label: "Integration & Functionality", desc: "Whether you need an integrated music player, an event calendar, a contact form, or an online store, our development team can implement a wide range of functionalities." },
      { label: "SEO Optimization", desc: "A beautiful website is effective only when it can be found. Our websites are built with SEO best practices in mind, making it easier for search engines to index your content and improve your online visibility." },
    ],
    closing: "From creating an impactful homepage to designing user-friendly pages that showcase your music, art, and upcoming events, our Website Development services cater to your every need.",
  },
  { id: "graphic-design", title: "GRAPHIC DESIGN / VFX / MGFX", color: "#00f0ff",
    intro: "",
    subsections: [
      { label: "Graphic Design", desc: "Our Graphic Design services encompass a wide range of visual solutions tailored to your specific needs. From album covers to promotional posters, our designers craft visually appealing graphics that not only communicate your message but also resonate with your target audience. We bring your concepts to life with precision, creativity, and a keen eye for aesthetics." },
      { label: "Visual Effects (VFX)", desc: "In today's dynamic media landscape, VFX can take your videos and performances to the next level. Our VFX experts excel in adding stunning effects, enhancing realism, and creating immersive visual experiences. Whether you're looking to incorporate futuristic elements into a music video or elevate the visual impact of a live performance, our VFX artists are ready to bring your visions to reality." },
      { label: "Motion Graphics (MGFX)", desc: "Motion Graphics combine the power of animation and design to tell stories in motion. Our MGFX services infuse life into your visuals, making them dynamic and engaging. From kinetic typography for lyric videos to animated logos, our motion graphic designers specialize in creating captivating animations that leave a lasting impression." },
    ],
    bullets: [
      { label: "Creativity Unleashed", desc: "Our team thrives on pushing creative boundaries and exploring innovative concepts. We infuse fresh ideas and artistic perspectives into every project." },
      { label: "Tailored Solutions", desc: "We understand that each project is unique. Our services are customized to align with your artistic vision, ensuring the final output reflects your individuality." },
      { label: "Expertise & Skill", desc: "Our designers and visual artists bring a wealth of expertise with a deep understanding of design principles and visual storytelling." },
      { label: "Attention to Detail", desc: "Whether it's intricate details in a graphic design or the seamless integration of VFX, we pay meticulous attention to every element, delivering a polished and professional final product." },
    ],
    closing: "From enhancing your music releases with eye-catching artwork to creating mesmerizing visual effects for your live performances, our Graphic Design, VFX, and MGFX services are here to bring your creative projects to life. Explore the possibilities of visual creativity with Artists Musicians HUB.",
  },
];

// ============================================================
// EXPANDABLE SERVICE SECTION
// ============================================================
function ServiceSection({ service, expanded, onToggle }) {
  const { id, title, color, intro, bullets, closing, subsections } = service;
  return (
    <div id={id} style={{ marginBottom: 12 }}>
      <button onClick={onToggle} style={{ width: "100%", background: expanded ? `${color}08` : "rgba(10,0,16,0.85)", border: `1px solid ${expanded ? color + "44" : "rgba(188,19,254,0.15)"}`, padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, transition: "all 0.3s", fontFamily: "'Share Tech Mono', monospace" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: expanded ? color : color + "44", boxShadow: expanded ? `0 0 10px ${color}` : "none", transition: "all 0.3s" }} />
          <span style={{ fontSize: "clamp(12px, 2vw, 15px)", letterSpacing: "0.15em", color: expanded ? color : "#e0d0ff", textShadow: expanded ? `0 0 8px ${color}44` : "none", transition: "all 0.3s", textAlign: "left" }}>{title}</span>
        </div>
        <span style={{ color: expanded ? color : "#5b4a7a", fontSize: 18, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s, color 0.3s" }}>▾</span>
      </button>
      {expanded && (
        <div style={{ background: "rgba(10,0,16,0.9)", border: `1px solid ${color}22`, borderTop: "none", padding: "28px 24px", animation: "fadeSlide 0.3s ease-out" }}>
          {intro && <p style={{ color: "#a78bca", fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>{intro}</p>}
          {subsections && subsections.map((sub, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <h4 style={{ color, fontSize: 13, letterSpacing: "0.15em", margin: "0 0 8px", fontFamily: "'Share Tech Mono', monospace" }}>{sub.label}</h4>
              <p style={{ color: "#a78bca", fontSize: 12, lineHeight: 1.8, margin: 0, borderLeft: `2px solid ${color}22`, paddingLeft: 14 }}>{sub.desc}</p>
            </div>
          ))}
          {bullets && bullets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {subsections && <h4 style={{ color: "#e0d0ff", fontSize: 12, letterSpacing: "0.15em", margin: "20px 0 12px", fontFamily: "'Share Tech Mono', monospace" }}>WHY CHOOSE US</h4>}
              {bullets.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                  <span style={{ color, fontSize: 10, marginTop: 4, flexShrink: 0 }}>▸</span>
                  <div><span style={{ color: "#e0d0ff", fontSize: 12, fontWeight: "bold" }}>{b.label}: </span><span style={{ color: "#8b7aaa", fontSize: 12, lineHeight: 1.7 }}>{b.desc}</span></div>
                </div>
              ))}
            </div>
          )}
          {closing && (
            <div style={{ borderTop: `1px solid ${color}15`, paddingTop: 16, marginTop: 8 }}>
              <p style={{ color: "#a78bca", fontSize: 12, lineHeight: 1.8, fontStyle: "italic", margin: 0 }}>{closing}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ServicesList() {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <section style={{ padding: "20px 24px 60px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionHeader label="EXPLORE" title="OUR SERVICES" />
        <div style={{ marginTop: 40 }}>
          {SERVICES.map(svc => (
            <ServiceSection key={svc.id} service={svc} expanded={expandedId === svc.id} onToggle={() => setExpandedId(expandedId === svc.id ? null : svc.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// INQUIRY FORM
// ============================================================
function InquiryForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.service) { setStatus("error"); setStatusMsg("PLEASE FILL IN NAME, EMAIL, AND SERVICE"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, subject: `Service Inquiry: ${form.service}`, message: `SERVICE: ${form.service}\nPHONE: ${form.phone || "Not provided"}\n\n${form.message}` }) });
      if (res.ok) { setStatus("success"); setStatusMsg("INQUIRY RECEIVED — WE'LL BE IN TOUCH"); setForm({ name: "", email: "", phone: "", service: "", message: "" }); }
      else { setStatus("error"); setStatusMsg("TRANSMISSION FAILED — TRY AGAIN"); }
    } catch { setStatus("error"); setStatusMsg("TRANSMISSION FAILED — TRY AGAIN"); }
  };
  const inp = { width: "100%", background: "rgba(188,19,254,0.03)", border: "1px solid rgba(188,19,254,0.2)", color: "#e0d0ff", padding: "12px 14px", fontSize: 13, fontFamily: "'Share Tech Mono', monospace", transition: "all 0.2s", letterSpacing: "0.03em" };
  return (
    <section id="inquiry" style={{ padding: "40px 24px 80px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeader label="GET STARTED" title="SERVICE INQUIRY" />
        <p style={{ color: "#8b7aaa", fontSize: 12, textAlign: "center", marginTop: 16, letterSpacing: "0.05em", lineHeight: 1.7 }}>Tell us about your project. No payment required. We will reach out to discuss your needs and build a custom plan.</p>
        <div style={{ marginTop: 32, background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.15)", padding: "28px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="YOUR NAME" value={form.name} onChange={handleChange("name")} style={inp} />
            <input type="email" placeholder="YOUR EMAIL" value={form.email} onChange={handleChange("email")} style={inp} />
          </div>
          <input type="tel" placeholder="PHONE (OPTIONAL)" value={form.phone} onChange={handleChange("phone")} style={{ ...inp, marginBottom: 12 }} />
          <select value={form.service} onChange={handleChange("service")} style={{ ...inp, marginBottom: 12, cursor: "pointer", appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23bc13fe' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L2 5h12z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
            <option value="" style={{ background: "#0a0a0f", color: "#5b4a7a" }}>SELECT A SERVICE</option>
            <option value="Social Media Management" style={{ background: "#0a0a0f" }}>Social Media Management</option>
            <option value="Ads / Campaign Management" style={{ background: "#0a0a0f" }}>Ads / Campaign Management</option>
            <option value="Artist Development" style={{ background: "#0a0a0f" }}>Artist Development</option>
            <option value="App Development" style={{ background: "#0a0a0f" }}>App Development</option>
            <option value="Website Development" style={{ background: "#0a0a0f" }}>Website Development</option>
            <option value="Graphic Design / VFX / MGFX" style={{ background: "#0a0a0f" }}>Graphic Design / VFX / MGFX</option>
            <option value="Other" style={{ background: "#0a0a0f" }}>Other</option>
          </select>
          <textarea placeholder="TELL US ABOUT YOUR PROJECT..." value={form.message} onChange={handleChange("message")} rows={5} style={{ ...inp, resize: "vertical", marginBottom: 16 }} />
          <button onClick={handleSubmit} disabled={status === "loading" || status === "success"} style={{ width: "100%", background: status === "success" ? "rgba(0,240,255,0.1)" : "linear-gradient(135deg, #711c91aa, #bc13feaa)", border: `1px solid ${status === "success" ? "#00f0ff" : "#bc13fe"}`, color: status === "success" ? "#00f0ff" : "#e0d0ff", padding: "14px 24px", fontSize: 13, letterSpacing: "0.2em", cursor: status === "loading" ? "wait" : "pointer", fontFamily: "'Share Tech Mono', monospace", clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)", WebkitClipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)", transition: "all 0.3s", opacity: status === "loading" ? 0.6 : 1 }}>
            {status === "loading" ? "TRANSMITTING..." : status === "success" ? "✓ INQUIRY SENT" : "▶ SUBMIT INQUIRY"}
          </button>
          {statusMsg && <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, letterSpacing: "0.15em", color: status === "success" ? "#00f0ff" : "#ff2a6d" }}>{statusMsg}</p>}
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
  { section: "PROGRAMS", links: [{ label: "AMPLIFY", href: "/amplify" }, { label: "Tone Zone", href: "/news" }, { label: "Blog", href: "/blog" }] },
  { section: "COMMUNITY", links: [{ label: "Ambassadors", href: "/ambassadors" }, { label: "Shop", href: "/shop" }, { label: "Contact", href: "/contact" }] },
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
export default function ServicesPage() {
  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />
      <ElectricGrid />
      <div style={{ position: "relative", zIndex: 2 }}>
        <ServicesHero />
        <ServicesList />
        <InquiryForm />
        <Footer />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}body{background:#0a0a0f;-webkit-font-smoothing:antialiased}
        img{max-width:100%;height:auto}a:hover{color:#bc13fe !important}
        input::placeholder,textarea::placeholder{color:#3d2060}
        input:focus,textarea:focus,select:focus{outline:none;border-color:#bc13fe;box-shadow:0 0 12px rgba(188,19,254,0.2)}
        select option{background:#0a0a0f;color:#e0d0ff}
        button:hover:not(:disabled){box-shadow:0 0 20px rgba(188,19,254,0.4)}
        button:disabled{opacity:0.6;cursor:default}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:600px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important}}
      `}</style>
    </div>
  );
}
