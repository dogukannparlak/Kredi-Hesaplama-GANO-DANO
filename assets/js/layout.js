export function initLayout() {
    initThemeToggle();
    initMobileMenu();
}

function initThemeToggle() {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    if (themeToggles.length === 0) return;

    const saved = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = saved || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    themeToggles.forEach((toggle) => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    });
}

function setMobileMenuOpen(toggle, menu, isOpen) {
    menu.classList.toggle('active', isOpen);
    toggle.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setMobileMenuOpen(toggle, menu, !menu.classList.contains('active'));
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMobileMenuOpen(toggle, menu, false));
    });

    menu.querySelectorAll('.theme-toggle').forEach((btn) => {
        btn.addEventListener('click', (e) => e.stopPropagation());
    });

    menu.querySelectorAll('.mobile-menu-social a').forEach((link) => {
        link.addEventListener('click', (e) => e.stopPropagation());
    });

    document.addEventListener('click', (e) => {
        if (nav?.contains(e.target)) return;
        if (menu.classList.contains('active')) {
            setMobileMenuOpen(toggle, menu, false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            setMobileMenuOpen(toggle, menu, false);
        }
    });
}
