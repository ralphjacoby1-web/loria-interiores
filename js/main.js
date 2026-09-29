/* =========================================================
   LORIA INTERIORES — interacciones
   ========================================================= */

/* ---- Datos de contacto: cambiar acá y se actualiza todo el sitio ---- */
const CONFIG = {
  email: 'hola@loriainteriores.com',            // TODO: reemplazar por el mail real
  instagram: 'https://www.instagram.com/loria.interiores/',
  instagramUser: '@loria.interiores',
  phoneDisplay: '03546 512921',
  phoneTel: '+543546512921',
  whatsapp: '5493546512921',
  whatsappText: 'Hola Loria! Vi su web y quería consultar por un proyecto.',
};

(() => {
  'use strict';

  const d = document;
  const html = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- datos de contacto ---------- */
  const waHref = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappText)}`;
  $$('[data-mail]').forEach(a => {
    a.href = `mailto:${CONFIG.email}`;
    if (a.dataset.mail === 'text') a.textContent = CONFIG.email;
  });
  $$('[data-mail-text]').forEach(el => (el.textContent = CONFIG.email));
  $$('[data-ig]').forEach(a => {
    a.href = CONFIG.instagram;
    a.target = '_blank';
    a.rel = 'noopener';
    if (a.dataset.ig === 'text') a.textContent = CONFIG.instagramUser;
  });
  $$('[data-wa]').forEach(a => {
    a.href = waHref;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-tel]').forEach(a => {
    a.href = `tel:${CONFIG.phoneTel}`;
    if (a.dataset.tel === 'text') a.textContent = CONFIG.phoneDisplay;
  });
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  }
  const stopScroll = () => (lenis ? lenis.stop() : (html.style.overflow = 'hidden'));
  const startScroll = () => (lenis ? lenis.start() : (html.style.overflow = ''));

  /* ---------- motor de scroll ---------- */
  let sy = scrollY, vh = innerHeight, vw = innerWidth, lastY = sy, vel = 0;
  const onFrame = [];
  const onResize = [];
  const loop = t => {
    if (lenis) lenis.raf(t);
    sy = scrollY;
    vel = lerp(vel, sy - lastY, .12);
    lastY = sy;
    for (const f of onFrame) f();
    requestAnimationFrame(loop);
  };
  const measureAll = () => {
    vh = innerHeight;
    vw = innerWidth;
    onResize.forEach(f => f());
  };
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(measureAll, 120); });
  addEventListener('load', measureAll);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(measureAll);

  /* ---------- split de texto en palabras ---------- */
  function split(el, withDelay = true) {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
            const w = d.createElement('span');
            w.className = 'w';
            const inner = d.createElement('span');
            inner.textContent = part;
            if (withDelay) inner.style.transitionDelay = `${(i * .055).toFixed(3)}s`;
            i++;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
  }
  $$('[data-split]').forEach(el => split(el));
  $$('[data-stagger]').forEach(el => [...el.children].forEach((c, i) => c.style.setProperty('--i', i)));

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  const startReveals = () => $$('[data-split], [data-reveal], [data-stagger], .footer__big, .step').forEach(el => io.observe(el));

  /* ---------- header ---------- */
  const header = $('.site-header');
  let hY = 0;
  onFrame.push(() => {
    if (!header) return;
    header.classList.toggle('is-solid', sy > 40);
    const dy = sy - hY;
    if (Math.abs(dy) > 8) {
      header.classList.toggle('is-hidden', dy > 0 && sy > 500 && !html.classList.contains('menu-open'));
      hY = sy;
    }
  });

  /* ---------- menú móvil ---------- */
  const burger = $('.burger');
  const setMenu = open => {
    html.classList.toggle('menu-open', open);
    if (open && header) header.classList.remove('is-hidden');
    burger && burger.setAttribute('aria-expanded', String(open));
    open ? stopScroll() : startScroll();
  };
  burger && burger.addEventListener('click', () => setMenu(!html.classList.contains('menu-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && html.classList.contains('menu-open')) setMenu(false); });

  /* ---------- WhatsApp flotante ---------- */
  const waF = $('.wa-float');
  onFrame.push(() => waF && waF.classList.toggle('is-on', sy > vh * .8));

  /* ---------- volver arriba ---------- */
  $$('[data-top]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    lenis ? lenis.scrollTo(0, { duration: 1.8 }) : scrollTo({ top: 0, behavior: 'smooth' });
  }));

  /* ---------- parallax ---------- */
  const pxEls = $$('[data-parallax]').map(el => ({ el, s: parseFloat(el.dataset.parallax) || .08 }));
  onFrame.push(() => {
    if (reduce) return;
    for (const o of pxEls) {
      const r = o.el.parentElement.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      o.el.style.transform = `translate3d(0, ${(p * o.s * 100).toFixed(2)}%, 0)`;
    }
  });

  /* ---------- HERO: el arco se abre ---------- */
  const hero = $('[data-hero]');
  let heroIntro = () => {};
  if (hero) {
    const sticky = $('.hero__sticky', hero);
    const media = $('.hero__media', hero);
    const frame = $('.hero__frame', hero);
    const zoom = $('.hero__zoom', hero);
    const wl = $('.hero__word--l', hero);
    const wr = $('.hero__word--r', hero);
    const meta = $('.hero__meta', hero);
    const cap = $('.hero__caption', hero);
    const shade = $('.hero__shade', hero);
    let box = null, top = 0, span = 1, k = 0;

    const measure = () => {
      const s = sticky.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      box = { t: f.top - s.top, l: f.left - s.left, w: f.width, h: f.height, W: s.width, H: s.height };
      top = hero.getBoundingClientRect().top + scrollY;
      span = Math.max(1, hero.offsetHeight - s.height);
    };
    measure();
    onResize.push(measure);

    heroIntro = () => {
      const t0 = performance.now();
      const dur = reduce ? 1 : 1700;
      const step = now => {
        k = easeOut(clamp((now - t0) / dur));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      $$('[data-split]', hero).forEach(el => el.classList.add('is-in'));
    };

    const mobile = matchMedia('(max-width: 900px)');
    onFrame.push(() => {
      if (!box || sy > top + span + vh) return;
      const p = clamp((sy - top) / span);
      const e = easeInOut(p);
      const t0 = box.t + box.h * (1 - k);
      const T = lerp(t0, 0, e);
      const L = lerp(box.l, 0, e);
      const R = lerp(box.W - box.l - box.w, 0, e);
      const B = lerp(box.H - box.t - box.h, 0, e);
      const rad = lerp(box.w / 2, 0, e);
      media.style.clipPath = `inset(${T.toFixed(1)}px ${R.toFixed(1)}px ${B.toFixed(1)}px ${L.toFixed(1)}px round ${rad.toFixed(1)}px ${rad.toFixed(1)}px 0 0)`;
      zoom.style.transform = `scale(${lerp(1.22, 1, e).toFixed(4)})`;

      const fade = clamp(1 - e * 2.2);
      if (mobile.matches) {
        wl.style.transform = `translate3d(0, ${(-e * 16).toFixed(2)}vh, 0)`;
        wr.style.transform = `translate3d(0, ${(e * 16).toFixed(2)}vh, 0)`;
      } else {
        wl.style.transform = `translate3d(${(-e * 28).toFixed(2)}vw, 0, 0)`;
        wr.style.transform = `translate3d(${(e * 28).toFixed(2)}vw, 0, 0)`;
      }
      wl.style.opacity = wr.style.opacity = fade;
      if (meta) meta.style.opacity = clamp(1 - p * 5);
      shade.style.opacity = clamp((e - .45) / .4);
      const c = clamp((p - .72) / .22);
      cap.style.opacity = c;
      cap.style.transform = `translate3d(0, ${((1 - c) * 40).toFixed(1)}px, 0)`;
    });

    // slideshow con crossfade
    const slides = $$('.hero__slide', hero);
    let cur = 0;
    if (slides.length > 1 && !reduce) {
      setInterval(() => {
        slides[cur].classList.remove('is-active');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('is-active');
      }, 5600);
    }
  }

  /* ---------- párrafo que se "entinta" al scrollear ---------- */
  $$('[data-fill]').forEach(el => {
    split(el, false);
    const words = $$('.w', el);
    const last = new Array(words.length).fill(-1);
    onFrame.push(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp((vh * .82 - r.top) / (r.height + vh * .2));
      const x = p * (words.length + 6) - 3;
      words.forEach((w, i) => {
        const o = Math.round((.14 + .86 * clamp(x - i)) * 100) / 100;
        if (o !== last[i]) { w.style.opacity = o; last[i] = o; }
      });
    });
  });

  /* ---------- scroll horizontal de ambientes ---------- */
  const hs = $('[data-hscroll]');
  if (hs) {
    const rail = $('.spaces__rail', hs);
    const bar = $('.spaces__progress i', hs);
    const desk = matchMedia('(min-width: 901px)');
    let dist = 0, top = 0;
    const measure = () => {
      if (!desk.matches) { hs.style.height = ''; rail.style.transform = ''; dist = 0; return; }
      dist = Math.max(0, rail.scrollWidth - vw);
      hs.style.height = `${dist + vh}px`;
      top = hs.getBoundingClientRect().top + scrollY;
    };
    measure();
    onResize.push(measure);
    onFrame.push(() => {
      if (!dist) return;
      const p = clamp((sy - top) / dist);
      rail.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    });
  }

  /* ---------- marquee reacciona a la velocidad ---------- */
  const mq = $('.marquee__skew');
  if (mq && !reduce) {
    onFrame.push(() => {
      const r = mq.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      mq.style.transform = `skewX(${clamp(-vel * .35, -12, 12).toFixed(2)}deg)`;
    });
  }

  /* ---------- línea del proceso ---------- */
  const proc = $('.process__steps');
  if (proc) {
    const line = $('.process__line i', proc);
    onFrame.push(() => {
      const r = proc.getBoundingClientRect();
      const p = clamp((vh * .6 - r.top) / r.height);
      line.style.transform = `scaleY(${p.toFixed(4)})`;
    });
  }

  /* ---------- cursor ---------- */
  if (fine && !reduce) {
    const c = $('.cursor');
    if (c) {
      html.classList.add('has-cursor');
      const label = $('.cursor__label', c);
      let mx = -100, my = -100, cx = -100, cy = -100;
      addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        c.classList.add('is-visible');
      }, { passive: true });
      d.addEventListener('mouseleave', () => c.classList.remove('is-visible'));
      d.addEventListener('mouseover', e => {
        const lab = e.target.closest('[data-cursor]');
        const link = e.target.closest('a, button, label, input, textarea');
        c.classList.toggle('is-label', !!lab);
        c.classList.toggle('is-link', !lab && !!link);
        if (lab) label.textContent = lab.dataset.cursor;
      });
      onFrame.push(() => {
        cx = lerp(cx, mx, .2);
        cy = lerp(cy, my, .2);
        c.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      });
    }
  }

  /* ---------- servicios: imagen que sigue al cursor ---------- */
  const svcList = $('.services');
  const svcFloat = $('.svc-float');
  if (svcList && svcFloat && fine) {
    const imgs = $$('img', svcFloat);
    const inner = $('.svc-float__inner', svcFloat);
    let mx = 0, my = 0, fx = 0, fy = 0, prevX = 0;
    $$('.svc', svcList).forEach((row, i) => {
      row.addEventListener('mouseenter', () => {
        imgs.forEach((im, j) => im.classList.toggle('is-active', j === i));
        svcFloat.classList.add('is-on');
      });
    });
    svcList.addEventListener('mouseleave', () => svcFloat.classList.remove('is-on'));
    svcList.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    onFrame.push(() => {
      fx = lerp(fx, mx, .12);
      fy = lerp(fy, my, .12);
      const rot = clamp((mx - prevX) * .08, -8, 8);
      prevX = lerp(prevX, mx, .2);
      svcFloat.style.left = `${fx.toFixed(1)}px`;
      svcFloat.style.top = `${fy.toFixed(1)}px`;
      inner.style.transform = `rotate(${rot.toFixed(2)}deg)`;
    });
  }

  /* ---------- proyectos: filtros ---------- */
  const filterBtns = $$('.filter');
  const gItems = $$('.g-item');
  const applyFilter = f => {
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    gItems.forEach(it => {
      const show = f === 'all' || it.dataset.cat === f;
      if (show) {
        it.hidden = false;
        void it.offsetWidth;
        it.classList.remove('is-hidden');
      } else {
        it.classList.add('is-hidden');
        setTimeout(() => { if (it.classList.contains('is-hidden')) it.hidden = true; }, 450);
      }
    });
    setTimeout(measureAll, 500);
  };
  if (filterBtns.length) {
    filterBtns.forEach(b => b.addEventListener('click', () => {
      applyFilter(b.dataset.filter);
      history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : `#${b.dataset.filter}`);
    }));
    const h = location.hash.slice(1);
    if (h && filterBtns.some(b => b.dataset.filter === h)) applyFilter(h);
  }

  /* ---------- lightbox ---------- */
  const lb = $('.lightbox');
  if (lb && gItems.length) {
    const img = $('.lightbox__stage img', lb);
    const capT = $('.lightbox__cap b', lb);
    const capC = $('.lightbox__cap span', lb);
    const count = $('.lightbox__count', lb);
    let list = [], idx = 0, lastFocus = null;

    const show = i => {
      idx = (i + list.length) % list.length;
      const it = list[idx];
      img.classList.add('is-swapping');
      const src = it.dataset.full;
      const pre = new Image();
      pre.onload = pre.onerror = () => {
        setTimeout(() => {
          img.src = src;
          img.alt = $('img', it).alt;
          img.classList.remove('is-swapping');
        }, 180);
      };
      pre.src = src;
      capT.textContent = $('figcaption b', it).textContent;
      capC.textContent = $('figcaption span', it).textContent;
      count.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    };
    const open = it => {
      list = gItems.filter(x => !x.hidden);
      lastFocus = d.activeElement;
      lb.hidden = false;
      stopScroll();
      show(list.indexOf(it));
      void lb.offsetWidth;
      lb.classList.add('is-open');
      $('.lightbox__close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      startScroll();
      setTimeout(() => { lb.hidden = true; }, 500);
      lastFocus && lastFocus.focus();
    };
    gItems.forEach(it => $('.g-item__btn', it).addEventListener('click', () => open(it)));
    $('.lightbox__close', lb).addEventListener('click', close);
    $('[data-prev]', lb).addEventListener('click', () => show(idx - 1));
    $('[data-next]', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target.classList.contains('lightbox__stage')) close(); });
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
    let tx = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- formulario de contacto (mail o WhatsApp) ---------- */
  const form = $('[data-contact-form]');
  if (form) {
    const note = $('.form__note', form);
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const via = e.submitter && e.submitter.value === 'wa' ? 'wa' : 'mail';
      const nombre = String(fd.get('nombre') || '').trim();
      const espacios = fd.getAll('espacio').join(', ');
      const tel = String(fd.get('telefono') || '').trim();
      const body = [
        `Hola Loria! Soy ${nombre}.`,
        espacios ? `Me interesa trabajar: ${espacios}.` : '',
        '',
        String(fd.get('mensaje') || '').trim(),
        '',
        `Email: ${fd.get('email')}`,
        tel ? `Teléfono: ${tel}` : '',
      ].join('\n').replace(/\n{3,}/g, '\n\n').trim();

      if (via === 'wa') {
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
        note.textContent = 'Abrimos WhatsApp con tu mensaje listo para enviar.';
      } else {
        const subject = `Consulta desde la web — ${nombre}`;
        location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        note.textContent = 'Se abrió tu aplicación de correo con el mensaje listo. ¡Gracias!';
      }
    });
  }

  /* ---------- transiciones entre páginas ---------- */
  const pt = $('.pt');
  const leave = url => {
    if (!pt || reduce) { location.href = url; return; }
    setMenu(false);
    pt.className = 'pt is-leave-start';
    void pt.offsetWidth;
    pt.className = 'pt is-leave';
    setTimeout(() => { location.href = url; }, 820);
  };
  d.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a || e.defaultPrevented) return;
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (/^(#|mailto:|tel:|https?:|\/\/)/.test(href)) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) {
      if (url.hash) return; // mismo documento con ancla: lo maneja el navegador/filtros
      e.preventDefault();
      setMenu(false);
      return;
    }
    e.preventDefault();
    leave(url.href);
  });
  addEventListener('pageshow', e => {
    if (e.persisted && pt) { pt.className = 'pt is-out'; startScroll(); }
  });

  /* ---------- arranque ---------- */
  const start = () => {
    measureAll();
    heroIntro();
    startReveals();
  };

  requestAnimationFrame(loop);

  const loader = $('.loader');
  if (html.classList.contains('has-loader') && loader) {
    try { sessionStorage.setItem('loria-intro', '1'); } catch (err) { /* modo privado */ }
    if (pt) pt.className = 'pt';
    stopScroll();
    scrollTo(0, 0);
    const wait = reduce ? 200 : 2900;
    setTimeout(() => {
      loader.classList.add('is-done');
      setTimeout(start, 350);
      setTimeout(() => {
        html.classList.remove('has-loader');
        startScroll();
      }, 1200);
    }, wait);
  } else {
    if (pt) {
      setTimeout(() => { pt.className = 'pt is-out'; }, 60);
    }
    setTimeout(start, reduce ? 0 : 380);
  }
})();
