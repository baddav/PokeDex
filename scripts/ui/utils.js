export function debounce(fn, delay = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(null, args), delay);
    };
}

export function formatId(n) {
    const id = typeof n === 'number' ? n : parseInt(n, 10);
    if (Number.isNaN(id)) return '#???';
    return '#' + String(id).padStart(3, '0');
}

export function capitalize(s) {
    return (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
}

export function getLangText(entries, lang = 'de') {
    if (!Array.isArray(entries)) return '';
    const match =
        entries.find(e => e.language?.name === lang) ||
        entries.find(e => e.language?.name === 'en');
    return (match?.flavor_text || match?.genus || match?.name || '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function createEl(tag, opts = {}) {
    const el = document.createElement(tag);
    if (opts.className) el.className = opts.className;
    if (opts.attrs) {
        for (const [k, v] of Object.entries(opts.attrs)) el.setAttribute(k, v);
    }
    if (opts.text) el.textContent = opts.text;
    if (opts.html) el.innerHTML = opts.html;
    return el;
}

export function lazyImage(img) {
    if ('loading' in HTMLImageElement.prototype) {
        img.loading = 'lazy';
    }
    const obs = new IntersectionObserver(
        (entries, ob) => {
            for (const ent of entries) {
                if (ent.isIntersecting) {
                    const target = ent.target;
                    const src = target.getAttribute('data-src');
                    if (src) {
                        target.src = src;
                        target.removeAttribute('data-src');
                    }
                    ob.unobserve(target);
                }
            }
        },
        { rootMargin: '100px' }
    );
    obs.observe(img);
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
