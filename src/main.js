import './interactions.js';
import { createSculpture } from './scene.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.getElementById('motion-toggle');
const sculptures = [];
let motionEnabled = !reducedMotion.matches;

function setMotion(enabled) {
    motionEnabled = enabled;
    document.documentElement.classList.toggle('motion-paused', !enabled);
    document.documentElement.classList.toggle('motion-enabled', enabled);
    motionButton.setAttribute('aria-pressed', String(!enabled));
    motionButton.innerHTML = enabled
        ? 'Pause motion <span aria-hidden="true">Ⅱ</span>'
        : 'Enable motion <span aria-hidden="true">▷</span>';
    sculptures.forEach((sculpture) => sculpture.setMotion(enabled));
}

setMotion(motionEnabled);
motionButton.addEventListener('click', () => setMotion(!motionEnabled));
reducedMotion.addEventListener('change', (event) => setMotion(!event.matches));

document.querySelectorAll('[data-scene]').forEach((host) => {
    try {
        const sculpture = createSculpture(host, motionEnabled);
        sculptures.push(sculpture);
        if (host.dataset.scene === 'helix') motionButton.hidden = false;
    } catch (error) {
        host.dataset.ready = 'false';
        console.warn('The 3D artwork is unavailable; the static artwork remains visible.', error);
    }
});

const approach = document.getElementById('approach');
const steps = [...document.querySelectorAll('.approach-steps li')];
let scrollFrame = 0;

function updateProgress() {
    const bounds = approach.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (innerHeight * .65 - bounds.top) / (bounds.height * .75)));
    approach.style.setProperty('--process-progress', progress);
    steps.forEach((step, index) => step.classList.toggle('is-active', progress >= index / steps.length));
    scrollFrame = 0;
}

addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
}, { passive: true });
addEventListener('resize', updateProgress);
addEventListener('pagehide', (event) => {
    if (!event.persisted) sculptures.forEach((sculpture) => sculpture.dispose());
});
updateProgress();
