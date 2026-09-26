// La Compagnia degli Anelli APS — navigation, video and scroll illustrations.
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
const dialog = document.querySelector('.video-dialog');
const presentation = dialog.querySelector('video');
document.querySelector('[data-video]').addEventListener('click', () => {
  dialog.showModal();
  document.body.classList.add('video-open');
  presentation.play().catch(() => {
    // Native controls remain available if the browser requires a second tap.
  });
});
dialog.querySelector('.close-video').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});
dialog.addEventListener('close', () => {
  presentation.pause();
  document.body.classList.remove('video-open');
});
const videos = [...document.querySelectorAll('video')];
videos.forEach(video => video.addEventListener('play', () => {
  videos.forEach(other => { if (other !== video) other.pause(); });
}));
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

// Update visible illustrations once per frame, only when the user scrolls.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
const reveals = [...document.querySelectorAll('[data-reveal], [data-reveal-group]')];
const progressBar = document.querySelector('.reading-progress');
const heroWave = [...document.querySelectorAll('[data-wave] i')];
const hero = document.querySelector('#hero');
const activeScenes = new Set();
let sceneObserver;
let revealObserver;
let frame = 0;
let heroVisible = true;
let motionEnabled = false;
const clamp = value => Math.max(0, Math.min(1, value));
function renderScroll() {
  frame = 0;
  if (!motionEnabled) return;
  const height = window.innerHeight;
  const scrollRange = document.documentElement.scrollHeight - height;
  progressBar.style.transform = `scaleX(${scrollRange > 0 ? clamp(window.scrollY / scrollRange) : 0})`;
  // Read layout together, then write styles together.
  const measurements = [...activeScenes].map(scene => ({ scene, rect: scene.getBoundingClientRect() }));
  measurements.forEach(({ scene, rect }) => {
    const travel = height * .75 + Math.min(rect.height, height * .6) * .15;
    const progress = clamp((height * .95 - rect.top) / travel);
    scene.style.setProperty('--scene-progress', progress.toFixed(4));
  });
  if (heroVisible) {
    heroWave.forEach((bar, index) => {
      const level = .2 + .8 * Math.abs(Math.sin(window.scrollY * .015 + index * .72));
      bar.style.setProperty('--wave-level', level.toFixed(3));
    });
  }
}
function scheduleScroll() {
  if (motionEnabled && !frame) frame = requestAnimationFrame(renderScroll);
}
function configureMotion() {
  sceneObserver?.disconnect();
  revealObserver?.disconnect();
  activeScenes.clear();
  cancelAnimationFrame(frame);
  frame = 0;
  motionEnabled = !motionPreference.matches && 'IntersectionObserver' in window;
  document.documentElement.classList.toggle('motion-enabled', motionEnabled);
  if (!motionEnabled) {
    scenes.forEach(scene => scene.style.setProperty('--scene-progress', '1'));
    reveals.forEach(element => element.classList.add('is-revealed'));
    heroWave.forEach(bar => bar.style.removeProperty('--wave-level'));
    progressBar.style.transform = 'scaleX(0)';
    return;
  }
  scenes.forEach(scene => scene.style.setProperty('--scene-progress', '0'));
  sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === hero) heroVisible = entry.isIntersecting;
      else if (entry.isIntersecting) activeScenes.add(entry.target);
      else {
        activeScenes.delete(entry.target);
        entry.target.style.setProperty('--scene-progress', entry.boundingClientRect.bottom < 0 ? '1' : '0');
      }
    });
    scheduleScroll();
  }, { rootMargin: '100px 0px' });
  scenes.forEach(scene => sceneObserver.observe(scene));
  sceneObserver.observe(hero);
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08 });
  reveals.forEach(element => revealObserver.observe(element));
  scheduleScroll();
}
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMenu();
  scheduleScroll();
}, { passive: true });
window.addEventListener('load', scheduleScroll, { once: true });
document.fonts?.ready.then(scheduleScroll);
motionPreference.addEventListener('change', configureMotion);
configureMotion();
