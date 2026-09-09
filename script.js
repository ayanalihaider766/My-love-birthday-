// ============================================================
// Utility
// ============================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeText(el, text, speed, onDone) {
  if (prefersReducedMotion) {
    el.textContent = text;
    if (onDone) onDone();
    return;
  }
  let i = 0;
  el.textContent = '';
  const timer = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      if (onDone) onDone();
    }
  }, speed);
}

// types into el while keeping a blinking <span class="cursor"> at the end —
// used for the love letter, matching the .letter-text .cursor styles in CSS
function typeTextWithCursor(el, text, speed, onDone) {
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  el.appendChild(cursor);

  if (prefersReducedMotion) {
    cursor.remove();
    el.textContent = text;
    if (onDone) onDone();
    return;
  }

  let i = 0;
  const timer = setInterval(() => {
    cursor.insertAdjacentText('beforebegin', text.charAt(i));
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      setTimeout(() => cursor.remove(), 700);
      if (onDone) onDone();
    }
  }, speed);
}

// ============================================================
// Background particles (canvas)
// ============================================================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initParticles() {
  const count = window.innerWidth < 700 ? 45 : 90;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.4,
    speedY: Math.random() * 0.25 + 0.05,
    drift: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.15,
    hue: Math.random() > 0.5 ? '255,143,179' : '165,107,255'
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `rgba(${p.hue},0.8)`;
    ctx.fill();

    p.y -= p.speedY;
    p.x += p.drift;

    if (p.y < -5) {
      p.y = canvas.height + 5;
      p.x = Math.random() * canvas.width;
    }
    if (p.x < -5) p.x = canvas.width + 5;
    if (p.x > canvas.width + 5) p.x = -5;
  }
  requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});
if (!prefersReducedMotion) requestAnimationFrame(animateParticles);
else ctx.clearRect(0, 0, canvas.width, canvas.height);

// ============================================================
// Floating hearts
// ============================================================
const heartsWrap = document.getElementById('floating-hearts');

function spawnHeart() {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = '❤';
  const size = Math.random() * 16 + 10;
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = size + 'px';
  heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
  const duration = Math.random() * 8 + 9;
  heart.style.animationDuration = duration + 's';
  heartsWrap.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

setInterval(spawnHeart, 900);
for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 180);

function heartBurst(count = 22) {
  for (let i = 0; i < count; i++) setTimeout(spawnHeart, i * 45);
}

// ============================================================
// Intro sequence
// ============================================================
const introLineEl = document.getElementById('introLine');
const openHeartBtn = document.getElementById('openHeartBtn');
const introSection = document.getElementById('intro');
const site = document.getElementById('site');

const introMessage = "Everything on the next few pages is true. Every word, every memory, every reason — all of it is you.";

document.body.style.overflow = 'hidden';

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    typeText(introLineEl, introMessage, 35, () => {
      introLineEl.classList.add('done');
    });
  }, 500);
});

openHeartBtn.addEventListener('click', () => {
  heartBurst(30);
  introSection.classList.add('leaving');

  setTimeout(() => {
    introSection.hidden = true;
    site.hidden = false;
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);

    initScrollReveal();
    initMemoryFlip();
    initReasonTaps();
    initFinalSequence();
    startCounter();
  }, 1150);
});

// ============================================================
// Love letter — typed out with a blinking cursor when it scrolls into view
// ============================================================
const letterTextEl = document.getElementById('letterText');
const letterSection = document.getElementById('letterSection');

const letterMessage =
  "My Nida,\n\n" +
  "I don't really know how to put everything I feel into words — but I wanted to try, at least once, somewhere you could keep coming back to.\n\n" +
  "Since 23 February 2025, so much has changed, but one thing never did: the way my heart settles the moment I talk to you. You are the calm in my chaos, the person I want to tell every small, silly, important thing to.\n\n" +
  "Thank you for staying through the hard days, for laughing with me on the good ones, and for being so effortlessly, wonderfully you. I don't take a single bit of it for granted.\n\n" +
  "I love you more than these words know how to say — my baby, my shehzadi, my munnii, my wife.\n\n" +
  "Forever yours.";

