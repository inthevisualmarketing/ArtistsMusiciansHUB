"use client";
import { useState, useEffect } from "react";

function formatDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const LOGO_URL = "https://res.cloudinary.com/dbpremci4/image/upload/w_200,h_200,c_fit/white-hub-logo-transparent";

// ============================================================
// READING PROGRESS BAR
// ============================================================
function ReadingProgress({ color }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("post-content");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ position: "fixed", top: 56, left: 0, right: 0, height: 2, zIndex: 99, background: "rgba(188,19,254,0.1)" }}>
      <div style={{
        height: "100%", width: `${progress}%`,
        background: `linear-gradient(90deg, ${color}, #00f0ff)`,
        boxShadow: `0 0 8px ${color}`,
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}

// ============================================================
// SHARE BUTTONS
// ============================================================
function ShareButtons({ title, slug }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : "";
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title + " — Artists Musicians HUB");

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5b4a7a" }}>SHARE</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`} target="_blank" rel="noopener noreferrer"
        style={{ ...shareBtn, borderColor: "rgba(0,240,255,0.3)", color: "#00f0ff" }}>𝕏</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer"
        style={{ ...shareBtn, borderColor: "rgba(188,19,254,0.3)", color: "#bc13fe" }}>FB</a>
      <button onClick={copyLink}
        style={{ ...shareBtn, borderColor: "rgba(139,122,170,0.3)", color: "#8b7aaa", cursor: "pointer", background: "transparent" }}>COPY</button>
    </div>
  );
}
const shareBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 28, border: "1px solid", borderRadius: 0,
  fontSize: 10, letterSpacing: "0.1em", textDecoration: "none",
  fontFamily: "'Share Tech Mono', monospace",
  clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)",
};

