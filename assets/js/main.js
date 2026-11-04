/**
 * MOVIMENTO PILATES STUDIO — CORE MOTION DESIGN ENGINE
 * Inspired by Core Atelier (coreatelierpilates.com):
 * 
 * 1. Lenis Inertia Smooth Scroll + GSAP ScrollTrigger synchronization
 * 2. Signature Shutter Curtain Reveal (.cover wipe)
 * 3. Scaled Heading Scroll Scrub (.scaled-heading)
 * 4. Hero Motion Sequence & Vertical Rolling Feature Ticker
 * 5. Continuous Spotlight Marquee
 * 6. Editorial Reflections Carousel with Counter & Pill Controls
 * 7. Kinetic Typography Scroll-linked Reveal
 * 8. Luxury Custom Magnetic Cursor Follower
 * 9. Magnetic Buttons (Cursor Attraction)
 * 10. Animated Google Rating Counters
 * 11. Header Blur State & Interactive Booking Drawer
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll Engine
  const lenis = initLenisScroll();

  // 2. Motion Design Core Modules
  initScrollReveals();
  initHeaderScroll();
  initMobileMenu(lenis);
  initCustomMagneticCursor();
  initHeroMotion();
  initHeroTitleFluidMotion();
  initHeroFeatureTicker();
  initShutterCurtainReveals();
  initScaledHeadings();
  initKineticTypographyScroll();
  initReflectionsCarousel();
  initMagneticButtons();
  initAnimatedCounters();
  init3DTiltCards();
  initModalBooking(lenis);
  initFooterMotionTitle();
  initNavScrollSpy();
});

/* --------------------------------------------------------------------------
   MENU: destaca a seção que está na tela
   -------------------------------------------------------------------------- */
function initNavScrollSpy() {
  const links = document.querySelectorAll('.nav-link[href^="#"]');
  if (!links.length) return;

  const byId = new Map();
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) byId.set(section.id, link);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => {
        l.classList.remove('active');
        l.removeAttribute('aria-current');
      });
      const link = byId.get(entry.target.id);
      if (link) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  byId.forEach((_, id) => observer.observe(document.getElementById(id)));
}

/* --------------------------------------------------------------------------
   1. LENIS INERTIA SMOOTH SCROLL + GSAP TICKER INTEGRATION
   -------------------------------------------------------------------------- */
function initLenisScroll() {
  if (typeof Lenis === 'undefined') {
    console.warn('[Motion] Lenis library not detected, falling back to native scroll.');
    return null;
  }

  // Quem pediu menos movimento no sistema fica com a rolagem nativa
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.8,
    infinite: false,
  });

  // Synchronize Lenis with GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.skip-link)').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const header = document.querySelector('.site-header');
        const offset = header ? -header.offsetHeight : -70;
        lenis.scrollTo(targetEl, { offset, duration: 1.4 });
      }
    });
  });

  return lenis;
}

/* --------------------------------------------------------------------------
   1.5. SCROLL REVEALS (Intersection Observer + Immediate Initial Viewport Pass)
   -------------------------------------------------------------------------- */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal-fade-up, .reveal-fade-in');
  if (!reveals.length) return;

  const revealEl = (el) => {
    el.classList.add('is-revealed');
  };

  // 1. Immediately reveal elements that are already within or near initial viewport
  reveals.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 150) {
      revealEl(el);
    }
  });

  // 2. Observer for remaining elements as user scrolls
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealEl(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px 40px 0px',
    threshold: 0.05
  });

  reveals.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   2. HEADER SCROLL & PROGRESS INDICATOR
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  const progressBar = document.getElementById('scroll-progress-bar');

  const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Header Blur
    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll Progress
    if (progressBar) {
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalDocHeight > 0 ? (scrollY / totalDocHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   3. LUXURY CUSTOM MAGNETIC CURSOR (Core Atelier Touch)
   -------------------------------------------------------------------------- */
function initCustomMagneticCursor() {
  // Only activate on devices with fine pointer (mouse/trackpad)
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const dot = document.getElementById('core-cursor-dot');
  const ring = document.getElementById('core-cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  // Smooth lag for outer ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Expand ring on interactive elements
  const interactiveTargets = document.querySelectorAll('a, button, input, select, textarea, [data-tilt-card], .image-curtain-container, .reflections-btn, .phase-btn');
  interactiveTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-expanded'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-expanded'));
  });
}

