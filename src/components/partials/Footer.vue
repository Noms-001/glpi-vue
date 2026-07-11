<template>
    <footer class="layout-footer">
        <span>© 2026 GLPI Dashboard</span>
        <span>Powered by Vue 3 & Bootstrap 5</span>
    </footer>
</template>

<style scoped>
.layout-footer {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.75rem;
    background: var(--footer-bg);
    color: var(--text-muted-custom);
    font-size: 0.94rem;
    border-top: 1px solid var(--border-color);
}

@media (max-width: 720px) {
    .layout-footer {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>