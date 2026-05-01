// Single source of truth for all payment-related strings shown to users.
// Update here, both PricingPage and SubscriptionExpiredWall pick it up.

export const CONTACT_NUMBER       = '+201021751325';
export const VODAFONE_CASH_NUMBER = '01021751325';
export const INSTAPAY_HANDLE      = 'mostafaeltayar@instapay';
export const RENEWAL_CONTACT      = 'WhatsApp +20 1021751325';

export const WHATSAPP_BASE = `https://wa.me/${CONTACT_NUMBER.replace(/[^0-9]/g, '')}?text=`;

export function whatsappLink(plan: string): string {
  const msg = encodeURIComponent(
    `Hi, I'd like to upgrade to Full Range Lab ${plan}. Please let me know how to complete the payment.`,
  );
  return `${WHATSAPP_BASE}${msg}`;
}
