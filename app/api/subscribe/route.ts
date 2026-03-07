import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
    const TO_EMAIL = process.env.NOTIFY_EMAIL ?? "artists.musicians.hub@gmail.com";

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error("Mailgun env vars missing");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const form = new URLSearchParams({
      from: `AMH Signups <noreply@${MAILGUN_DOMAIN}>`,
      to: TO_EMAIL,
      subject: `🎵 New AMH Signup: ${email}`,
      text: `New early access signup:\n\nEmail: ${email}\nTime: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CST\n\nAMH Launch System`,
    });

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Mailgun error:", err);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
