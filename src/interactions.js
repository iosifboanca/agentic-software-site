const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

function selectAudience(audience) {
    tabs.forEach((tab) => {
        const selected = tab.dataset.audience === audience;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
        panel.hidden = panel.id !== `panel-${audience}`;
    });
    if (!document.documentElement.classList.contains('motion-paused')) {
        document.getElementById(`panel-${audience}`).animate(
            [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
    }
}

document.querySelectorAll('[data-audience]').forEach((control) => {
    control.addEventListener('click', () => selectAudience(control.dataset.audience));
});

tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (event) => {
        let nextIndex;
        switch (event.key) {
            case 'ArrowRight': nextIndex = (index + 1) % tabs.length; break;
            case 'ArrowLeft': nextIndex = (index + tabs.length - 1) % tabs.length; break;
            case 'Home': nextIndex = 0; break;
            case 'End': nextIndex = tabs.length - 1; break;
            default: return;
        }
        event.preventDefault();
        selectAudience(tabs[nextIndex].dataset.audience);
        tabs[nextIndex].focus();
    });
});
