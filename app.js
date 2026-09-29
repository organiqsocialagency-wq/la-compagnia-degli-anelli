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
