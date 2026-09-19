/* ============================================
   أسر صناع الحياة — تقرير إنجازات الميديا
   Interactions & Animations (refactored: single source of truth + single observer)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    renderChartCards();
    initNavigation();
    initRevealObserver();
    initScrollHandler();
    initTabs();
    initBackToTop();
    initCharts();
});

/* ============================================
   Single source of truth: all 12 charts
   (titles, totals, growth badges and data preserved exactly)
   ============================================ */
var CHARTS_DATA = [
    // Facebook
    { id: 'fb-views', platform: 'fb', title: 'المشاهدات', total: '1,129,181', growth: '↑ 417.6%', growthClass: 'positive', color: 'blue',
      data: [30000, 110000, 130000, 100000, 120000, 110000, 100000, 130000, 100000, 90000, 70000] },
    { id: 'fb-pagevisits', platform: 'fb', title: 'زيارات الصفحة', total: '38.3K', growth: '↑ 568.3%', growthClass: 'positive', color: 'blue',
      data: [1500, 4500, 5000, 4000, 5500, 4500, 4000, 4300, 3000, 3000, 3000] },
    { id: 'fb-viewers', platform: 'fb', title: 'المشاهدون', total: '159,530', growth: null, growthClass: '', color: 'blue',
      data: [8000, 18000, 20000, 16000, 22000, 18000, 17000, 16000, 12000, 8000, 4500] },
    { id: 'fb-interactions', platform: 'fb', title: 'التفاعلات', total: '30K', growth: '↑ 363.1%', growthClass: 'positive', color: 'blue',
      data: [800, 3500, 4200, 3000, 4500, 3500, 3200, 3500, 2500, 2500, 2300] },
    { id: 'fb-clicks', platform: 'fb', title: 'النقرات على الروابط', total: '1.8K', growth: '↑ 110.3%', growthClass: 'positive', color: 'blue',
      data: [50, 200, 250, 180, 280, 200, 180, 170, 120, 100, 70] },
    { id: 'fb-follows', platform: 'fb', title: 'المتابعون الجدد', total: '3.2K', growth: '↑ 417.6%', growthClass: 'positive', color: 'blue',
      data: [100, 400, 500, 350, 500, 350, 300, 300, 200, 100, 100] },
    // Instagram
    { id: 'ig-views', platform: 'ig', title: 'المشاهدات', total: '26.3K', growth: '↑ 1.8%', growthClass: 'positive', color: 'orange',
      data: [500, 1200, 1000, 1500, 1500, 1000, 1500, 6000, 4500, 4000, 3600] },
    { id: 'ig-reach', platform: 'ig', title: 'الوصول', total: '709', growth: '↑ 439.8%', growthClass: 'positive', color: 'orange',
      data: [5, 15, 20, 15, 25, 20, 30, 50, 200, 180, 149] },
    { id: 'ig-interactions', platform: 'ig', title: 'التفاعلات', total: '108', growth: '↑ 2.5%', growthClass: 'positive', color: 'orange',
      data: [2, 5, 8, 6, 10, 8, 10, 15, 25, 12, 7] },
    { id: 'ig-profile', platform: 'ig', title: 'زيارات الملف الشخصي', total: '92', growth: '↑ 187.5%', growthClass: 'positive', color: 'orange',
      data: [1, 3, 5, 4, 8, 6, 8, 15, 20, 14, 8] },
    { id: 'ig-follows', platform: 'ig', title: 'المتابعون الجدد', total: '50', growth: '↑ 1.9%', growthClass: 'positive', color: 'orange',
      data: [1, 2, 3, 2, 4, 3, 4, 6, 8, 12, 5] },
    { id: 'ig-clicks', platform: 'ig', title: 'النقرات على الروابط', total: '0', growth: '—', growthClass: 'neutral', color: 'orange',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
];

/* Render chart cards from data (removes 12 duplicated HTML blocks) */
function renderChartCards() {
    var containers = { fb: document.getElementById('fb-charts'), ig: document.getElementById('ig-charts') };
    if (!containers.fb || !containers.ig) return;

    CHARTS_DATA.forEach(function (c) {
        var card = document.createElement('div');
        card.className = 'chart-card';
        card.setAttribute('data-animate', '');

        var growthHtml = c.growth
            ? '<span class="chart-growth ' + c.growthClass + '">' + c.growth + '</span>'
            : '';

        card.innerHTML =
            '<div class="chart-card-header">' +
                '<div class="chart-card-info">' +
                    '<span class="chart-card-title">' + c.title + '</span>' +
                    '<span class="chart-card-total">' + c.total + '</span>' +
                '</div>' + growthHtml +
            '</div>' +
            '<div class="chart-container"><canvas id="' + c.id + '"></canvas></div>';

        containers[c.platform].appendChild(card);
    });
}

/* ============================================
   Sticky Navigation (toggle only; scroll handled centrally)
   ============================================ */
function initNavigation() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        const isOpen = links.classList.contains('open');
        toggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    });

    links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            links.classList.remove('open');
        });
    });
}

