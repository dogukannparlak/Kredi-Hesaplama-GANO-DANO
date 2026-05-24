import { initLayout } from './layout.js';
import { initGecmeApp } from './gecme-app.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        initLayout();
    } catch {
        // Tema/menü hatası hesaplayıcıyı durdurmasın (Brave localStorage engeli vb.)
    }
    initGecmeApp();
});
