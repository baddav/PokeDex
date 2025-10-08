import { router } from './router.js';
import { applyTheme, state } from './state.js';
import { showModal } from './ui/modal.js';

function ensureOnboarding() {
    // Starter-Auswahl anzeigen, falls kein Starter gesetzt ist
    if (state.profile.starter) return;

    const wrap = document.createElement('div');
    wrap.innerHTML = `
    <h2 style="margin-top:0">Wähle deinen Starter</h2>
    <p>Diese Wahl bestimmt das anfängliche Theme. Du kannst es später im Profil ändern.</p>
    <div class="grid" style="grid-template-columns: repeat(3,1fr); gap:12px">
      <button class="btn" data-starter="bisasam" aria-label="Bisasam wählen">
        <img alt="" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" width="64" height="64" style="margin-right:8px"/> 
        Bisasam
      </button>
      <button class="btn" data-starter="glumanda" aria-label="Glumanda wählen">
        <img alt="" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" width="64" height="64" style="margin-right:8px"/> 
        Glumanda
      </button>
      <button class="btn" data-starter="shiggy" aria-label="Shiggy wählen">
        <img alt="" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" width="64" height="64" style="margin-right:8px"/> 
        Shiggy
      </button>
    </div>
  `;

    const { close } = showModal(wrap);

    wrap.querySelectorAll('[data-starter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const s = btn.getAttribute('data-starter');
            // setStarter wird indirekt über ein Event aufgerufen (vermeidet Zyklus)
            const ev = new CustomEvent('starter-selected', { detail: s });
            window.dispatchEvent(ev);
            close();
        });
    });
}

function wireStarterSelection() {
    // Starterauswahl-Ereignis verbinden
    window.addEventListener('starter-selected', (e) => {
        try {
            const starter = e.detail;
            // dynamisch importieren, um zirkuläre Abhängigkeit zu vermeiden
            import('./state.js').then(mod => {
                mod.setStarter(starter);
                applyTheme();
                if (!location.hash) location.hash = '#/search';
                router();
            });
        } catch {
            /* ignore */
        }
    });
}

function init() {
    applyTheme();
    wireStarterSelection();
    ensureOnboarding();
    if (!location.hash) location.hash = '#/search';
    router();
}

window.addEventListener('DOMContentLoaded', init);
