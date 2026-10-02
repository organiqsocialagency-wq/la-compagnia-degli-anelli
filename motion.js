/* React Bits: BlurText, ScrollReveal, AnimatedContent and SpotlightCard.
 * Adapted for this static site; see THIRD_PARTY_NOTICES.md for source and license.
 * No React runtime, scroll hijacking or continuously running animation loop.
 */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const clamp = value => Math.min(1, Math.max(0, value));
  let dispose = () => {};

  function mount() {
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const cleanup = [];
    const originals = [];
    const pending = new Set();
    let frame = 0;
    let disposed = false;

    // Preserve inline emphasis, intentional line breaks and one accessible name.
    function splitWords(element, className) {
      originals.push([element, element.innerHTML, element.getAttribute('aria-label')]);
      const name = element.innerText.replace(/\s+/g, ' ').trim();
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const words = [];
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        (node.textContent.match(/\s+|\S+/g) || []).forEach(token => {
          if (/^\s+$/.test(token)) {
            fragment.append(document.createTextNode(token));
          } else {
            const word = document.createElement('span');
            word.className = className;
            word.textContent = token;
            word.setAttribute('aria-hidden', 'true');
            word.style.setProperty('--word-order', words.length);
            words.push(word);
            fragment.append(word);
          }
        });
        node.replaceWith(fragment);
      });
      element.setAttribute('aria-label', name);
      return words;
    }

    function listen(target, type, callback, options) {
      target.addEventListener(type, callback, options);
      cleanup.push(() => target.removeEventListener(type, callback, options));
    }

    const entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        entranceObserver.unobserve(target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
    cleanup.push(() => entranceObserver.disconnect());

    function renderScroll() {
      frame = 0;
      if (disposed) return;
      const height = window.innerHeight;
      const travel = Math.min(height * .36, 280);
      // Read geometry before applying styles, avoiding read/write layout thrashing.
      const updates = Array.from(pending, item => ({
        item,
        progress: Math.max(item.progress, clamp((height * .9 - item.element.getBoundingClientRect().top) / travel))
      }));
      updates.forEach(({ item, progress }) => {
        if (Math.abs(progress - item.progress) < .001) return;
        item.progress = progress;
        item.words.forEach((word, index) => {
          const stagger = item.words.length > 1 ? index / (item.words.length - 1) * .55 : 0;
          word.style.setProperty('--reveal', clamp((progress - stagger) / .45).toFixed(3));
        });
        if (progress === 1) {
          item.element.classList.add('is-settled');
          pending.delete(item);
        }
      });
    }

    function schedule() {
      if (!disposed && !frame && pending.size) frame = requestAnimationFrame(renderScroll);
    }

    dispose = () => {
      disposed = true;
      cancelAnimationFrame(frame);
      root.classList.remove('has-motion');
      cleanup.forEach(fn => fn());
      document.querySelectorAll('.motion-enter, .blur-text, .scroll-reveal, .card-spotlight').forEach(element => {
        element.classList.remove('motion-enter', 'is-visible', 'blur-text', 'scroll-reveal', 'is-settled', 'card-spotlight', 'spotlight-active');
        ['--enter-delay', '--mouse-x', '--mouse-y'].forEach(property => element.style.removeProperty(property));
      });
      originals.forEach(([element, html, label]) => {
        element.innerHTML = html;
        if (label === null) element.removeAttribute('aria-label');
        else element.setAttribute('aria-label', label);
      });
      pending.clear();
    };

    try {
      const heroTitle = document.querySelector('#hero-title');
      splitWords(heroTitle, 'blur-word');
      heroTitle.classList.add('blur-text');

      document.querySelectorAll('[data-word-reveal]').forEach(element => {
        const words = splitWords(element, 'scrub-word');
        element.classList.add('scroll-reveal');
        pending.add({ element, words, progress: -1 });
      });

      const groups = [
        ['.hero-support', 0],
        ['.benefit-grid > article', 80],
        ['.course-grid > article', 75],
        ['.journey li', 80],
        ['.audition-image, .about-photo, .voices-media', 0],
        ['.interlude p, .voices-note, .community-band', 0]
      ];
      const entrances = [];
      groups.forEach(([selector, stagger]) => {
        document.querySelectorAll(selector).forEach((element, index) => {
          element.classList.add('motion-enter');
          element.style.setProperty('--enter-delay', `${index * stagger}ms`);
          entrances.push(element);
        });
      });

      document.querySelectorAll('.course-card').forEach(card => {
        card.classList.add('card-spotlight');
        let pointerFrame = 0;
        let position;
        function resetSpotlight() {
          cancelAnimationFrame(pointerFrame);
          pointerFrame = 0;
          card.classList.remove('spotlight-active');
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
        }
        listen(card, 'pointermove', event => {
          if (!finePointer.matches || event.pointerType === 'touch') return;
          position = { x: event.clientX, y: event.clientY };
          if (pointerFrame) return;
          pointerFrame = requestAnimationFrame(() => {
            pointerFrame = 0;
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${position.x - rect.left}px`);
            card.style.setProperty('--mouse-y', `${position.y - rect.top}px`);
            card.classList.add('spotlight-active');
          });
        }, { passive: true });
        listen(card, 'pointerleave', resetSpotlight);
        listen(card, 'pointercancel', resetSpotlight);
        listen(finePointer, 'change', resetSpotlight);
        cleanup.push(resetSpotlight);
      });

      // Keyboard focus must never land on a visually hidden CTA.
      listen(document, 'focusin', event => {
        const entry = event.target.closest('.motion-enter');
        if (entry) {
          entry.classList.add('is-visible');
          entranceObserver.unobserve(entry);
        }
      });
      listen(window, 'scroll', schedule, { passive: true });
      listen(window, 'resize', schedule, { passive: true });
      listen(window, 'pageshow', schedule);
      listen(window, 'hashchange', schedule);

      root.classList.add('has-motion');
      // Deep links and restored scroll positions should not hide previous sections.
      entrances.forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight * .95) {
          element.classList.add('is-visible');
        } else {
          entranceObserver.observe(element);
        }
      });
      renderScroll();
      if (document.fonts) document.fonts.ready.then(schedule);
    } catch (error) {
      dispose(); // Progressive enhancement: content wins over an animation failure.
      console.warn('Le animazioni non sono disponibili; i contenuti restano visibili.', error);
    }
  }

  mount();
  preference.addEventListener('change', () => {
    dispose();
    mount();
  });
})();
