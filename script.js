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
