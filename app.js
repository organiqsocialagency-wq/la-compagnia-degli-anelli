// La Compagnia degli Anelli APS — interactions for the original 2026 layout.
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#siteNav');

function closeMenu() {
  menu?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Apri menu');
}

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
});

menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

const copyButton = document.querySelector('#copyCf');
const copyStatus = document.querySelector('#copyStatus');
copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('96518590581');
    copyStatus.textContent = 'Codice fiscale copiato.';
  } catch {
    copyStatus.textContent = 'Seleziona e copia: 96518590581';
  }
});
