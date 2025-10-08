let root;

function getRoot() {
    if (!root) root = document.getElementById('modal-root');
    return root;
}

export function showModal(contentEl, { onClose } = {}) {
    const r = getRoot();
    r.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.appendChild(contentEl);

    r.appendChild(overlay);
    r.appendChild(modal);
    r.classList.add('open');

    function close() {
        r.classList.remove('open');
        setTimeout(() => {
            r.innerHTML = '';
        }, 200);
        document.removeEventListener('keydown', onKey);
        if (onClose) onClose();
    }

    function onKey(e) {
        if (e.key === 'Escape') {
            close();
        }
    }

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onKey);

    // Fokus auf erstes Element im Dialog setzen
    setTimeout(() => {
        const focusable = modal.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) focusable.focus();
    }, 30);

    return { close };
}
