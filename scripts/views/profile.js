import { createEl } from '../ui/utils.js';
import { state, updateProfile, setStarter } from '../state.js';

export function renderProfile({ mount }) {
    const wrap = createEl('section', { className: 'section container' });
    wrap.innerHTML = `
    <div class="section-head">
      <div>
        <h1>PokeProfile</h1>
        <p>Deine Spieler-Infos & Theme.</p>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1.2fr .8fr">
      <div class="panel">
        <h2>Spieler</h2>
        <div class="kv">
          <div class="kv-row">
            <div class="kv-key">Name</div>
            <div>
              <input id="name" class="input" placeholder="Dein Name" value="${state.profile.username || ''}"/>
            </div>
          </div>
          <div class="kv-row">
            <div class="kv-key">Gesammelt</div>
            <div><strong>${state.favorites.size}</strong> Favoriten</div>
          </div>
          <div class="kv-row">
            <div class="kv-key">Zuletzt angesehen</div>
            <div>${state.cache.lastViewed ? ('#' + state.cache.lastViewed) : '–'}</div>
          </div>
          <div class="kv-row">
            <div class="kv-key">Starter</div>
            <div>${state.profile.starter || '—'}</div>
          </div>
        </div>
        <div class="row" style="margin-top:12px">
          <button id="save" class="btn primary">Speichern</button>
        </div>
      </div>

      <div class="panel">
        <h2>Theme / Starter wählen</h2>
        <div class="grid" style="grid-template-columns: repeat(3,1fr)">
          <button class="btn" data-starter="bisasam">Bisasam</button>
          <button class="btn" data-starter="glumanda">Glumanda</button>
          <button class="btn" data-starter="shiggy">Shiggy</button>
        </div>
      </div>
    </div>
  `;
    mount.appendChild(wrap);

    // Name speichern
    wrap.querySelector('#save').addEventListener('click', () => {
        const name = wrap.querySelector('#name').value.trim();
        updateProfile({ username: name });
    });

    // Starter/Theme ändern
    wrap.querySelectorAll('[data-starter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const s = btn.getAttribute('data-starter');
            setStarter(s);
            document.documentElement.classList.remove('theme-bisasam', 'theme-glumanda', 'theme-shiggy');
            document.documentElement.classList.add('theme-' + s);
        });
    });

    return () => {};
}
