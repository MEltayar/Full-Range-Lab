// Cloudflare Web Analytics — privacy-first, cookieless, free.
// Enable by setting VITE_CF_ANALYTICS_TOKEN in your deployment env vars.
// Get a token at: Cloudflare dashboard → Analytics & Logs → Web Analytics → Manage site.
export function initAnalytics(): void {
  const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN;
  if (!token) return;
  if (typeof document === 'undefined') return;

  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  document.head.appendChild(s);
}
