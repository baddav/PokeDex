let root;

function ensureRoot() {
    if (!root) root = document.getElementById('toast-root');
}

export function toast(msg) {
    ensureRoot();
    const el = document.createElement('div');
    el.className = 'toast';
    el.role = 'status';
    el.textContent = msg;
    root.appendChild(el);

    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        setTimeout(() => el.remove(), 300);
    }, 2200);
}
