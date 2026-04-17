// Run from project root: node patch-news-blog.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app', 'news', 'page.jsx');
let code = fs.readFileSync(file, 'utf-8');

// OLD: BlogPlaceholder component
const oldComponent = `// BLOG SECTIONS — PLACEHOLDERS
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
              <div style={{ width: 40, height: 40, margin: "0 auto 16px", border: \`1px dashed \${p.color}33\`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
}`;

// NEW: BlogPreview component with real posts
const newComponent = `// BLOG SECTIONS — LIVE PREVIEWS
// ============================================================
const SPOTLIGHT_POSTS = [
  { slug: "producer-spotlight-oh-its-chris", title: "Producer Spotlight: Oh It's Chris", date: "2023-01-31", excerpt: "From deathcore bands in the RGV to melodic trap in SA.", color: "#bc13fe" },
  { slug: "artist-spotlight-social-ice", title: "Artist Spotlight: Social Ice", date: "2023-01-14", excerpt: "100K streams on Roll The Dice — quarantine rapper turned contender.", color: "#00f0ff" },
  { slug: "artist-spotlight-miles-per-hour", title: "Artist Spotlight: Miles Per Hour", date: "2023-01-10", excerpt: "Drums in church to solo career. His birthday bash at the HUB was everything.", color: "#ff2a6d" },
];

const GROWTH_POSTS = [
  { slug: "how-to-turn-your-passion-into-a-sustainable-career", title: "Turn Your Passion Into a Career", date: "2023-01-27", excerpt: "Talent alone doesn't pay bills. Treat your music like a business.", color: "#00f0ff" },
  { slug: "have-a-plan-music-licensing-distribution", title: "Have a Plan: Licensing & Distribution", date: "2023-01-13", excerpt: "Without a strategy, you're leaving money on the table.", color: "#bc13fe" },
  { slug: "why-building-relationships-in-the-music-industry-matters", title: "Why Relationships Matter", date: "2023-01-06", excerpt: "Talent opens the door. Relationships keep it open.", color: "#ff2a6d" },
];

function BlogPreview({ label, title, subtitle, posts }) {
  return (
    <section style={{ padding: "40px 24px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionHeader label={label} title={title} subtitle={subtitle} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginTop: 32 }}>
          {posts.map((p, i) => (
            <a key={i} href={\`/blog/\${p.slug}\`} style={{
              background: "rgba(10,0,16,0.85)", border: "1px solid rgba(188,19,254,0.15)",
              padding: "28px 20px", textAlign: "left", textDecoration: "none",
              transition: "all 0.3s", cursor: "pointer", display: "block",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.boxShadow = \`0 0 20px \${p.color}33\`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(188,19,254,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 10, color: "#5b4a7a", letterSpacing: "0.2em", marginBottom: 10, fontFamily: "'Share Tech Mono', monospace" }}>
                {new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </div>
              <h4 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: "#e0d0ff", letterSpacing: "0.08em", margin: "0 0 10px", lineHeight: 1.4 }}>{p.title}</h4>
              <p style={{ fontSize: 11, color: "#8b7aaa", letterSpacing: "0.03em", margin: "0 0 14px", lineHeight: 1.5 }}>{p.excerpt}</p>
              <span style={{ fontSize: 10, color: p.color, letterSpacing: "0.2em", fontFamily: "'Share Tech Mono', monospace", textShadow: \`0 0 8px \${p.color}66\` }}>READ MORE \\u2192</span>
            </a>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/blog" style={{
            display: "inline-block", padding: "10px 28px", border: "1px solid rgba(188,19,254,0.3)",
            color: "#bc13fe", fontSize: 11, letterSpacing: "0.25em", textDecoration: "none",
            fontFamily: "'Share Tech Mono', monospace", transition: "all 0.3s",
            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#bc13fe"; e.currentTarget.style.boxShadow = "0 0 15px rgba(188,19,254,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(188,19,254,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
          >VIEW ALL POSTS</a>
        </div>
      </div>
    </section>
  );
}`;

// Replace component
if (code.includes('BlogPlaceholder({ label, title, subtitle, tag })')) {
  code = code.replace(oldComponent, newComponent);
  console.log('✓ Replaced BlogPlaceholder component with BlogPreview');
} else {
  console.log('✗ Could not find BlogPlaceholder component — may already be updated');
}

// Replace render calls
const oldRender1 = `        <BlogPlaceholder
          label="GET TO KNOW THE CREATIVE"
          title="ARTIST SPOTLIGHTS"
          subtitle="Interviews with the creative minds behind the music. Stories, inspiration, and more."
        />`;
const newRender1 = `        <BlogPreview
          label="GET TO KNOW THE CREATIVE"
          title="ARTIST SPOTLIGHTS"
          subtitle="Interviews with the creative minds behind the music. Stories, inspiration, and more."
          posts={SPOTLIGHT_POSTS}
        />`;

const oldRender2 = `        <BlogPlaceholder
          label="BOOST YOUR KNOWLEDGE"
          title="GROWTH TIPS"
          subtitle="Tips, resources, and industry insights to level up your music career."
        />`;
const newRender2 = `        <BlogPreview
          label="BOOST YOUR KNOWLEDGE"
          title="GROWTH TIPS"
          subtitle="Tips, resources, and industry insights to level up your music career."
          posts={GROWTH_POSTS}
        />`;

if (code.includes('BlogPlaceholder')) {
  code = code.replace(oldRender1, newRender1);
  code = code.replace(oldRender2, newRender2);
  console.log('✓ Updated render calls');
} else {
  console.log('✓ Render calls already updated');
}

fs.writeFileSync(file, code, 'utf-8');
console.log('✓ Saved to', file);
console.log('');
console.log('Run: npm run build');
