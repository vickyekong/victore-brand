(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     Header scroll state
     -------------------------------------------------------------------------- */
  const header = document.getElementById('header');

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* --------------------------------------------------------------------------
     Mobile navigation
     -------------------------------------------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* --------------------------------------------------------------------------
     Hero cursor spotlight
     -------------------------------------------------------------------------- */
  const hero = document.getElementById('hero');
  const spotlight = document.getElementById('heroSpotlight');

  if (!prefersReducedMotion && hero && spotlight) {
    let rafId = null;
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;

    hero.addEventListener('mouseenter', () => spotlight.classList.add('active'));
    hero.addEventListener('mouseleave', () => spotlight.classList.remove('active'));

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;

      if (!rafId) {
        rafId = requestAnimationFrame(animateSpotlight);
      }
    });

    function animateSpotlight() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      spotlight.style.setProperty('--mouse-x', currentX + '%');
      spotlight.style.setProperty('--mouse-y', currentY + '%');

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(animateSpotlight);
      } else {
        rafId = null;
      }
    }
  }

  /* --------------------------------------------------------------------------
     Hero staggered reveal on load
     -------------------------------------------------------------------------- */
  const heroReveals = document.querySelectorAll('.hero-inner .reveal');

  if (!prefersReducedMotion) {
    requestAnimationFrame(() => {
      heroReveals.forEach((el) => el.classList.add('visible'));
    });
  } else {
    heroReveals.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* --------------------------------------------------------------------------
     Scroll-triggered section reveals
     -------------------------------------------------------------------------- */
  const scrollReveals = document.querySelectorAll('.section .reveal');

  if (!prefersReducedMotion && scrollReveals.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    scrollReveals.forEach((el) => revealObserver.observe(el));
  } else {
    scrollReveals.forEach((el) => el.classList.add('in-view'));
  }

  /* --------------------------------------------------------------------------
     Process timeline draw
     -------------------------------------------------------------------------- */
  const timeline = document.querySelector('.timeline');

  if (timeline && !prefersReducedMotion) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeline.classList.add('in-view');
            timelineObserver.unobserve(timeline);
          }
        });
      },
      { threshold: 0.3 }
    );

    timelineObserver.observe(timeline);
  } else if (timeline) {
    timeline.classList.add('in-view');
  }

  /* --------------------------------------------------------------------------
     Testimonial carousel
     -------------------------------------------------------------------------- */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  let currentSlide = 0;
  let carouselInterval = null;
  const ROTATE_MS = 5000;

  function goToSlide(index) {
    currentSlide = index;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-selected', String(i === index));
    });
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function startCarousel() {
    if (prefersReducedMotion || slides.length <= 1) return;
    stopCarousel();
    carouselInterval = setInterval(nextSlide, ROTATE_MS);
  }

  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.index));
      startCarousel();
    });
  });

  const carousel = document.getElementById('testimonialCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    startCarousel();
  }

  /* --------------------------------------------------------------------------
     Contact form — mailto fallback with encoded body
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const subject = encodeURIComponent('Project inquiry from ' + name);
    const body = encodeURIComponent(
      'Name: ' + name + '\nEmail: ' + email + '\n\n' + message
    );

    window.location.href = 'mailto:info@novusafricang.com?subject=' + subject + '&body=' + body;
  });

  /* --------------------------------------------------------------------------
     Smooth anchor offset for fixed header
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const offset = header.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();
