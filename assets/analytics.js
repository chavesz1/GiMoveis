window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};

const allowedAnalyticsHosts = ['gimoveis.com.br', 'www.gimoveis.com.br', 'localhost'];
const currentHost = window.location.hostname.toLowerCase();
const shouldInitializeAnalytics = allowedAnalyticsHosts.includes(currentHost);

if (shouldInitializeAnalytics) {
  window.gtag('js', new Date());
  window.gtag('config', 'G-80QS25QXL6', {
    anonymize_ip: true,
    allow_ad_personalization_signals: false,
  });
}
