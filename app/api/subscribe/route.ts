import { NextRequest, NextResponse } from "next/server";

function buildEmailHtml(email: string): string {
  const time = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New AMH Signup</title>
</head>
<body style="margin:0;padding:0;background:#000a02;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000a02;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#000a02;border:1px solid rgba(0,255,65,0.3);padding:0;">

              <!-- Top bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(0,255,65,0.05);border-bottom:1px solid rgba(0,255,65,0.2);padding:10px 20px;">
                    <span style="color:#2a7a3b;font-size:10px;letter-spacing:0.2em;">AMH_SYS</span>
                    <span style="color:#2a7a3b;font-size:10px;letter-spacing:0.2em;float:right;">◈ SIGNAL RECEIVED</span>
                  </td>
                </tr>
              </table>

              <!-- Logo area -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:32px 20px 16px;">
                    <div style="font-size:48px;letter-spacing:0.3em;color:#00ff41;font-family:'Courier New',monospace;font-weight:bold;">AMH</div>
                    <div style="font-size:11px;letter-spacing:0.4em;color:#2a7a3b;margin-top:6px;">ARTISTS MUSICIANS HUB</div>
                    <table width="80%" cellpadding="0" cellspacing="0" style="margin:16px auto 0;">
                      <tr><td height="2" style="background:#00ff41;"></td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Main content -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 32px 32px;">

                    <p style="color:#2a7a3b;font-size:10px;letter-spacing:0.3em;margin:0 0 16px;">NEW SIGNAL DETECTED</p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(0,255,65,0.2);background:rgba(0,255,65,0.02);">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:8px 0;border-bottom:1px solid rgba(0,255,65,0.1);">
                                <span style="color:#2a7a3b;font-size:10px;letter-spacing:0.2em;display:block;margin-bottom:4px;">EMAIL</span>
                                <span style="color:#00ff41;font-size:14px;letter-spacing:0.05em;">${email}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;border-bottom:1px solid rgba(0,255,65,0.1);">
                                <span style="color:#2a7a3b;font-size:10px;letter-spacing:0.2em;display:block;margin-bottom:4px;">TIMESTAMP</span>
                                <span style="color:#00c832;font-size:12px;letter-spacing:0.05em;">${time} CST</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;">
                                <span style="color:#2a7a3b;font-size:10px;letter-spacing:0.2em;display:block;margin-bottom:4px;">SOURCE</span>
                                <span style="color:#00c832;font-size:12px;letter-spacing:0.05em;">artistsmusicianshub.com — COMING SOON PAGE</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#2a7a3b;font-size:11px;letter-spacing:0.15em;margin:24px 0 0;line-height:2;">
                      &#9654; ADD TO LAUNCH LIST<br/>
                      &#9654; SEND WELCOME EMAIL ON MARCH 7
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Bottom bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(0,255,65,0.03);border-top:1px solid rgba(0,255,65,0.15);padding:10px 20px;">
                    <span style="color:#1a4a26;font-size:9px;letter-spacing:0.2em;">SAN ANTONIO TX &middot; EST. 2018 &middot; 1M+ STREAMS</span>
                    <span style="color:#1a4a26;font-size:9px;letter-spacing:0.2em;float:right;">AMH v2.1.0</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPlainText(email: string): string {
  const time = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    hour12: true,
  });
  return `NEW AMH SIGNUP
====================
Email: ${email}
Time: ${time} CST
Source: artistsmusicianshub.com

ACTION ITEMS:
- Add to launch list
- Send welcome email on March 7

Artists Musicians HUB | San Antonio TX | Est. 2018`;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@") || !email.includes(".")) {
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
      from: `AMH System <postmaster@${MAILGUN_DOMAIN}>`,
      to: TO_EMAIL,
      subject: `New AMH Signup: ${email}`,
      html: buildEmailHtml(email),
      text: buildPlainText(email),
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
        { error: `Mail error ${response.status}` },
        { status: 500 }
      );
    }

    console.log(`New signup: ${email}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
