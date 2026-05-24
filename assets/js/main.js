import { initLayout } from './layout.js';
import { initApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        initLayout();
    } catch {
        // Tema/menü hatası hesaplayıcıyı durdurmasın (Brave localStorage engeli vb.)
    }
    initApp();
});
