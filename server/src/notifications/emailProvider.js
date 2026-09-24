import nodemailer from "nodemailer";

export class EmailNotificationProvider {
  constructor() {
    this.enabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    if (this.enabled) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } catch (e) {
        console.warn("⚠️ SMTP Transporter init warning:", e.message);
        this.enabled = false;
      }
    }
  }

  async sendTicket(participant, event) {
    const guestDomain = process.env.GUEST_DOMAIN || "http://localhost:5000";
    const ticketUrl = `${guestDomain}/t/${participant.ticket_code}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(participant.ticket_code)}`;

    const subject = `[E-Ticket] Konfirmasi Registrasi: ${event.title}`;
    const text = `Halo ${participant.name},\n\nTerima kasih telah mendaftar di acara "${event.title}".\n\nDetail Tiket:\nNomor Tiket: ${participant.ticket_code}\nInstansi: ${participant.organization}\nTanggal: ${event.date} (${event.time || ''})\nLokasi: ${event.location || ''}\n\nBuka E-Ticket Anda di: ${ticketUrl}\n\nSilakan tunjukkan QR Code e-ticket saat hadir di lokasi.\n\nSalam,\nPanitia ${event.title}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #4f46e5; color: #ffffff; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .ticket-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-family: monospace; font-size: 20px; font-weight: bold; color: #4f46e5; letter-spacing: 2px; margin: 10px 0; }
        .meta { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 13px; color: #64748b; line-height: 1.6; }
        .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; margin-bottom: 4px;">Konfirmasi Registrasi Acara</div>
          <h1 style="margin: 0; font-size: 22px;">${event.title}</h1>
        </div>
        <div class="content">
          <p style="margin-top: 0;">Halo <strong>${participant.name}</strong>,</p>
          <p style="color: #475569; font-size: 14px;">Pendaftaran Anda untuk acara <strong>${event.title}</strong> telah berhasil. Berikut adalah E-Ticket resmi Anda:</p>
          
          <div class="ticket-box">
            <img src="${qrImageUrl}" alt="QR Ticket" width="160" height="160" style="display: block; margin: 0 auto; border-radius: 8px;" />
            <div class="code">${participant.ticket_code}</div>
            <div style="font-size: 12px; color: #64748b;">Simpan kode QR ini untuk verifikasi di meja registrasi</div>
          </div>

          <div class="meta">
            <div>📅 <strong>Tanggal:</strong> ${event.date} ${event.time ? `(${event.time})` : ''}</div>
            <div>📍 <strong>Lokasi:</strong> ${event.location || '-'}</div>
            <div>🏢 <strong>Instansi:</strong> ${participant.organization}</div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${ticketUrl}" class="btn" target="_blank">Lihat & Simpan E-Ticket</a>
          </div>
        </div>
        <div class="footer">
          Pastikan untuk menunjukkan QR Code tiket saat tiba di lokasi.<br>
          &copy; ${new Date().getFullYear()} ${event.title}
        </div>
      </div>
    </body>
    </html>
    `;

    if (!this.enabled) {
      console.log(`📧 [Email Notification Simulated] To: ${participant.email} | Ticket: ${participant.ticket_code} | Link: ${ticketUrl}`);
      return { success: true, simulated: true };
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"${event.title}" <noreply@event.com>`,
        to: participant.email,
        subject,
        text,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error("❌ Failed to send email notification:", err.message);
      // Fail gracefully so user registration is NEVER blocked by SMTP issues
      return { success: false, error: err.message };
    }
  }
}
