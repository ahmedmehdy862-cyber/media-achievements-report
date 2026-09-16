/* ============================================
   أسر صناع الحياة — تقرير إنجازات الميديا
   Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollAnimations();
    initCounters();
    initBarFills();
    initActiveNav();
});

/* ============================================
   Sticky Navigation
   ============================================ */
function initNavigation() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });

    toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        const isOpen = links.classList.contains('open');
        toggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    });

    // Close nav when a link is clicked
    links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            links.classList.remove('open');
        });
    });
}

/* ============================================
   Scroll Reveal Animations
   ============================================ */
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('[data-animate]');
    const windowHeight = window.innerHeight;

    function checkVisibility() {
        animateElements.forEach(function (el) {
            const rect = el.getBoundingClientRect();
            const revealPoint = 150;

            if (rect.top < windowHeight - revealPoint && rect.bottom > 0) {
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible');
                    // Trigger counter animations if this element contains counters
                    initCountersInElement(el);
                    // Trigger bar fills if this element contains bars
                    initBarFillsInElement(el);
                }
            }
        });
    }

    // Check initial state
    checkVisibility();

    // Listen for scroll
    window.addEventListener('scroll', function () {
        checkVisibility();
    }, { passive: true });

    // Handle window resize
    window.addEventListener('resize', function () {
        requestAnimationFrame(checkVisibility);
    });
}

/* ============================================
   Counter Animations
   ============================================ */
function initCounters() {
    const counterElements = document.querySelectorAll('[data-count]');

    function checkCounters() {
        counterElements.forEach(function (el) {
            if (el.classList.contains('counted')) return;

            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight - 50 && rect.bottom > 0) {
                el.classList.add('counted');
                animateCounter(el);
            }
        });
    }

    // Check on load and scroll
    checkCounters();
    window.addEventListener('scroll', checkCounters, { passive: true });
}

function initCountersInElement(el) {
    const counters = el.querySelectorAll('[data-count]:not(.counted)');
    counters.forEach(function (counter) {
        counter.classList.add('counted');
        animateCounter(counter);
    });
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    function formatNumber(num) {
        if (target >= 1000000) {
            return num.toLocaleString('en-US').replace(/\.\d+/, '');
        }
        return Math.round(num).toLocaleString('en-US');
    }

    const timer = setInterval(function () {
        step++;
        current += increment;

        if (step >= steps) {
            current = target;
            clearInterval(timer);
        }

        el.textContent = prefix + formatNumber(current) + suffix;
    }, duration / steps);
}

/* ============================================
   Bar Fill Animations
   ============================================ */
function initBarFills() {
    const barElements = document.querySelectorAll('.bar-fill');

    function checkBars() {
        barElements.forEach(function (bar) {
            if (bar.classList.contains('filled')) return;

            const rect = bar.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight - 50 && rect.bottom > 0) {
                bar.classList.add('filled');
                const width = bar.getAttribute('data-width') + '%';
                bar.style.width = width;
            }
        });
    }

    checkBars();
    window.addEventListener('scroll', checkBars, { passive: true });
}

function initBarFillsInElement(el) {
    const bars = el.querySelectorAll('.bar-fill:not(.filled)');
    bars.forEach(function (bar) {
        bar.classList.add('filled');
        const width = bar.getAttribute('data-width') + '%';
        bar.style.width = width;
    });
}

/* ============================================
   Active Navigation Link on Scroll
   ============================================ */
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        let current = 'hero';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
}