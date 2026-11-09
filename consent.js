/* Analytics consent. Google Analytics loads only after the visitor allows it.
   - Choice is kept in localStorage ('hanjo-consent' = 'granted' | 'denied').
   - A browser sending Global Privacy Control is treated as a decline, no banner.
   - Any page can reopen the choice with window.hanjoConsent.open()
     (the Privacy Policy links to it). */
(function () {
  var GA_ID = 'G-JLHW59CHY6';
  var KEY = 'hanjo-consent';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var COPY = {
    en: {
      text: 'We would like to use Google Analytics cookies to understand how this site is used. Nothing is loaded unless you allow it.',
      more: 'Privacy Policy',
      allow: 'Allow',
      deny: 'Decline'
    },
    ja: {
      text: 'サイトの利用状況を把握するため、Google アナリティクスの Cookie を使用してもよろしいですか。許可いただくまで読み込みません。',
      more: 'プライバシーポリシー',
      allow: '許可する',
      deny: '許可しない'
    }
  };

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  var loaded = false;
  function loadGA() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function lang() {
    return (document.documentElement.lang || '').toLowerCase().indexOf('ja') === 0 ? 'ja' : 'en';
  }

  var bar = null;
  function render() {
    if (!bar) return;
    var c = COPY[lang()];
    var privacy = lang() === 'ja' ? '/ja/privacy/' : '/privacy/';
    bar.querySelector('.hc-text').innerHTML = c.text + ' <a href="' + privacy + '">' + c.more + '</a>';
    bar.querySelector('.hc-allow').textContent = c.allow;
    bar.querySelector('.hc-deny').textContent = c.deny;
  }

  function close() {
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
  }

  function open() {
    if (bar) return;
    var style = document.getElementById('hc-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'hc-style';
      style.textContent =
        '.hc-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:1000;max-width:640px;margin:0 auto;' +
        'background:#fff;color:#111110;border:1px solid #E4E2DC;border-radius:14px;box-shadow:0 8px 30px rgba(17,17,16,.12);' +
        'padding:16px 18px;display:flex;gap:16px;align-items:center;font:400 14px/1.55 Inter,-apple-system,sans-serif}' +
        'html[lang="ja"] .hc-bar{font-family:"Noto Sans JP",sans-serif}' +
        '.hc-text{flex:1;margin:0}' +
        '.hc-text a{color:#3A5C45;font-weight:500;text-underline-offset:3px}' +
        '.hc-actions{display:flex;gap:8px;flex-shrink:0}' +
        '.hc-bar button{font:inherit;font-weight:500;border-radius:10px;padding:9px 16px;cursor:pointer;border:1px solid #3A5C45}' +
        '.hc-allow{background:#3A5C45;color:#fff}.hc-allow:hover{background:#2e4a38}' +
        '.hc-deny{background:#fff;color:#3A5C45}.hc-deny:hover{background:#F5F4F0}' +
        '.hc-bar button:focus-visible{outline:2px solid #111110;outline-offset:2px}' +
        '@media (max-width:600px){.hc-bar{flex-direction:column;align-items:stretch}.hc-actions{justify-content:flex-end}}';
      document.head.appendChild(style);
    }
    bar = document.createElement('div');
    bar.className = 'hc-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML = '<p class="hc-text"></p><div class="hc-actions">' +
      '<button type="button" class="hc-deny"></button><button type="button" class="hc-allow"></button></div>';
    bar.querySelector('.hc-allow').addEventListener('click', function () {
      write('granted'); close(); loadGA();
    });
    bar.querySelector('.hc-deny').addEventListener('click', function () {
      // Withdrawing after GA already ran: stop it on this page and on later visits.
      write('denied'); close();
      if (loaded) window['ga-disable-' + GA_ID] = true;
    });
    render();
    document.body.appendChild(bar);
  }

  // The site swaps language at runtime by changing <html lang>; follow it.
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.hanjoConsent = { open: open };

  var choice = read();
  if (choice === 'granted') { loadGA(); return; }
  if (choice === 'denied' || navigator.globalPrivacyControl) return;
  if (document.body) open();
  else document.addEventListener('DOMContentLoaded', open);
})();
