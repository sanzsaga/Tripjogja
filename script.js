/* =========================================================
   JojgaTripp - script.js (JavaScript vanilla)
   ========================================================= */
(function () {
  'use strict';

  var WA_BASE = 'https://wa.me/628xxxxxxxxxx'; // ganti dengan nomor WhatsApp asli, format 62812xxxxxxx
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Link WhatsApp dengan pesan otomatis ---------- */
  $$('a[data-pesan]').forEach(function (a) {
    a.href = WA_BASE + '?text=' + encodeURIComponent(a.dataset.pesan);
  });
  $$('a[href="https://wa.me/628xxxxxxxxxx"], a[href^="https://wa.me/628xxxxxxxxxx?"]').forEach(function (a) {
    if (!a.dataset.pesan) a.href = WA_BASE;
  });

  /* ---------- Navbar: sticky + efek saat scroll ---------- */
  var header = $('#header');
  var toTop = $('#toTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Menu hamburger ---------- */
  var toggle = $('#menuToggle');
  var nav = $('#nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    document.body.classList.toggle('no-scroll', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) setMenu(false);
  });

  /* ---------- Menu aktif sesuai posisi scroll ---------- */
  var links = $$('.nav-link');
  var map = {};
  links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'destinasi', 'paket', 'galeri', 'tentang', 'kontak'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  // beri jeda bertahap untuk elemen bersaudara agar muncul berurutan
  reveals.forEach(function (el) {
    var siblings = $$('.reveal', el.parentElement).filter(function (s) { return s.parentElement === el.parentElement; });
    var i = siblings.indexOf(el);
    el.style.setProperty('--d', Math.min(i, 5) * 0.09 + 's');
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Hero slideshow ---------- */
  var slides = $$('.hero-slide');
  var dots = $$('.dot');
  var current = 0;
  var timer = null;

  function showSlide(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === current); });
    dots.forEach(function (d, idx) {
      d.classList.toggle('is-active', idx === current);
      d.setAttribute('aria-selected', String(idx === current));
    });
  }
  function startAuto() {
    if (reduceMotion) return;
    stopAuto();
    timer = setInterval(function () { showSlide(current + 1); }, 6500);
  }
  function stopAuto() { if (timer) clearInterval(timer); }

  slides.forEach(function (s) { s.loading = 'eager'; }); // pastikan slide berikutnya siap saat pergantian
  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      showSlide(parseInt(d.dataset.index, 10));
      startAuto();
    });
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto(); else startAuto();
  });
  startAuto();

  /* ---------- Modal: detail destinasi & lightbox galeri ---------- */
  var modal = $('#modal');
  var modalImg = $('#modalImg');
  var modalTitle = $('#modalTitle');
  var modalDesc = $('#modalDesc');
  var modalCta = $('#modalCta');

  function setModalImage(name, alt) {
    modalImg.onerror = function () {
      modalImg.onerror = null;
      modalImg.src = 'assets/images/' + name + '.svg';
    };
    modalImg.src = 'assets/images/' + name + '.jpg';
    modalImg.alt = alt || '';
  }
  function openModal() {
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
  }
  function closeModal() {
    if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
  }

  $$('[data-detail]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      modal.classList.remove('lightbox');
      modalTitle.textContent = btn.dataset.detail;
      modalDesc.textContent = btn.dataset.desc;
      setModalImage(btn.dataset.img, 'Foto ' + btn.dataset.detail);
      modalCta.href = WA_BASE + '?text=' + encodeURIComponent('Halo JojgaTripp, saya tertarik mengunjungi ' + btn.dataset.detail + '. Bisa dibantu?');
      openModal();
    });
  });

  $$('.g-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = $('img', btn);
      modal.classList.add('lightbox');
      setModalImage(btn.dataset.full, img ? img.alt : '');
      openModal();
    });
  });

  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal(); // klik area gelap di luar kartu
  });

  /* ---------- Smooth scroll dengan pengecualian untuk tautan kosong ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });
})();
