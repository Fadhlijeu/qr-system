import nodemailer from "nodemailer";

export class EmailNotificationProvider {
  constructor() {
    this.enabled = process.env.SMTP_HOST && process.env.SMTP_USER;
    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendTicket(participant, event) {
    const subject = `[E-Ticket] Konfirmasi Registrasi: ${event.title}`;
    const text = `Halo ${participant.name},\n\nTerima kasih telah mendaftar di acara "${event.title}".\n\nDetail Tiket:\nNomor Tiket: ${participant.ticket_code}\nInstansi: ${participant.organization}\nTanggal: ${event.date} (${event.time || ''})\nLokasi: ${event.location || ''}\n\nSilakan tunjukkan QR Code e-ticket saat hadir di lokasi.\n\nSalam,\nPanitia ${event.title}`;

    if (!this.enabled) {
      console.log(`📧 [Email Notification Simulated] To: ${participant.email} | Ticket: ${participant.ticket_code}`);
      return { success: true, simulated: true };
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"${event.title}" <noreply@event.com>`,
        to: participant.email,
        subject,
        text,
      });
      return { success: true };
    } catch (err) {
      console.error("❌ Failed to send email notification:", err.message);
      return { success: false, error: err.message };
    }
  }
}