/* --------------------------------------------------------------------------
   4. HERO MOTION SEQUENCE & DYNAMIC CONTROLS
   -------------------------------------------------------------------------- */
function initHeroMotion() {
  const frame01 = document.querySelector('.hero-frame-01');
  const frame02 = document.querySelector('.hero-frame-02');
  const phaseBtns = document.querySelectorAll('.hero-motion-phases .phase-btn');
  const toggleBtn = document.getElementById('motion-toggle-btn');
  const iconPause = toggleBtn?.querySelector('.icon-pause');
  const iconPlay = toggleBtn?.querySelector('.icon-play');
  const specular = document.getElementById('hero-specular');
  const stage = document.getElementById('hero-motion-stage');

  let currentPhase = 1;
  let isPlaying = true;
  let timer = null;

  const setPhase = (phase) => {
    currentPhase = phase;
    if (phase === 1) {
      frame01?.classList.add('is-active');
      frame02?.classList.remove('is-active');
    } else {
      frame01?.classList.remove('is-active');
      frame02?.classList.add('is-active');
    }
    phaseBtns.forEach(btn => {
      btn.classList.toggle('is-active', Number(btn.dataset.phase) === phase);
    });
  };

  const startLoop = () => {
    stopLoop();
    timer = setInterval(() => {
      setPhase(currentPhase === 1 ? 2 : 1);
    }, 4500);
  };

  const stopLoop = () => {
    if (timer) clearInterval(timer);
  };

  phaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = Number(btn.dataset.phase);
      setPhase(p);
      if (isPlaying) startLoop();
    });
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        startLoop();
        if (iconPause) iconPause.style.display = 'block';
        if (iconPlay) iconPlay.style.display = 'none';
      } else {
        stopLoop();
        if (iconPause) iconPause.style.display = 'none';
        if (iconPlay) iconPlay.style.display = 'block';
      }
    });
  }

  // Dynamic light reflection follow
  if (stage && specular) {
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      specular.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.22) 0%, transparent 60%)`;
      specular.style.opacity = '1';
    });
    stage.addEventListener('mouseleave', () => {
      specular.style.opacity = '0';
    });
  }

  // Hero entrance animation with GSAP if available
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.hero-bg-img, .hero-frame-img', 
      { scale: 1.08 }, 
      { scale: 1.0, duration: 2.5, ease: 'power2.out' }
    );
  }

  startLoop();
}

/* --------------------------------------------------------------------------
   4.5. HERO TITLE FLUID MOTION DESIGN (Fluid Smoke / Water Wave Reveal)
   User Specification: Character split, initial blur(12px), scale(0.95),
   translateY(30px), animation 2.8s cubic-bezier(0.16, 1, 0.3, 1), center-out wave.
   -------------------------------------------------------------------------- */
function initHeroTitleFluidMotion() {
  const headline = document.querySelector('.hero-headline');
  if (!headline) return;

  function splitNode(node, container, charList) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const parts = text.split(/(\s+)/);
      parts.forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          const spaceSpan = document.createElement('span');
          spaceSpan.className = 'char char-space';
          spaceSpan.innerHTML = '&nbsp;';
          container.appendChild(spaceSpan);
          charList.push(spaceSpan);
        } else {
          const wordWrap = document.createElement('span');
          wordWrap.className = 'word-wrap';
          part.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = char;
            wordWrap.appendChild(charSpan);
            charList.push(charSpan);
          });
          container.appendChild(wordWrap);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName.toLowerCase() === 'br') {
        container.appendChild(document.createElement('br'));
        return;
      }
      const clone = node.cloneNode(false);
      container.appendChild(clone);
      Array.from(node.childNodes).forEach(child => {
        splitNode(child, clone, charList);
      });
    }
  }

  const tempWrapper = document.createElement('div');
  const allChars = [];
  Array.from(headline.childNodes).forEach(child => {
    splitNode(child, tempWrapper, allChars);
  });

  headline.innerHTML = tempWrapper.innerHTML;

  const lines = headline.querySelectorAll('.line-wrap');
  if (lines.length > 0) {
    lines.forEach((line, lineIndex) => {
      const lineChars = line.querySelectorAll('.char');
      const totalLineChars = lineChars.length;
      const centerIndex = Math.floor((totalLineChars - 1) / 2);
      const lineBaseDelay = 180 + (lineIndex * 190);
      const delayStep = 55;

      lineChars.forEach((el, index) => {
        const distanceFromCenter = Math.abs(index - centerIndex);
        const delay = lineBaseDelay + (distanceFromCenter * delayStep);
        el.style.animationDelay = `${delay}ms`;
      });
    });
  } else {
    const totalChars = allChars.length;
    const centerIndex = Math.floor((totalChars - 1) / 2);
    const delayStep = 45;
    const baseDelay = 180;

    headline.querySelectorAll('.char').forEach((el, index) => {
      const distanceFromCenter = Math.abs(index - centerIndex);
      const delay = baseDelay + (distanceFromCenter * delayStep);
      el.style.animationDelay = `${delay}ms`;
    });
  }

  // Synchronize Hero action buttons with the exact same fluid entrance motion design
  const heroButtons = document.querySelectorAll('.hero-actions .btn');
  if (heroButtons.length > 0) {
    const baseBtnDelay = 580; // Starts harmoniously as the headline text wave progresses
    const btnDelayStep = 180;
    heroButtons.forEach((btn, idx) => {
      const delay = baseBtnDelay + (idx * btnDelayStep);
      btn.style.animationDelay = `${delay}ms`;
    });
  }

  // Force reflow and trigger animation
  requestAnimationFrame(() => {
    const chars = headline.querySelectorAll('.char');
    chars.forEach(el => {
      void el.offsetWidth;
      el.classList.add('animate');
    });

    if (heroButtons.length > 0) {
      heroButtons.forEach(btn => {
        void btn.offsetWidth;
        btn.classList.add('animate');
      });
    }
  });
}

/* --------------------------------------------------------------------------
   5. HERO ROLLING FEATURE TICKER (Core Atelier Signature Vertical Carousel)
   -------------------------------------------------------------------------- */
function initHeroFeatureTicker() {
  const slides = document.querySelectorAll('.hero-feature-ticker .ticker-slide');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  const total = slides.length;

  // Prepare initial states
  slides.forEach((slide, i) => {
    if (i === 0) {
      slide.style.top = '0%';
      slide.style.opacity = '1';
    } else {
      slide.style.top = '100%';
      slide.style.opacity = '0';
    }
  });

  function nextSlide() {
    const current = slides[currentIndex];
    const nextIndex = (currentIndex + 1) % total;
    const next = slides[nextIndex];

    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline();
      tl.to(current, {
        top: '-100%',
        opacity: 0,
        duration: 0.65,
        ease: 'power3.in'
      });
      tl.fromTo(next, 
        { top: '100%', opacity: 0 },
        { top: '0%', opacity: 1, duration: 0.65, ease: 'power2.out' },
        '-=0.2'
      );
    } else {
      current.style.top = '-100%';
      current.style.opacity = '0';
      next.style.top = '0%';
      next.style.opacity = '1';
    }

    currentIndex = nextIndex;
  }

  setInterval(nextSlide, 3400);
}

/* --------------------------------------------------------------------------
   6. CORE ATELIER COVER SHUTTER CURTAIN REVEALS (.cover wipe)
   -------------------------------------------------------------------------- */
function initShutterCurtainReveals() {
  const containers = document.querySelectorAll('.image-curtain-container');
  if (!containers.length) return;

  const revealContainer = (container) => {
    const cover = container.querySelector('.cover');
    const img = container.querySelector('img');
    if (!cover) return;

    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline();
      tl.to(cover, {
        yPercent: 100,
        duration: 0.95,
        ease: 'power3.inOut',
        onComplete: () => {
          cover.style.display = 'none';
        }
      });

      if (img) {
        tl.fromTo(img,
          { scale: 1.12 },
          { 
            scale: 1.0, 
            duration: 1.2, 
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(img, { clearProps: 'transform' });
            }
          },
          '-=0.75'
        );
      }
    } else {
      cover.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
      cover.style.transform = 'translateY(100%)';
      setTimeout(() => { cover.style.display = 'none'; }, 950);
    }
  };

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    containers.forEach((container) => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => revealContainer(container)
      });
    });
  } else {
    // IntersectionObserver fallback
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealContainer(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    containers.forEach(c => observer.observe(c));
  }
}

/* --------------------------------------------------------------------------
   7. CORE ATELIER SCALED HEADING SCRUB (.scaled-heading)
   -------------------------------------------------------------------------- */
function initScaledHeadings() {
  const scaledHeadings = document.querySelectorAll('.scaled-heading');
  if (!scaledHeadings.length) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      scaledHeadings.forEach((heading) => {
        gsap.fromTo(heading, 
          { scale: 1.25 },
          {
            scale: 1,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              end: 'bottom 20%',
              scrub: 1.2
            }
          }
        );
      });
    });
  }
}

/* --------------------------------------------------------------------------
   8. KINETIC TYPOGRAPHY SCROLL-LINKED REVEAL
   -------------------------------------------------------------------------- */
function initKineticTypographyScroll() {
  const words = document.querySelectorAll('[data-kinetic-scroll] .k-word');
  const section = document.getElementById('impacto');
  if (!words.length || !section) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    words.forEach((word, idx) => {
      ScrollTrigger.create({
        trigger: section,
        start: () => `top+=${80 + (idx * 30)}px 75%`,
        end: 'bottom 25%',
        onEnter: () => word.classList.add('is-active'),
        onLeaveBack: () => word.classList.remove('is-active')
      });
    });
  } else {
    // Intersection Observer Fallback
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          words.forEach((w, i) => {
            setTimeout(() => w.classList.add('is-active'), i * 80);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(section);
  }
}

/* --------------------------------------------------------------------------
   9. CORE ATELIER EDITORIAL REFLECTIONS CAROUSEL
   -------------------------------------------------------------------------- */
function initReflectionsCarousel() {
  const container = document.querySelector('.reflections-carousel-container');
  const slides = document.querySelectorAll('.reflections-slide');
  const prevBtn = document.getElementById('reflections-prev');
  const nextBtn = document.getElementById('reflections-next');
  const currentCounter = document.getElementById('reflections-current');
  const dots = document.querySelectorAll('.reflections-dot');

  if (!slides.length || !container) return;

  let current = 0;
  const total = slides.length;
  let autoplayTimer = null;

  const goToSlide = (index) => {
    if (index === current) return;
    
    // Hide current
    slides[current].classList.remove('is-active');
    if (dots[current]) dots[current].classList.remove('is-active');

    // Show target
    current = (index + total) % total;
    slides[current].classList.add('is-active');
    if (dots[current]) dots[current].classList.add('is-active');

    // Update Counter with leading zero (Core Atelier style: 01, 02, 03)
    if (currentCounter) {
      currentCounter.textContent = String(current + 1).padStart(2, '0');
    }
  };

  const next = () => goToSlide(current + 1);
  const prev = () => goToSlide(current - 1);

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      resetAutoplay();
    });
  });

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(next, 6500);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  };

  const resetAutoplay = () => {
    startAutoplay();
  };

  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

/* --------------------------------------------------------------------------
   10. MAGNETIC BUTTONS (Interactive Cursor Attraction)
   -------------------------------------------------------------------------- */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const magneticBtns = document.querySelectorAll('.magnetic-btn');

  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate3d(${relX * 0.28}px, ${relY * 0.28}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

/* --------------------------------------------------------------------------
   11. ANIMATED GOOGLE RATING COUNTERS
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.counter-val');
  if (!counterElements.length) return;

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = ease * target;

      if (decimals > 0) {
        el.textContent = val.toFixed(decimals).replace('.', ',');
      } else {
        el.textContent = Math.floor(val).toString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counterElements.forEach(el => animateCounter(el));
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const trigger = document.querySelector('[data-counter-trigger]');
  if (trigger) {
    observer.observe(trigger);
  }
}

/* --------------------------------------------------------------------------
   12. 3D TILT CARDS
   -------------------------------------------------------------------------- */
function init3DTiltCards() {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('[data-tilt-card]');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* --------------------------------------------------------------------------
   13. MOBILE MENU DRAWER
   -------------------------------------------------------------------------- */
function initMobileMenu(lenis) {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  const openMenu = () => {
    drawer.classList.add('is-open');
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  };

  const closeMenu = () => {
    drawer.classList.remove('is-open');
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  };

  toggleBtn.addEventListener('click', () => {
    drawer.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeMenu();
  });
}

/* --------------------------------------------------------------------------
   14. BOOKING MODAL & WHATSAPP REDIRECTION
   -------------------------------------------------------------------------- */
function initModalBooking(lenis) {
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const openButtons = document.querySelectorAll('[data-open-modal="booking"]');
  const closeBtn = document.querySelector('.modal-close-btn');
  const form = document.querySelector('.modal-form');

  if (!modalBackdrop) return;

  let lastTrigger = null;

  const openModal = (e) => {
    if (e) e.preventDefault();
    lastTrigger = e ? e.currentTarget : null;
    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    const firstInput = modalBackdrop.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  };

  const closeModal = () => {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    // Devolve o foco ao botão que abriu a janela
    if (lastTrigger) lastTrigger.focus();
  };

  // Mantém o Tab dentro da janela enquanto ela está aberta
  modalBackdrop.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = modalBackdrop.querySelectorAll('button, input, select, a[href]');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modal-name')?.value.trim() || '';
      const period = document.getElementById('modal-period')?.value || 'qualquer horário';
      const objective = document.getElementById('modal-objective')?.value || 'força e mobilidade';

      let text = "Olá! Conheci o Movimento Pilates Studio pelo site e gostaria de agendar uma aula experimental.";
      if (name) {
        text = `Olá! Meu nome é ${name}. Conheci o Movimento Pilates Studio pelo site e gostaria de agendar uma aula experimental no período da ${period} (foco: ${objective}).`;
      }

      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/5511973585802?text=${encodedText}`;

      closeModal();
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

