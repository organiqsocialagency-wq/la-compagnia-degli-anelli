/* Small, dependency-free card galleries. Pointer events keep native vertical scrolling. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const stage = carousel.querySelector('[data-stage]');
    const cards = Array.from(stage.querySelectorAll('[data-slide]'));
    const counter = carousel.querySelector('[data-counter]');
    const announcement = carousel.querySelector('[data-announcement]');
    const toggle = carousel.querySelector('[data-toggle]');
    const delay = Number(carousel.dataset.autoplay) || 0;
    if (cards.length < 2) return;

    let index = 0;
    let timer = 0;
    let inView = false;
    let hovered = false;
    let userPaused = reducedMotion.matches;
    let allowFocusedPlayback = false;
    let gesture = null;
    let suppressClickUntil = 0;
    const wrap = value => (value + cards.length) % cards.length;

    function syncTimer() {
      window.clearTimeout(timer);
      timer = 0;
      if (!delay || userPaused || !inView || hovered || document.hidden ||
          (carousel.contains(document.activeElement) && !(allowFocusedPlayback && document.activeElement === toggle)) || gesture) return;
      timer = window.setTimeout(() => go(1, false), delay);
    }

    function syncToggle() {
      if (!toggle) return;
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.setAttribute('aria-label', userPaused ? 'Avvia il carosello automatico' : 'Metti in pausa il carosello');
      toggle.querySelector('[data-toggle-label]').textContent = userPaused ? 'Riprendi' : 'Pausa';
    }

    function render(announce = false) {
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === index;
        const position = active ? 'front' : cardIndex === wrap(index - 1) ? 'left' :
          cardIndex === wrap(index + 1) ? 'right' : 'hidden';
        card.dataset.position = position;
        card.setAttribute('aria-hidden', String(!active));
        card.inert = !active;
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'diapositiva');
        card.setAttribute('aria-label', `${cardIndex + 1} di ${cards.length}: ${card.dataset.title}`);
        // Preserve sensible keyboard behavior in browsers without inert support.
        card.querySelectorAll('a').forEach(link => { link.tabIndex = active ? 0 : -1; });
      });
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      if (announce) announcement.textContent = `${index + 1} di ${cards.length}: ${cards[index].dataset.title}`;
      syncToggle();
      syncTimer();
    }

    function go(step, manual = true) {
      if (manual) {
        carousel.classList.add('is-explored');
        if (delay) userPaused = true;
      }
      index = wrap(index + step);
      render(manual);
    }

    carousel.querySelector('[data-prev]').addEventListener('click', () => go(-1));
    carousel.querySelector('[data-next]').addEventListener('click', () => go(1));
    stage.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        // Moving focus off the outgoing link avoids hiding the focused element.
        if (event.target.closest('a')) stage.focus({ preventScroll: true });
        go(event.key === 'ArrowRight' ? 1 : -1);
      }
    });

    stage.addEventListener('dragstart', event => event.preventDefault());
    stage.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dragging: false };
      syncTimer();
    });
    stage.addEventListener('pointermove', event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { gesture = null; syncTimer(); return; }
        if (Math.abs(dx) < 9 || Math.abs(dx) <= Math.abs(dy)) return;
        gesture.dragging = true;
        stage.setPointerCapture(event.pointerId);
        carousel.classList.add('is-dragging', 'is-explored');
      }
      gesture.dx = dx;
      const distance = Math.max(-160, Math.min(160, dx));
      stage.style.setProperty('--drag-x', `${distance}px`);
      stage.style.setProperty('--drag-angle', `${distance / 20}deg`);
    });

    function finishGesture(event, cancelled = false) {
      if (!gesture || gesture.id !== event.pointerId) return;
      const { dx, dragging } = gesture;
      gesture = null;
      carousel.classList.remove('is-dragging');
      stage.style.removeProperty('--drag-x');
      stage.style.removeProperty('--drag-angle');
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (dragging) {
        suppressClickUntil = performance.now() + 450;
        stage.focus({ preventScroll: true });
        if (delay) userPaused = true;
        if (!cancelled && Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        else { syncToggle(); syncTimer(); }
      } else syncTimer();
    }
    stage.addEventListener('pointerup', event => finishGesture(event));
    stage.addEventListener('pointercancel', event => finishGesture(event, true));
    stage.addEventListener('lostpointercapture', event => finishGesture(event, true));
    // A mouse release outside a card should also clear a pending, non-drag gesture.
    window.addEventListener('pointerup', event => finishGesture(event));
    carousel.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
    }, true);

    toggle?.addEventListener('click', () => {
      userPaused = !userPaused;
      allowFocusedPlayback = !userPaused;
      syncToggle();
      syncTimer();
    });
    carousel.addEventListener('pointerenter', event => {
      if (finePointer.matches && event.pointerType === 'mouse') { hovered = true; syncTimer(); }
    });
    carousel.addEventListener('pointerleave', () => { hovered = false; syncTimer(); });
    carousel.addEventListener('focusin', event => {
      if (event.target !== toggle) allowFocusedPlayback = false;
      syncTimer();
    });
    carousel.addEventListener('focusout', () => window.setTimeout(syncTimer, 0));
    document.addEventListener('visibilitychange', syncTimer);
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) userPaused = true;
      syncToggle();
      syncTimer();
    });
    window.addEventListener('pagehide', () => window.clearTimeout(timer));
    window.addEventListener('pageshow', syncTimer);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
        carousel.classList.toggle('is-inview', inView);
        syncTimer();
      }, { threshold: .25 });
      observer.observe(carousel);
    } else {
      inView = true;
      carousel.classList.add('is-inview');
    }
    render();
    carousel.classList.add('is-ready');
  });
})();
