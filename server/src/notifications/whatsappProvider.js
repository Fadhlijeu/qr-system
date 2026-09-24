export class WhatsAppNotificationProvider {
  constructor() {
    this.providerName = process.env.WA_PROVIDER || "STUB";
  }

  /**
   * Pluggable WhatsApp sender stub.
   * Can be hooked to Fonnte, Twilio, Baileys, or WhatsApp Cloud API.
   */
  async sendTicket(participant, event) {
    // V1: WhatsApp disabled by architectural mandate.
    // Provider is ready for seamless future plug-in.
    return {
      success: true,
      provider: this.providerName,
      status: "DISABLED_V1",
      phone: participant.whatsapp,
    };
  }
}