// ============================================================
// RELATED POSTS
// ============================================================
function RelatedPosts({ related, categories }) {
  if (!related || related.length === 0) return null;

  return (
    <section style={{ padding: "40px 0", borderTop: "1px solid rgba(188,19,254,0.1)" }}>
      <h3 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, letterSpacing: "0.2em", color: "#e0d0ff", margin: "0 0 24px", textShadow: "0 0 10px rgba(188,19,254,0.2)" }}>RELATED POSTS</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {related.map(post => {
          const cat = categories.find(c => c.id === post.category);
          return (
            <a key={post.slug} href={`/blog/${post.slug}`} style={{
              display: "block", textDecoration: "none",
              background: "rgba(10,0,16,0.8)", border: "1px solid rgba(188,19,254,0.1)",
              padding: "20px 16px", transition: "all 0.3s",
            }}>
              <span style={{ fontSize: 9, letterSpacing: "0.15em", color: cat?.color || "#5b4a7a", textShadow: `0 0 6px ${(cat?.color || "#bc13fe")}55` }}>{cat?.label}</span>
              <h4 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#e0d0ff", margin: "8px 0 6px", fontWeight: 400, lineHeight: 1.4 }}>{post.title}</h4>
              <span style={{ fontSize: 9, color: "#5b4a7a" }}>{post.readTime} MIN READ</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================
// MARKDOWN-LITE RENDERER
// ============================================================
function renderContent(content) {
  if (!content) return null;
  const lines = content.trim().split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule / section break
    if (line.trim() === "---") {
      elements.push(
        <div key={i} style={{
          margin: "36px 0", display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(188,19,254,0.25), transparent)" }} />
          <span style={{ color: "#bc13fe", fontSize: 10, opacity: 0.5, textShadow: "0 0 6px rgba(188,19,254,0.4)" }}>◈</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(188,19,254,0.25), transparent)" }} />
        </div>
      );
      i++; continue;
    }

    // Image placeholder — [image: description]
    if (line.trim().startsWith("[image:")) {
      const desc = line.trim().slice(7, -1).trim();
      elements.push(
        <div key={i} style={{
          margin: "28px 0", padding: "32px 20px", textAlign: "center",
          background: "rgba(188,19,254,0.03)", border: "1px dashed rgba(188,19,254,0.2)",
        }}>
          <div style={{ fontSize: 20, color: "#bc13fe", opacity: 0.35, marginBottom: 8, textShadow: "0 0 8px rgba(188,19,254,0.3)" }}>◈</div>
          <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "#5b4a7a" }}>{desc || "IMAGE"}</span>
        </div>
      );
      i++; continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 18, color: "#ffffff",
          letterSpacing: "0.1em", margin: "36px 0 16px", fontWeight: 400, lineHeight: 1.3,
          borderLeft: "3px solid #bc13fe", paddingLeft: 16,
          boxShadow: "inset 3px 0 8px rgba(188,19,254,0.3)",
          textShadow: "0 0 10px rgba(188,19,254,0.2)",
        }}>{line.slice(3)}</h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 15, color: "#e0d0ff",
          letterSpacing: "0.08em", margin: "28px 0 12px", fontWeight: 400,
        }}>{line.slice(4)}</h3>
      );
      i++; continue;
    }

    // Bold line (starts with **)
    if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} style={{ color: "#e0d0ff", fontSize: 14, margin: "16px 0 8px", fontWeight: 400, letterSpacing: "0.02em" }}>
          {line.slice(2, -2)}
        </p>
      );
      i++; continue;
    }

    // List item
    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "8px 0 16px", paddingLeft: 20 }}>
          {items.map((item, j) => (
            <li key={j} style={{ color: "#8b7aaa", fontSize: 14, lineHeight: 1.8, marginBottom: 4, listStyleType: "none", position: "relative", paddingLeft: 16 }}>
              <span style={{ position: "absolute", left: 0, color: "#bc13fe" }}>›</span>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "8px 0 16px", paddingLeft: 20, counterReset: "item" }}>
          {items.map((item, j) => (
            <li key={j} style={{ color: "#8b7aaa", fontSize: 14, lineHeight: 1.8, marginBottom: 4, listStyleType: "none", position: "relative", paddingLeft: 20 }}>
              <span style={{ position: "absolute", left: 0, color: "#00f0ff", fontFamily: "'Share Tech Mono', monospace", fontSize: 12 }}>{j + 1}.</span>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Italic line (starts with *)
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      elements.push(
        <p key={i} style={{ color: "#5b4a7a", fontSize: 13, fontStyle: "italic", margin: "16px 0", lineHeight: 1.7 }}>
          {line.slice(1, -1)}
        </p>
      );
      i++; continue;
    }

    // Empty line
    if (line.trim() === "") { i++; continue; }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ color: "#8b7aaa", fontSize: 14, lineHeight: 1.9, margin: "12px 0" }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function renderInline(text) {
  // Simple bold handling within text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "#e0d0ff", fontWeight: 400 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ============================================================
// BLOG POST PAGE
// ============================================================
export default function BlogPostClient({ post, related, categories }) {
  const cat = post ? categories.find(c => c.id === post.category) : null;
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 200); }, []);

  if (!post) {
    return (
      <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', monospace", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
        <h1 style={{ fontSize: 48, color: "#bc13fe", margin: "0 0 16px", textShadow: "0 0 20px #bc13fe" }}>404</h1>
        <p style={{ color: "#5b4a7a", fontSize: 13, letterSpacing: "0.2em" }}>POST NOT FOUND</p>
        <a href="/blog" style={{ color: "#00f0ff", fontSize: 12, marginTop: 24, textDecoration: "none" }}>← BACK TO BLOG</a>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0f", color: "#e0d0ff", fontFamily: "'Share Tech Mono', 'Courier New', monospace", minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(188,19,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(188,19,254,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)" }} />

      <ReadingProgress color={cat?.color || "#bc13fe"} />

      <div id="post-content" style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <header style={{
          padding: "100px 24px 40px", maxWidth: 720, margin: "0 auto", textAlign: "center",
          opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease",
        }}>
          {/* Back link */}
          <a href="/blog" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5b4a7a", textDecoration: "none", display: "inline-block", marginBottom: 24 }}>
            ← BACK TO BLOG
          </a>

          {/* Category badge */}
          <div style={{
            display: "inline-block", padding: "6px 16px", marginBottom: 20,
            border: `1px solid ${cat?.color || "#bc13fe"}44`,
            fontSize: 9, letterSpacing: "0.25em", color: cat?.color || "#bc13fe",
            clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
            textShadow: `0 0 8px ${(cat?.color || "#bc13fe")}66`,
            boxShadow: `0 0 10px ${(cat?.color || "#bc13fe")}15`,
          }}>{cat?.label}</div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "clamp(24px, 5vw, 38px)", letterSpacing: "0.08em",
            color: "#e0d0ff", fontWeight: 400, margin: "0 0 20px", lineHeight: 1.3,
            textShadow: "0 0 15px rgba(188,19,254,0.2)",
          }}>{post.title}</h1>

          {/* Meta */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#5b4a7a" }}>{formatDate(post.date)}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#3d2060" }} />
            <span style={{ fontSize: 11, color: "#5b4a7a" }}>{post.readTime} MIN READ</span>
          </div>

          {/* Divider */}
          <div style={{ height: 2, width: 60, margin: "28px auto 0", background: `linear-gradient(90deg, transparent, ${cat?.color || "#bc13fe"}, transparent)`, boxShadow: `0 0 10px ${(cat?.color || "#bc13fe")}88` }} />
        </header>

        {/* Featured image */}
        {post.image && (
          <div style={{ maxWidth: 720, margin: "0 auto 40px", padding: "0 24px" }}>
            <div style={{
              overflow: "hidden", border: "1px solid rgba(188,19,254,0.1)",
              boxShadow: "0 0 30px rgba(188,19,254,0.08)",
            }}>
              <img src={post.image} alt={post.title} style={{
                width: "100%", height: "auto", maxHeight: 400, objectFit: "cover",
                filter: "brightness(0.85) saturate(0.9)",
              }} />
            </div>
          </div>
        )}

        {/* Content */}
        <article style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 40px" }}>
          {renderContent(post.content)}
        </article>

        {/* Bottom bar — share + related */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ borderTop: "1px solid rgba(188,19,254,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <ShareButtons title={post.title} slug={post.slug} />
            <a href="/blog" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5b4a7a", textDecoration: "none" }}>← ALL POSTS</a>
          </div>

          <RelatedPosts related={related} categories={categories} />
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(188,19,254,0.15)", padding: "32px 24px", background: "rgba(5,0,10,0.6)" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <img src={LOGO_URL} alt="AMH" style={{ height: 40, filter: "drop-shadow(0 0 8px rgba(188,19,254,0.4))" }} />
            <p style={{ color: "#3d2060", fontSize: 10, letterSpacing: "0.15em", marginTop: 12 }}>© 2026 ARTISTS MUSICIANS HUB</p>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}body{background:#0a0a0f;-webkit-font-smoothing:antialiased}
        a:hover{color:#bc13fe !important}
      `}</style>
    </div>
  );
}
