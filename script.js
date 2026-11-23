// ========== Year ==========
document.getElementById('year').textContent = new Date().getFullYear();

// ========== Theme ==========
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ========== Language ==========
const langToggle = document.getElementById('langToggle');
const savedLang = localStorage.getItem('lang');
const initialLang = savedLang || 'zh';
document.documentElement.setAttribute('data-lang', initialLang);
document.documentElement.setAttribute('lang', initialLang === 'en' ? 'en' : 'zh-CN');
langToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-lang');
  const next = current === 'en' ? 'zh' : 'en';
  document.documentElement.setAttribute('data-lang', next);
  document.documentElement.setAttribute('lang', next === 'en' ? 'en' : 'zh-CN');
  localStorage.setItem('lang', next);
});

// ========== Mobile menu ==========
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ========== Navbar scroll state ==========
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ========== Scroll reveal + skill bars ==========
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.skill-bar').forEach(bar => {
        bar.style.width = bar.style.getPropertyValue('--w');
      });
      skillObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
const aboutEl = document.getElementById('about');
if (aboutEl) skillObserver.observe(aboutEl);

// ========== Active nav link ==========
const sections = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => spy.observe(s));

// ========== Body scroll lock (counter) ==========
let scrollLock = 0;
const lockScroll = () => { if (++scrollLock === 1) document.body.style.overflow = 'hidden'; };
const unlockScroll = () => { if (--scrollLock <= 0) { scrollLock = 0; document.body.style.overflow = ''; } };

// ========== Project Detail Modal ==========
const modal = document.getElementById('projectModal');
const modalGallery = document.getElementById('modalGallery');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalTags = document.getElementById('modalTags');

function openModal(card) {
  modalTitle.innerHTML = card.querySelector('.project-title').innerHTML;
  modalBody.innerHTML = card.querySelector('.project-detail').innerHTML;
  modalTags.innerHTML = '';
  modalTags.appendChild(card.querySelector('.tags').cloneNode(true));

  // gallery thumbnails
  modalGallery.innerHTML = '';
  const images = getImages(card);
  images.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src;
    im.alt = '';
    im.loading = 'lazy';
    im.addEventListener('click', () => openLightbox(images, i));
    modalGallery.appendChild(im);
  });

  modal.hidden = false;
  lockScroll();
}
function closeModal() { modal.hidden = true; unlockScroll(); }

document.querySelectorAll('[data-open-detail]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.closest('.project-card')));
});
modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));

// ========== Image Lightbox ==========
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCounter = document.getElementById('lbCounter');
let lbImages = [];
let lbIndex = 0;

function getImages(card) {
  try { return JSON.parse(card.dataset.images || '[]'); } catch { return []; }
}
function renderLightbox() {
  lbImg.src = lbImages[lbIndex];
  lbCounter.textContent = `${lbIndex + 1} / ${lbImages.length}`;
  document.getElementById('lbPrev').style.display = lbImages.length > 1 ? '' : 'none';
  document.getElementById('lbNext').style.display = lbImages.length > 1 ? '' : 'none';
  lbCounter.style.display = lbImages.length > 1 ? '' : 'none';
}
function openLightbox(images, index = 0) {
  if (!images.length) return;
  lbImages = images;
  lbIndex = index;
  renderLightbox();
  lightbox.hidden = false;
  lockScroll();
}
function closeLightbox() { lightbox.hidden = true; unlockScroll(); }
function lbPrev() { if (lbImages.length > 1) { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLightbox(); } }
function lbNext() { if (lbImages.length > 1) { lbIndex = (lbIndex + 1) % lbImages.length; renderLightbox(); } }

document.getElementById('lbPrev').addEventListener('click', lbPrev);
document.getElementById('lbNext').addEventListener('click', lbNext);
lightbox.querySelectorAll('[data-close-lightbox]').forEach(el => el.addEventListener('click', closeLightbox));

// Click project media → open lightbox (only when images exist)
document.querySelectorAll('.project-card').forEach(card => {
  const images = getImages(card);
  const media = card.querySelector('.project-media');
  if (images.length) {
    media.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-detail]')) return;
      openLightbox(images, 0);
    });
  } else {
    media.style.cursor = 'default';
  }
});

// ========== Keyboard: Esc closes topmost; arrows navigate lightbox ==========
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!lightbox.hidden) closeLightbox();
    else if (!modal.hidden) closeModal();
  } else if (!lightbox.hidden) {
    if (e.key === 'ArrowLeft') lbPrev();
    if (e.key === 'ArrowRight') lbNext();
  }
});
