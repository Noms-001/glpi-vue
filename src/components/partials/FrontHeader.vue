<script setup>
import { inject, ref } from 'vue'

const theme = inject('theme', ref('light'))
const toggleTheme = inject('toggleTheme', () => {})

// Tableau des liens de navigation (ajoutez / modifiez selon vos routes)
const navLinks = ref([
    { label: 'Accueil', to: '/items', icon: 'bi-house' },
    { label: 'Creer un ticket', to: '/tickets/new', icon: 'bi-ticket-perforated' },
    { label: 'Gestion de statut', to: '/tickets/kanban', icon: 'bi-diagram-3' },
    { label: 'Cout', to: '/tickets/sum-cost', icon: 'bi-cash-coin' },
    { label: 'Couts', to: '/tickets/costs', icon: 'bi-cash-coin' }
])
</script>

<template>
    <header class="front-header py-3 px-4 d-flex align-items-center justify-content-between border-bottom bg-body-tertiary">
        <!-- Gauche : marque -->
        <div class="front-brand d-flex align-items-center gap-2">
            <div class="brand-mark rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                <span>G</span>
            </div>
            <div style="color: var(--text-color)">
                <h1 class="h5 mb-0">GLPI Frontoffice</h1>
                <p class="mb-0 small"  style="color: var(--text-muted-custom)">Self-service portal</p>
            </div>
        </div>

        <!-- Centre : navigation dynamique (liens) -->
        <nav class="front-nav-center d-none d-lg-flex gap-4">
            <router-link
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="nav-link-custom d-flex align-items-center gap-2"
                active-class="active"
            >
                <i v-if="link.icon" :class="['bi', link.icon]"></i>
                <span>{{ link.label }}</span>
            </router-link>
        </nav>

        <!-- Droite : thème + backoffice -->
        <div class="d-flex align-items-center gap-2">
            <nav class="front-nav d-none d-md-flex gap-2">
                <router-link to="/backoffice/login" class="btn btn-sm btn-outline-secondary">Backoffice</router-link>
            </nav>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="toggleTheme"
                aria-label="Basculer le thème">
                <i :class="theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun-fill'"></i>
            </button>
        </div>
    </header>
</template>

<style scoped>
.front-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: var(--sidebar-bg) !important;
    border-bottom: 1px solid var(--border-color) !important;
    box-shadow: 0 0 10px var(--border-color);
    flex-wrap: wrap;
    gap: 1rem;
}

/* Marque */
.front-brand h1 {
    font-size: 1rem;
    letter-spacing: -0.02em;
}
.brand-mark {
    width: 44px;
    height: 44px;
    font-weight: 700;
    font-size: 1.1rem;
    background: var(--primary-color);
    transition: transform var(--transition-fast);
}
.brand-mark:hover {
    transform: scale(1.02);
}

/* Liens centraux */
.front-nav-center {
    flex: 1;
    justify-content: center;
}
.nav-link-custom {
    font-weight: 500;
    font-size: 0.95rem;
    padding: 0.4rem 0;
    color: var(--text-muted-custom);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: all var(--transition-fast);
}
.nav-link-custom i {
    font-size: 1.1rem;
}
.nav-link-custom:hover {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}
.nav-link-custom.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    font-weight: 600;
}

/* Boutons droite */
.front-nav .btn {
    min-width: 90px;
}
.btn-outline-secondary {
    border-color: var(--border-color);
    color: var(--text-color);
}
.btn-outline-secondary:hover {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

/* Responsive : sur tablette, les liens passent en colonne ? On les garde centrés, mais on peut les masquer sur mobile */
@media (max-width: 991.98px) {
    .front-nav-center {
        order: 3;
        width: 100%;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 0.5rem;
        border-top: 1px solid var(--border-color);
        padding-top: 0.75rem;
    }
}
</style>