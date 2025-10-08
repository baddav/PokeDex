const LS_KEY_PROFILE = 'pokedex.profile';
const LS_KEY_FAVS = 'pokedex.favorites';

const defaultProfile = {
    starter: null, // 'bisasam' | 'glumanda' | 'shiggy'
    theme: 'bisasam',
    username: ''
};

function loadProfile() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY_PROFILE)) || { ...defaultProfile };
    } catch {
        return { ...defaultProfile };
    }
}

function saveProfile(p) {
    localStorage.setItem(LS_KEY_PROFILE, JSON.stringify(p));
}

function loadFavorites() {
    try {
        const arr = JSON.parse(localStorage.getItem(LS_KEY_FAVS)) || [];
        return new Set(arr);
    } catch {
        return new Set();
    }
}

function saveFavorites(set) {
    localStorage.setItem(LS_KEY_FAVS, JSON.stringify(Array.from(set)));
}

const events = new EventTarget();

export const state = {
    profile: loadProfile(),
    favorites: loadFavorites(),
    cache: {
        lastViewed: null
    },
    events
};

export function setStarter(starter) {
    state.profile.starter = starter;
    state.profile.theme = starter;
    saveProfile(state.profile);
    events.dispatchEvent(new CustomEvent('profile-changed', { detail: state.profile }));
}

export function updateProfile(patch) {
    Object.assign(state.profile, patch);
    saveProfile(state.profile);
    events.dispatchEvent(new CustomEvent('profile-changed', { detail: state.profile }));
}

export function applyTheme(root = document.documentElement) {
    const theme = state.profile.theme || 'bisasam';
    root.classList.remove('theme-bisasam', 'theme-glumanda', 'theme-shiggy');
    root.classList.add('theme-' + theme);
}

export function addFavorite(id) {
    const n = Number(id);
    state.favorites.add(n);
    saveFavorites(state.favorites);
    events.dispatchEvent(new CustomEvent('favorites-changed', { detail: Array.from(state.favorites) }));
}

export function removeFavorite(id) {
    const n = Number(id);
    state.favorites.delete(n);
    saveFavorites(state.favorites);
    events.dispatchEvent(new CustomEvent('favorites-changed', { detail: Array.from(state.favorites) }));
}

export function isFavorite(id) {
    return state.favorites.has(Number(id));
}

export function toggleFavorite(id) {
    if (isFavorite(id)) {
        removeFavorite(id);
        return false;
    }
    addFavorite(id);
    return true;
}
