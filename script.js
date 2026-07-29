const GA_MEASUREMENT_ID = 'G-R98SLE055Z';
const CONSENT_KEY = 'milltown-analytics-consent';

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() {
  window.dataLayer.push(arguments);
};

window.gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});

let analyticsLoaded = false;

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function loadAnalytics() {
  if (analyticsLoaded) return;
  analyticsLoaded = true;

  window.gtag('consent', 'update', {
    analytics_storage: 'granted'
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true
  });

  const googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(googleTag);
}

function trackEvent(name, parameters = {}) {
  if (!analyticsLoaded) return;
  window.gtag('event', name, parameters);
}

function saveConsent(choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // The preference applies for this visit when browser storage is unavailable.
  }
  if (choice === 'granted') {
    loadAnalytics();
  } else {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied'
    });
  }
}

function showConsentBanner() {
  let banner = document.querySelector('.consent-banner');
  if (banner) {
    banner.hidden = false;
    banner.querySelector('.consent-accept')?.focus();
    return;
  }

  banner = document.createElement('aside');
  banner.className = 'consent-banner';
  banner.setAttribute('aria-label', 'Cookie preferences');
  banner.innerHTML = `
    <div>
      <strong>Your privacy matters</strong>
      <p>We use optional Google Analytics cookies to understand how visitors use the site. You can accept or decline analytics.</p>
      <a href="/privacy/">Privacy &amp; cookies</a>
    </div>
    <div class="consent-actions">
      <button class="consent-decline" type="button">Decline</button>
      <button class="consent-accept" type="button">Accept analytics</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelector('.consent-accept').addEventListener('click', () => {
    saveConsent('granted');
    banner.hidden = true;
  });
  banner.querySelector('.consent-decline').addEventListener('click', () => {
    saveConsent('denied');
    banner.hidden = true;
  });
}

const savedConsent = readConsent();
if (savedConsent === 'granted') {
  loadAnalytics();
}

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

document.querySelectorAll('.footer-links').forEach((links) => {
  if (!links.querySelector('a[href="/privacy/"]')) {
    const privacyLink = document.createElement('a');
    privacyLink.href = '/privacy/';
    privacyLink.textContent = 'Privacy';
    links.appendChild(privacyLink);
  }
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const mobileBook = document.createElement('a');
mobileBook.className = 'mobile-book-bar';
mobileBook.href = window.location.pathname === '/' ? '#book' : '/#book';
mobileBook.textContent = 'Check availability';
document.body.appendChild(mobileBook);

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');

  if (event.target.closest('#lodgify-search-bar')) {
    trackEvent('booking_search', {
      location: 'lodgify_search_bar'
    });
  }

  if (!link) return;

  const href = link.getAttribute('href') || '';
  if (href === '#book' || href === '/#book' || link.classList.contains('nav-book') || link.classList.contains('mobile-book-bar')) {
    trackEvent('select_content', {
      content_type: 'booking_cta',
      item_id: link.textContent.trim()
    });
  }

  if (href.startsWith('mailto:')) {
    trackEvent('generate_lead', {
      method: 'email'
    });
  }

  if (href.includes('airbnb.com')) {
    trackEvent('select_content', {
      content_type: 'airbnb_listing',
      item_id: 'milltown_dingle'
    });
  }

  if (href.includes('checkout.lodgify.com')) {
    trackEvent('begin_checkout', {
      currency: 'EUR',
      items: [{ item_name: 'Milltown Cottage Dingle' }]
    });
  }
});

document.getElementById('manage-cookie-preferences')?.addEventListener('click', () => {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Continue to show the preference controls when browser storage is unavailable.
  }
  showConsentBanner();
});

if (!savedConsent) {
  showConsentBanner();
}
