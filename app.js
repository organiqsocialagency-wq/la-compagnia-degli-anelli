// Lightweight interactions for the Compagnia landing.
const menuButton = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Apri menu');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1100) closeMenu();
}, { passive: true });

const heroVideo = document.querySelector('#heroVideo');
const testimonialVideo = document.querySelector('.voices-media video');
const soundButton = document.querySelector('#soundButton');
const startButton = document.querySelector('#startVideo');

function updateSoundButton() {
  const soundOn = !heroVideo.muted;
  soundButton.setAttribute('aria-pressed', String(soundOn));
  soundButton.setAttribute('aria-label', soundOn ? 'Disattiva l’audio della presentazione' : 'Attiva l’audio e riavvia la presentazione dall’inizio');
  soundButton.firstChild.textContent = soundOn ? 'Disattiva audio ' : 'Attiva audio ';
}
async function tryAutoplay() {
  if (!heroVideo.paused) return;
  heroVideo.muted = true;
  updateSoundButton();
  try {
    await heroVideo.play();
    startButton.hidden = true;
  } catch {
    // Some browsers, data-saver settings and low-power modes require a tap.
    startButton.hidden = false;
  }
}
startButton.addEventListener('click', async () => {
  try {
    await heroVideo.play();
    startButton.hidden = true;
  } catch {
    // Native media controls remain available.
  }
});
soundButton.addEventListener('click', async () => {
  if (heroVideo.muted) {
    heroVideo.currentTime = 0;
    heroVideo.muted = false;
    heroVideo.loop = false;
  } else {
    heroVideo.muted = true;
  }
  updateSoundButton();
  try {
    await heroVideo.play();
    startButton.hidden = true;
  } catch {
    startButton.hidden = false;
  }
});
heroVideo.addEventListener('volumechange', updateSoundButton);
heroVideo.addEventListener('playing', () => { startButton.hidden = true; testimonialVideo.pause(); });
testimonialVideo.addEventListener('playing', () => heroVideo.pause());
window.addEventListener('load', tryAutoplay, { once: true });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && heroVideo.currentTime === 0 && heroVideo.paused) tryAutoplay();
});

const copyButton = document.querySelector('#copyCf');
const copyStatus = document.querySelector('#copyStatus');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('96518590581');
    copyStatus.textContent = 'Codice fiscale copiato.';
  } catch {
    copyStatus.textContent = 'Seleziona e copia: 96518590581';
  }
});

// Reveal selected headings word by word as they enter view. Original text stays
// available to assistive technology and is visible when motion is unavailable.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealTargets = [];

  document.querySelectorAll('[data-word-reveal]').forEach(heading => {
    const accessibleText = heading.innerText.replace(/\s+/g, ' ').trim();
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    let wordOrder = 0;
    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      (node.textContent.match(/\s+|\S+/g) || []).forEach(token => {
        if (/^\s+$/.test(token)) {
          fragment.append(document.createTextNode(token));
          return;
        }
        const word = document.createElement('span');
        word.className = 'reveal-word';
        word.textContent = token;
        word.setAttribute('aria-hidden', 'true');
        word.style.setProperty('--word-order', wordOrder++);
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });

    heading.setAttribute('aria-label', accessibleText);
    heading.classList.add('word-reveal');
    revealTargets.push(heading);
  });

  const enterGroups = [
    ['.benefit-grid > article', 95],
    ['.course-grid > article', 80],
    ['.journey li', 85],
    ['.audition-image, .voices-media, .about-photo, .document-card', 0],
    ['.interlude p, .voices-note, .about-statement, .five-code', 0]
  ];
  enterGroups.forEach(([selector, step]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add('soft-enter');
      element.style.setProperty('--enter-delay', `${index * step}ms`);
      revealTargets.push(element);
    });
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -8% 0px' });

  document.documentElement.classList.add('has-motion');
  revealTargets.forEach(element => revealObserver.observe(element));
}