/* ============================================
   Single IntersectionObserver: reveal + counters + bars
   (replaces 3 duplicated visibility-check loops)
   ============================================ */
function initRevealObserver() {
    function activate(el) {
        if (el.hasAttribute('data-animate') && !el.classList.contains('visible')) {
            el.classList.add('visible');
        }
        el.querySelectorAll('[data-count]:not(.counted)').forEach(function (counter) {
            counter.classList.add('counted');
            animateCounter(counter);
        });
        if (el.hasAttribute('data-count') && !el.classList.contains('counted')) {
            el.classList.add('counted');
            animateCounter(el);
        }
        el.querySelectorAll('.bar-fill:not(.filled)').forEach(fillBar);
        if (el.classList && el.classList.contains('bar-fill') && !el.classList.contains('filled')) {
            fillBar(el);
        }
    }

    function fillBar(bar) {
        bar.classList.add('filled');
        bar.style.width = bar.getAttribute('data-width') + '%';
    }

    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('[data-animate],[data-count],.bar-fill').forEach(activate);
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                activate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(function (el) { observer.observe(el); });
    document.querySelectorAll('[data-count]:not([data-animate])').forEach(function (el) {
        if (!el.closest('[data-animate]')) observer.observe(el);
    });
    document.querySelectorAll('.bar-fill').forEach(function (el) {
        if (!el.closest('[data-animate]')) observer.observe(el);
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
   Single rAF-throttled scroll handler: nav state + active link + back-to-top
   (replaces 5 separate scroll listeners)
   ============================================ */
function initScrollHandler() {
    const nav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const backToTop = document.getElementById('backToTop');
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;

        if (nav) nav.classList.toggle('scrolled', y > 50);
        if (backToTop) backToTop.classList.toggle('show', y > 600);

        let current = 'hero';
        const scrollPosition = y + 200;
        sections.forEach(function (section) {
            const top = section.offsetTop;
            if (scrollPosition >= top && scrollPosition < top + section.offsetHeight) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-section') === current);
        });

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();
}

/* ============================================
   Platform Tabs (Facebook / Instagram)
   ============================================ */
function initTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('[data-platform-panel]');
    if (!buttons.length || !panels.length) return;

    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            buttons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            const platform = btn.getAttribute('data-platform');
            panels.forEach(function (panel) {
                panel.hidden = panel.getAttribute('data-platform-panel') !== platform;
            });
            // Charts inside a hidden panel init with 0 width — force resize after reveal
            requestAnimationFrame(function () {
                window.dispatchEvent(new Event('resize'));
            });
        });
    });
}

/* ============================================
   Back to Top + smooth anchors
   ============================================ */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (btn) {
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ============================================
   Interactive Charts (Chart.js) — driven by CHARTS_DATA
   ============================================ */
function initCharts() {
    const months = ['نوف', 'ديس', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر'];

    const blue = '#014976';
    const blueLight = 'rgba(1, 73, 118, 0.12)';
    const orange = '#FBAE42';
    const orangeLight = 'rgba(251, 174, 66, 0.08)';

    function createChart(id, data, color, fillColor) {
        var ctx = document.getElementById(id);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    data: data,
                    borderColor: color || blue,
                    backgroundColor: fillColor || blueLight,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: color || blue,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(1, 73, 118, 0.9)',
                        titleFont: { family: "'Noto Kufi Arabic', sans-serif", size: 12 },
                        bodyFont: { family: "'Noto Kufi Arabic', sans-serif", size: 13, weight: '700' },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(ctx) {
                                var val = ctx.parsed.y;
                                if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                                if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
                                return val.toLocaleString('en-US');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: "'Noto Kufi Arabic', sans-serif", size: 10 },
                            color: '#999',
                            maxRotation: 0
                        }
                    },
                    y: {
                        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
                        ticks: {
                            font: { family: "'Noto Kufi Arabic', sans-serif", size: 10 },
                            color: '#999',
                            maxTicksLimit: 5,
                            callback: function(val) {
                                if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                                if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
                                return val;
                            }
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    var byId = {};
    CHARTS_DATA.forEach(function (c) { byId[c.id] = c; });

    Object.keys(byId).forEach(function (id) {
        var c = byId[id];
        var color = c.color === 'orange' ? orange : blue;
        var fill = c.color === 'orange' ? orangeLight : blueLight;
        if (id === 'ig-clicks') fill = 'rgba(251, 174, 66, 0.08)';
        createChart(id, c.data, color, fill);
    });
}
