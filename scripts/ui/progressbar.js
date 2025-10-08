export function createProgressBar({ duration = 10000 } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'progress';
    wrap.setAttribute('role', 'progressbar');
    wrap.setAttribute('aria-valuemin', '0');
    wrap.setAttribute('aria-valuemax', String(duration));
    wrap.setAttribute('aria-valuenow', '0');

    const inner = document.createElement('div');
    inner.className = 'progress-inner';
    inner.style.animationDuration = duration + 'ms';
    wrap.appendChild(inner);

    let start = performance.now();
    let raf;
    let running = true;

    function loop(now) {
        const elapsed = now - start;
        const val = Math.min(duration, elapsed);
        wrap.setAttribute('aria-valuenow', String(Math.floor(val)));
        if (val >= duration) {
            start = performance.now();
        }
        raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    function pause() {
        if (!running) return;
        inner.style.animationPlayState = 'paused';
        running = false;
    }

    function resume() {
        if (running) return;
        inner.style.animationPlayState = 'running';
        running = true;
    }

    function destroy() {
        cancelAnimationFrame(raf);
    }

    return { el: wrap, pause, resume, destroy };
}
