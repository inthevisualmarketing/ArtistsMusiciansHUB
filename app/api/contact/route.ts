import { NextRequest, NextResponse } from "next/server";

// Helper to send via Mailgun
async function sendMail(
  apiKey: string,
  domain: string,
  params: Record<string, string>
) {
  const form = new URLSearchParams(params);
  const response = await fetch(
    `https://api.mailgun.net/v3/${domain}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    }
  );
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
    const AMH_EMAIL = "artists.musicians.hub@gmail.com";

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error("Mailgun env vars missing");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // ─────────────────────────────────────────────
    // 1. NOTIFICATION TO AMH
    // ─────────────────────────────────────────────
    const notifyRes = await sendMail(MAILGUN_API_KEY, MAILGUN_DOMAIN, {
      from: `AMH Contact Form <noreply@${MAILGUN_DOMAIN}>`,
      to: AMH_EMAIL,
      "h:Reply-To": email,
      subject: `[AMH Contact] ${subject || "New Message"} — from ${name}`,
      html: `
        <div style="font-family: 'Courier New', monospace; background: #0a0a0f; color: #e0d0ff; padding: 32px; max-width: 600px;">
          <div style="border: 1px solid #bc13fe33; padding: 24px; background: #0d022166;">
            <h2 style="color: #bc13fe; font-size: 14px; letter-spacing: 3px; margin: 0 0 20px; border-bottom: 1px solid #bc13fe22; padding-bottom: 12px;">
              NEW CONTACT FORM SUBMISSION
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #5b4a7a; font-size: 11px; letter-spacing: 2px; padding: 8px 0; vertical-align: top; width: 80px;">NAME</td>
                <td style="color: #e0d0ff; font-size: 13px; padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="color: #5b4a7a; font-size: 11px; letter-spacing: 2px; padding: 8px 0; vertical-align: top;">EMAIL</td>
                <td style="color: #00f0ff; font-size: 13px; padding: 8px 0;"><a href="mailto:${email}" style="color: #00f0ff;">${email}</a></td>
              </tr>
              <tr>
                <td style="color: #5b4a7a; font-size: 11px; letter-spacing: 2px; padding: 8px 0; vertical-align: top;">SUBJECT</td>
                <td style="color: #e0d0ff; font-size: 13px; padding: 8px 0;">${subject || "(none)"}</td>
              </tr>
            </table>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #bc13fe22;">
              <div style="color: #5b4a7a; font-size: 11px; letter-spacing: 2px; margin-bottom: 8px;">MESSAGE</div>
              <div style="color: #a78bca; font-size: 13px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
            </div>
            <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #bc13fe11; color: #3d2060; font-size: 10px; letter-spacing: 1px;">
              Received ${timestamp} CST via artistsmusicianshub.com
            </div>
          </div>
        </div>
      `,
      text: `New contact from ${name} (${email})\nSubject: ${subject || "(none)"}\n\n${message}\n\n---\nReceived ${timestamp} CST`,
    });

    if (!notifyRes.ok) {
      const err = await notifyRes.text();
      console.error("Mailgun notify error:", notifyRes.status, err);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    // ─────────────────────────────────────────────
    // 2. AUTO-REPLY TO USER
    // ─────────────────────────────────────────────
    try {
      await sendMail(MAILGUN_API_KEY, MAILGUN_DOMAIN, {
        from: `Artists Musicians HUB <noreply@${MAILGUN_DOMAIN}>`,
        to: email,
        "h:Reply-To": AMH_EMAIL,
        subject: "We Got Your Message — Artists Musicians HUB",
        html: `
          <div style="font-family: 'Courier New', monospace; background: #0a0a0f; color: #e0d0ff; padding: 0; max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0d0221, #1a0533); padding: 32px 24px; text-align: center; border-bottom: 2px solid #bc13fe44;">
              <div style="font-size: 28px; letter-spacing: 8px; color: #e0d0ff;">AMH</div>
              <div style="font-size: 10px; letter-spacing: 4px; color: #5b4a7a; margin-top: 6px;">ARTISTS MUSICIANS HUB</div>
              <div style="height: 2px; width: 60px; background: linear-gradient(90deg, transparent, #bc13fe, #00f0ff, transparent); margin: 14px auto 0;"></div>
            </div>

            <!-- Body -->
            <div style="padding: 32px 24px; background: #0a0a0f;">
              <div style="font-size: 10px; letter-spacing: 3px; color: #bc13fe; margin-bottom: 16px;">TRANSMISSION RECEIVED</div>

              <p style="color: #e0d0ff; font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
                Hey ${name},
              </p>

              <p style="color: #a78bca; font-size: 13px; line-height: 1.8; margin: 0 0 16px;">
                We got your message and appreciate you reaching out to the HUB. Our team will review your inquiry and get back to you within <span style="color: #00f0ff;">24-48 hours</span>.
              </p>

              <p style="color: #a78bca; font-size: 13px; line-height: 1.8; margin: 0 0 24px;">
                In the meantime, feel free to explore what we have to offer:
              </p>

              <!-- Quick Links -->
              <div style="margin-bottom: 24px;">
                <a href="https://artistsmusicianshub.com/amplify" style="display: inline-block; color: #bc13fe; font-size: 11px; letter-spacing: 2px; text-decoration: none; border: 1px solid #bc13fe44; padding: 10px 20px; margin: 0 8px 8px 0;">&#9650; AMPLIFY PROGRAM</a>
                <a href="https://artistsmusicianshub.com/news" style="display: inline-block; color: #00f0ff; font-size: 11px; letter-spacing: 2px; text-decoration: none; border: 1px solid #00f0ff44; padding: 10px 20px; margin: 0 8px 8px 0;">&#9672; THE TONE ZONE</a>
                <a href="https://artistsmusicianshub.com/about" style="display: inline-block; color: #8b7aaa; font-size: 11px; letter-spacing: 2px; text-decoration: none; border: 1px solid #8b7aaa44; padding: 10px 20px; margin: 0 8px 8px 0;">&#9678; ABOUT US</a>
              </div>

              <!-- Echo back their message -->
              <div style="background: #0d022188; border-left: 2px solid #bc13fe44; padding: 16px 20px; margin-bottom: 24px;">
                <div style="font-size: 9px; letter-spacing: 2px; color: #5b4a7a; margin-bottom: 10px;">YOUR MESSAGE</div>
                <div style="color: #8b7aaa; font-size: 12px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
              </div>

              <p style="color: #a78bca; font-size: 13px; line-height: 1.8; margin: 0 0 4px;">
                Talk soon,
              </p>
              <p style="color: #e0d0ff; font-size: 14px; margin: 0 0 4px; letter-spacing: 1px;">
                The Artists Musicians HUB Team
              </p>
              <p style="color: #5b4a7a; font-size: 11px; margin: 0;">
                San Antonio, TX &middot; Est. 2018
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #05000a; padding: 20px 24px; text-align: center; border-top: 1px solid #bc13fe15;">
              <div style="font-size: 9px; letter-spacing: 2px; color: #3d2060; margin-bottom: 8px;">CONNECT WITH US</div>
              <div style="margin-bottom: 12px;">
                <a href="https://artistsmusicianshub.com" style="color: #5b4a7a; font-size: 11px; text-decoration: none; letter-spacing: 1px;">artistsmusicianshub.com</a>
              </div>
              <div style="color: #3d2060; font-size: 9px; letter-spacing: 1px;">
                &copy; 2026 ARTISTS MUSICIANS HUB &middot; ALL RIGHTS RESERVED
              </div>
              <div style="color: #3d2060; font-size: 9px; margin-top: 4px;">
                (210) 891-4991 &middot; artists.musicians.hub@gmail.com
              </div>
            </div>
          </div>
        `,
        text: [
          `Hey ${name},`,
          ``,
          `We got your message and appreciate you reaching out to the HUB. Our team will review your inquiry and get back to you within 24-48 hours.`,
          ``,
          `In the meantime, check out:`,
          `- AMPLIFY Program: https://artistsmusicianshub.com/amplify`,
          `- The Tone Zone: https://artistsmusicianshub.com/news`,
          `- About Us: https://artistsmusicianshub.com/about`,
          ``,
          `--- Your Message ---`,
          `${message}`,
          `---`,
          ``,
          `Talk soon,`,
          `The Artists Musicians HUB Team`,
          `San Antonio, TX - Est. 2018`,
          ``,
          `(210) 891-4991`,
          `artists.musicians.hub@gmail.com`,
          `artistsmusicianshub.com`,
        ].join("\n"),
      });
    } catch (replyErr) {
      // Auto-reply failure is non-fatal — user's message still reached AMH
      console.error("Auto-reply error (non-fatal):", replyErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
