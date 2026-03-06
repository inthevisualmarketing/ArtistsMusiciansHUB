import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
    const TO_EMAIL = "artists.musicians.hub@gmail.com";

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error("Mailgun env vars missing — check FLY secrets");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const form = new URLSearchParams({
      from: `AMH Signups <noreply@${MAILGUN_DOMAIN}>`,
      to: TO_EMAIL,
      subject: `New AMH Signup: ${email}`,
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
      const errText = await response.text();
      console.error(`Mailgun failed — status: ${response.status}`);
      console.error(`Mailgun response: ${errText}`);
      console.error(`Domain used: ${MAILGUN_DOMAIN}`);
      return NextResponse.json(
        { error: `Mailgun error ${response.status}: ${errText}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
