<template>
    <!-- Footer minimaliste intégré dans le flux -->
    <footer class="front-footer">
        <span>© 2026 GLPI Dashboard</span>
        <span>Powered by Vue 3 & Bootstrap 5</span>
    </footer>
</template>

<style scoped>
.front-footer {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.75rem;
    background: var(--card-bg);
    color: var(--text-muted);
    font-size: 0.85rem;
    border-top: 1px solid var(--border-color);
    margin-top: auto;
}

@media (max-width: 720px) {
    .front-footer {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>