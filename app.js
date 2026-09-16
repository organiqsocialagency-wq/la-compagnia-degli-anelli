/* =========================================================
   SKILLFUNNEL - Clone  •  app.js  •  v2 (Karakter)
   GSAP + ScrollTrigger + Lenis + SplitType
   Adds: hero 3D scroll reveal, scroll-stacking reviews,
   storytelling scroll rails, frame-by-frame canvas scrub.
   ========================================================= */
(function () {
  "use strict";

  /* 0. EMBED DETECTION: se siamo dentro un iframe (Elementor), nascondi la
     scrollbar interna per evitare la doppia barra di scorrimento. */
  try {
    if (window.self !== window.top) {
      document.documentElement.classList.add("is-embedded");
    }
  } catch (e) {
    document.documentElement.classList.add("is-embedded");
  }

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches;
  var hasGSAP = typeof gsap !== "undefined";
  var hasST = hasGSAP && typeof ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* 1. LENIS SMOOTH SCROLL */
  var lenis = null;
  if (typeof Lenis !== "undefined" && !prefersReduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (hasST) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* 2. NAV scrolled + progress + scrollspy + menu */
  var nav = document.getElementById("nav");
  var onScrollNav = function () {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("scrolled", y > 40);
    var sp = document.getElementById("scrollProgress");
    if (sp) {
      var hh = document.documentElement.scrollHeight - window.innerHeight;
      sp.style.width = (hh > 0 ? (y / hh) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var spyTargets = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = "#" + en.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  var burger = document.getElementById("burger");
  var menu = document.querySelector(".nav__links");
  function closeMenu() {
    if (menu) menu.classList.remove("open");
    if (burger) burger.classList.remove("open");
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      burger.classList.toggle("open");
    });
  }

  /* 3. HEADLINE SPLIT REVEAL */
  var splitTargets = document.querySelectorAll("[data-split]");
  if (hasST && typeof SplitType !== "undefined" && !prefersReduced) {
    splitTargets.forEach(function (el) {
      var split = new SplitType(el, { types: "words,chars", tagName: "span" });
      gsap.set(el, { opacity: 1 });
      gsap.from(split.chars, {
        scrollTrigger: { trigger: el, start: "top 85%" },
        yPercent: 120, opacity: 0, filter: "blur(8px)",
        duration: 0.8, ease: "power3.out", stagger: 0.014
      });
    });
  } else {
    splitTargets.forEach(function (el) { el.style.opacity = 1; });
  }

  /* 4. GENERIC REVEAL + staggered groups */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (hasST && !prefersReduced) {
    reveals.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: function () { el.classList.add("in"); }
      });
    });
    document.querySelectorAll(".bento, .stats__grid").forEach(function (grid) {
      var items = grid.querySelectorAll("[data-reveal]");
      ScrollTrigger.create({
        trigger: grid, start: "top 82%", once: true,
        onEnter: function () {
          items.forEach(function (it, i) {
            setTimeout(function () { it.classList.add("in"); }, i * 90);
          });
        }
      });
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* 5. MENTOR BIO TEXT-HIGHLIGHT SCRUB */
  var bios = document.querySelectorAll("[data-reveal-text]");
  if (hasST && !prefersReduced) {
    var hasSplit = typeof SplitType !== "undefined";
    bios.forEach(function (el) {
      if (hasSplit) {
        var split = new SplitType(el, { types: "words", tagName: "span" });
        split.words.forEach(function (w) { w.classList.add("reveal-word"); });
        gsap.to(split.words, {
          color: "#eef3f7", ease: "none", stagger: 0.5,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: true }
        });
      } else {
        /* fallback: se SplitType non carica, illumina comunque il paragrafo intero */
        gsap.fromTo(el, { color: "#44566d" }, {
          color: "#eef3f7", ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: true }
        });
      }
    });
  }

  /* 6. HERO VIDEO - 3D reveal: pinnato e dritto quando e' centrato */
  var heroMedia = document.querySelector("[data-hero-media]");
  var heroVideo = document.querySelector(".hero__video");
  if (heroMedia && heroVideo && hasST && !prefersReduced && !isTouch) {
    /* A) PROSPETTIVA 3D: parte dal primo scroll (scrub sulla hero) */
    gsap.set(heroMedia, { transformPerspective: 1500, rotateX: 40, scale: 1.12 });
    gsap.to(heroMedia, {
      rotateX: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "+=420", scrub: 0.6 }
    });
  } else if (heroMedia && hasGSAP) {
    gsap.set(heroMedia, { rotateX: 0, scale: 1 });
  }

  /* 7. SCROLL-STACKING REVIEWS */
  var stack = document.querySelector("[data-stack]");
  if (stack && hasST && !prefersReduced && !isTouch) {
    var cards = Array.prototype.slice.call(stack.querySelectorAll(".review"));
    var baseTop = 110;
    cards.forEach(function (card, i) {
      card.style.top = (baseTop + i * 16) + "px";
      card.style.zIndex = i + 1;
      if (i < cards.length - 1) {
        gsap.to(card, {
          scale: 0.9, filter: "brightness(0.6)", ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top " + (baseTop + i * 16) + "px",
            scrub: true
          }
        });
      }
    });
  }

  /* 8. STORYTELLING SCROLL RAILS */
  document.querySelectorAll("[data-story]").forEach(function (sec) {
    var fill = sec.querySelector(".story-rail__fill");
    var dots = Array.prototype.slice.call(sec.querySelectorAll(".story-rail__dot"));
    if (!fill) return;
    if (prefersReduced || !hasST) {
      fill.style.transform = "scaleY(1)";
      dots.forEach(function (d) { d.classList.add("active"); });
      return;
    }
    gsap.to(fill, {
      scaleY: 1, ease: "none",
      scrollTrigger: {
        trigger: sec, start: "top 70%", end: "bottom 65%", scrub: true,
        onUpdate: function (self) {
          var pr = self.progress;
          dots.forEach(function (d) {
            var dp = (parseFloat(d.style.top) || 0) / 100;
            d.classList.toggle("active", pr >= dp - 0.02);
          });
        }
      }
    });
  });

  /* 9. FRAME-BY-FRAME CANVAS SCRUB */
  document.querySelectorAll("[data-frames]").forEach(function (canvas) {
    var ctx = canvas.getContext("2d");
    var TOTAL = parseInt(canvas.dataset.total,10) || 48;
    var COLS = parseInt(canvas.dataset.cols,10) || 4;
    var ROWS = parseInt(canvas.dataset.rows,10) || 3;
    var CELLS = COLS * ROWS;
    var LABEL = canvas.dataset.label || "Elementi";
    var lastFrame = 0;

    function roundRect(c, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    function draw(frame) {
      lastFrame = frame;
      var rect = canvas.getBoundingClientRect();
      var w = rect.width, h = rect.height, p = frame / TOTAL;
      ctx.clearRect(0, 0, w, h);
      var bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#0d1c33");
      bg.addColorStop(1, "#112446");
      ctx.fillStyle = bg;
      roundRect(ctx, 0, 0, w, h, 12);
      ctx.fill();

      var pad = 26, gap = 14;
      var cw = (w - pad * 2 - gap * (COLS - 1)) / COLS;
      var ch = (h - pad * 2 - gap * (ROWS - 1)) / ROWS;
      var shown = p * CELLS;
      for (var i = 0; i < CELLS; i++) {
        var col = i % COLS, row = Math.floor(i / COLS);
        var x = pad + col * (cw + gap);
        var y = pad + row * (ch + gap);
        var local = Math.max(0, Math.min(1, shown - i));
        ctx.fillStyle = "rgba(217,225,232,0.05)";
        roundRect(ctx, x, y, cw, ch, 8);
        ctx.fill();
        if (local > 0) {
          ctx.save();
          ctx.globalAlpha = local;
          var g = ctx.createLinearGradient(x, y, x + cw, y + ch);
          g.addColorStop(0, "#2F80ED");
          g.addColorStop(1, "#A3E635");
          ctx.fillStyle = g;
          var sc = 0.6 + 0.4 * local;
          var dw = cw * sc, dh = ch * sc;
          roundRect(ctx, x + (cw - dw) / 2, y + (ch - dh) / 2, dw, dh, 8);
          ctx.fill();
          ctx.globalAlpha = local * 0.85;
          ctx.fillStyle = "rgba(6,14,26,0.55)";
          var lx = x + (cw - dw) / 2 + 8;
          var ly = y + (ch - dh) / 2;
          ctx.fillRect(lx, ly + 8, dw - 16, 4);
          ctx.fillRect(lx, ly + 18, (dw - 16) * 0.6, 4);
          ctx.restore();
        }
      }
      var sy = pad + p * (h - pad * 2);
      ctx.strokeStyle = "rgba(163,230,53,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, sy);
      ctx.lineTo(w - pad, sy);
      ctx.stroke();
      ctx.fillStyle = "rgba(217,225,232,0.7)";
      ctx.font = "600 12px 'Hanken Grotesk', sans-serif";
      var fnum = String(Math.round(frame));
      if (fnum.length < 2) fnum = "0" + fnum;
      var label = LABEL + " " + fnum + " / " + TOTAL;
      ctx.fillText(label, pad, h - 12);
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(lastFrame);
    }

    resize();
    window.addEventListener("resize", function () {
      clearTimeout(canvas._rt);
      canvas._rt = setTimeout(resize, 150);
    });

    if (hasST && !prefersReduced) {
      ScrollTrigger.create({
        trigger: canvas.closest(".card") || canvas,
        start: "top 85%", end: "bottom 25%", scrub: true,
        onUpdate: function (self) { draw(self.progress * TOTAL); }
      });
    } else {
      draw(TOTAL);
    }
  });

  /* 10. COUNT-UP STATS */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var run = function () {
      if (prefersReduced || !hasGSAP) { el.textContent = end + suffix; return; }
      var obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.6, ease: "power2.out",
        onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
      });
    };
    if (hasST) ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: run });
    else run();
  });

  /* 11. ACCORDIONS */
  document.querySelectorAll("[data-accordion]").forEach(function (acc) {
    var items = acc.querySelectorAll(".acc-item");
    items.forEach(function (item) {
      var trigger = item.querySelector(".acc-trigger");
      var panel = item.querySelector(".acc-panel");
      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".acc-panel").style.height = "0px";
          }
        });
        if (isOpen) {
          item.classList.remove("open");
          panel.style.height = "0px";
        } else {
          item.classList.add("open");
          panel.style.height = panel.scrollHeight + "px";
        }
        if (hasST) setTimeout(function () { ScrollTrigger.refresh(); }, 420);
      });
    });
  });

  /* 12. TILT */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var strength = 6;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (px * strength) + "deg) rotateX(" + (-py * strength) + "deg) translateY(-4px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* 13. CUSTOM CURSOR */
  var cursor = document.getElementById("cursor");
  if (cursor && !isTouch && !prefersReduced) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    var loop = function () {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("a,button,[data-cursor],.acc-trigger,input").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
  }

  /* 14. PARALLAX (hero glow + CTA bg) */
  if (hasST && !prefersReduced) {
    var glow = document.querySelector(".hero__glow");
    if (glow) gsap.to(glow, {
      yPercent: 18, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    /* niente transform sul <video>: lo congelerebbe al primo frame su alcuni browser */
    var ctaImg = document.querySelector(".finalcta__bg.ph--bg");
    if (ctaImg) gsap.fromTo(ctaImg, { scale: 1.18 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: ".finalcta", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* 15. FORM (demo) + BACK TO TOP */
  var form = document.getElementById("regForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("formMsg");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (msg) msg.hidden = false;
      form.querySelectorAll("input").forEach(function (i) { i.value = ""; });
    });
  }
  var toTop = document.getElementById("toTop");
  if (toTop) toTop.addEventListener("click", function () {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* 16. PRODUCT CARDS - border illumination loop */
  var bento = document.getElementById("bento");
  if (bento && !prefersReduced) {
    var lcards = Array.prototype.slice.call(bento.querySelectorAll(".card"));
    if (lcards.length) {
      var li = 0;
      var lit = function () {
        lcards.forEach(function (c) { c.classList.remove("is-lit"); });
        lcards[li].classList.add("is-lit");
        li = (li + 1) % lcards.length;
      };
      lit();
      setInterval(lit, 2000);
    }
  }

  /* 17. COUNTDOWN */
  var cd = document.getElementById("countdown");
  if (cd) {
    var deadline = new Date(cd.dataset.deadline || "2026-07-30T23:59:59").getTime();
    var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
    var tick = function () {
      var diff = deadline - Date.now(); if (diff < 0) diff = 0;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff / 3600000) % 24;
      var m = Math.floor(diff / 60000) % 60;
      var sec = Math.floor(diff / 1000) % 60;
      var setv = function (k, v) {
        var el = cd.querySelector("[data-" + k + "]");
        if (!el) return;
        var nv = pad2(v);
        if (el.textContent !== nv) {
          el.textContent = nv;
          el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip");
        }
      };
      setv("d", d); setv("h", h); setv("m", m); setv("s", sec);
    };
    tick(); setInterval(tick, 1000);
  }

  /* 18. METHOD STICKY STORYTELLING (3 step) */
  (function () {
    if (!hasST) return;
    var section = document.querySelector(".method");
    if (!section) return;
    var steps = Array.prototype.slice.call(section.querySelectorAll(".step"));
    var progressFill = document.getElementById("methodProgress");
    var labels = document.querySelectorAll("[data-step-label]");
    if (!steps.length) return;
    function setActive(idx) {
      steps.forEach(function (st, i) { st.classList.toggle("is-active", i === idx); });
      labels.forEach(function (l, i) { l.classList.toggle("is-active", i === idx); });
      section.setAttribute("data-active", idx + 1);
      if (progressFill) progressFill.style.width = ((idx + 1) / steps.length) * 100 + "%";
    }
    ScrollTrigger.create({
      trigger: section, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) {
        var idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        setActive(idx);
      }
    });
    setActive(0);
  })();

  /* 20. FINAL CTA VIDEO - autoplay robusto (IO + interazione) */
  (function () {
    var fv = document.getElementById("finalVideo");
    if (!fv) return;
    fv.muted = true; fv.defaultMuted = true; fv.setAttribute("muted", "");
    fv.playsInline = true;
    var tryPlay = function () { var p = fv.play(); if (p && p.catch) p.catch(function () {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) tryPlay(); });
      }, { threshold: 0.15 }).observe(fv);
    }
    ["canplay", "loadeddata"].forEach(function (ev) { fv.addEventListener(ev, tryPlay); });
    ["pointerdown", "scroll", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, tryPlay, { once: true, passive: true });
    });
    tryPlay();
  })();

  window.addEventListener("load", function () { if (hasST) ScrollTrigger.refresh(); });
})();