let letterTyped = false;
function typeLetter() {
  if (letterTyped) return;
  letterTyped = true;
  typeTextWithCursor(letterTextEl, letterMessage, 22);
}

// ============================================================
// Live "time together" counter
// ============================================================
const START_DATE = new Date('2025-02-23T00:00:00');

const cDays = document.getElementById('cDays');
const cHours = document.getElementById('cHours');
const cMinutes = document.getElementById('cMinutes');
const cSeconds = document.getElementById('cSeconds');

let counterStarted = false;

function updateCounter() {
  const now = new Date();
  let diff = Math.max(0, now - START_DATE);

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  const days = Math.floor(diff / day);
  diff -= days * day;
  const hours = Math.floor(diff / hour);
  diff -= hours * hour;
  const minutes = Math.floor(diff / minute);
  diff -= minutes * minute;
  const seconds = Math.floor(diff / 1000);

  cDays.textContent = days;
  cHours.textContent = String(hours).padStart(2, '0');
  cMinutes.textContent = String(minutes).padStart(2, '0');
  cSeconds.textContent = String(seconds).padStart(2, '0');
}

function startCounter() {
  if (counterStarted) return;
  counterStarted = true;
  updateCounter();
  setInterval(updateCounter, 1000);
}

// ============================================================
// Scroll-reveal — matches CSS rules that key off `.in-view`
// (.section-title, .story-date, .tl-card)
// ============================================================
function initScrollReveal() {
  const targets = document.querySelectorAll('.section-title, .story-date, .tl-card');

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('in-view'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    );
    targets.forEach((el) => observer.observe(el));
  }

  // start typing the letter the moment its section enters view
  const letterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeLetter();
          letterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );
  letterObserver.observe(letterSection);
}

// ============================================================
// Memory wall — tap/click a card to flip it (.flipped)
// ============================================================
function initMemoryFlip() {
  const cards = document.querySelectorAll('.memory-card');
  cards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
}

// ============================================================
// Reason cards — tap highlight for touch devices (.tapped mirrors :hover)
// ============================================================
function initReasonTaps() {
  const cards = document.querySelectorAll('.reason-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.add('tapped');
      setTimeout(() => card.classList.remove('tapped'), 900);
    });
  });
}

// ============================================================
// Final section — staggered reveal (.show) + modal
// ============================================================
function initFinalSequence() {
  const finalSection = document.getElementById('finalSection');
  const line1 = document.getElementById('finalLine1');
  const line2 = document.getElementById('finalLine2');
  const line3 = document.getElementById('finalLine3');
  const title = document.getElementById('finalTitle');
  const heartEl = document.querySelector('.final-heart');
  const btn = document.getElementById('lastThingBtn');

  const sequence = [
    { el: line1, delay: 0 },
    { el: line2, delay: 650 },
    { el: line3, delay: 1300 },
    { el: title, delay: 2100 },
    { el: heartEl, delay: 2900 },
    { el: btn, delay: 3500 }
  ];

  const runSequence = () => {
    sequence.forEach(({ el, delay }) => {
      setTimeout(() => el.classList.add('show'), prefersReducedMotion ? 0 : delay);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runSequence();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(finalSection);
}

// ============================================================
// "One Last Thing" modal
// ============================================================
const lastThingBtn = document.getElementById('lastThingBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');

lastThingBtn.addEventListener('click', () => {
  heartBurst(35);
  modalOverlay.hidden = false;
  requestAnimationFrame(() => modalOverlay.classList.add('visible'));
});

function closeModal() {
  modalOverlay.classList.remove('visible');
  setTimeout(() => {
    modalOverlay.hidden = true;
  }, 400);
}

closeModalBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
});
    