/* --------------------------------------------------------------------------
   14. FOOTER MONUMENT MOTION TITLE — "MOVIMENTO" (TEXT CLIPPING EFFECT)
   Oculta a parte inferior da tipografia com máscara (0.68em) e dispara
   uma onda fluida com blur e escala a partir do centro da palavra.
   -------------------------------------------------------------------------- */
function initFooterMotionTitle() {
  const maskContainer = document.getElementById('footer-text-mask');
  const replayBtn = document.getElementById('footer-replay-btn');
  const footer = document.querySelector('.site-footer');
  const titleContainer = document.getElementById('footer-motion-title');
  if (!maskContainer || !footer) return;

  const textToAnimate = "MOVIMENTO";

  function prepareText() {
    maskContainer.innerHTML = '';
    const chars = textToAnimate.split('');
    chars.forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'char';
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
      }
      maskContainer.appendChild(span);
    });
    return maskContainer.querySelectorAll('.char');
  }

  function calculateDelays(charElements) {
    const totalChars = charElements.length;
    // Ponto central da palavra (para o efeito emanar do centro)
    const centerIndex = Math.floor((totalChars - 1) / 2);
    const delayStep = 75; // Onda fluida unificada entre caracteres
    const baseDelay = 180; // Pausa elegante inicial

    charElements.forEach((el, index) => {
      const distanceFromCenter = Math.abs(index - centerIndex);
      const delay = baseDelay + (distanceFromCenter * delayStep);
      el.style.animationDelay = `${delay}ms`;
    });
  }

  function triggerAnimation(charElements) {
    charElements.forEach(el => {
      el.classList.remove('animate');
      void el.offsetWidth; // Força reflow para permitir replay
    });

    charElements.forEach(el => {
      el.classList.add('animate');
    });
  }

  function runAnimation() {
    const charElements = prepareText();
    calculateDelays(charElements);

    setTimeout(() => {
      triggerAnimation(charElements);
    }, 40);
  }

  // Dispara a animação assim que o rodapé entra no campo de visão
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runAnimation();
      }
    });
  }, {
    threshold: 0.2
  });

  observer.observe(footer);

  // Ações de repetição
  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      runAnimation();
    });
  }

  if (titleContainer) {
    titleContainer.addEventListener('click', () => {
      runAnimation();
    });
  }
}

