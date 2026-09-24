import { EmailNotificationProvider } from "./emailProvider.js";
import { WhatsAppNotificationProvider } from "./whatsappProvider.js";

class NotificationService {
  constructor() {
    this.emailProvider = new EmailNotificationProvider();
    this.whatsappProvider = new WhatsAppNotificationProvider();
  }

  async notifyRegistration(participant, event) {
    const results = {};

    // 1. Email provider (V1)
    if (participant.email) {
      results.email = await this.emailProvider.sendTicket(participant, event);
    }

    // 2. WhatsApp provider (V1 stub)
    if (participant.whatsapp) {
      results.whatsapp = await this.whatsappProvider.sendTicket(participant, event);
    }

    return results;
  }
}

export const notificationService = new NotificationService();
