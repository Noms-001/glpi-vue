<script setup>
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import logo from '../../assets/logo.png'
import { logout } from '../../api/auth'
import router from '../../router'

const route = useRoute()
const sidebarCollapsed = inject('sidebarCollapsed')
const toggleSidebar = inject('toggleSidebar')
const mobileSidebarOpen = inject('mobileSidebarOpen')
const closeMobileSidebar = inject('closeMobileSidebar')

const menuItems = [
    { label: 'Dashboard', icon: 'bi bi-speedometer2', path: '/backoffice/dashboard' },
    { label: 'Import / Reset', icon: 'bi bi-cloud-arrow-up-fill', path: '/backoffice/import' },
    { label: 'Import Mouvement', icon: 'bi bi-cloud-arrow-up-fill', path: '/backoffice/import-mvt' },
    { label: 'Tickets', icon: 'bi bi-ticket-detailed', path: '/backoffice/tickets' },
    { label: 'Langue de statut', icon: 'bi bi-translate', path: '/backoffice/status-language' },
    { label: 'Couleur de statut', icon: 'bi bi-droplet', path: '/backoffice/status-color' },
    { label: 'Composants', icon: 'bi bi-grid-1x2', path: '/components-test' }
]
</script>

<template>
    <aside class="layout-sidebar" :aria-hidden="mobileSidebarOpen ? 'false' : 'true'">
        <div class="sidebar-brand" @click="toggleSidebar">
            <img :src="logo" alt="GLPI Logo" class="sidebar-logo" />
            <div class="brand-text" v-if="!sidebarCollapsed">
                <span>GLPI</span>
                <small>Admin moderne</small>
            </div>
        </div>

        <nav class="sidebar-menu">
            <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="sidebar-link"
                :class="{ active: route.path === item.path }" @click="closeMobileSidebar">
                <i :class="item.icon" aria-hidden="true"></i>
                <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </router-link>
        </nav>

        <div class="sidebar-footer">
            <button type="button" class="sidebar-collapse-btn" @click="logout(router)" aria-label="Réduire la barre">
                <i class="bi bi-box-arrow-right"></i>
                <span v-if="!sidebarCollapsed">Déconnexion</span>
            </button>
        </div>
    </aside>
</template>

<style scoped>
.layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: width var(--transition-normal), transform var(--transition-normal), background var(--transition-normal);
    z-index: 1000;
}

.sidebar-collapsed .layout-sidebar {
    width: 92px;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    cursor: pointer;
}

.sidebar-logo {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.7);
    padding: 0.3rem;
}

.brand-text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.brand-text span {
    font-weight: 700;
    letter-spacing: -0.02em;
}

.brand-text small {
    color: var(--text-muted-custom);
    font-size: 0.82rem;
}

.sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 1rem;
}

.sidebar-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.95rem 1rem;
    border-radius: var(--radius-lg);
    color: var(--text-color);
    transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
    font-weight: 500;
    text-decoration: none;
}

.sidebar-link i {
    font-size: 1.2rem;
    min-width: 24px;
    text-align: center;
}

.sidebar-link:hover,
.sidebar-link.active {
    background: rgba(79, 70, 229, 0.12);
    color: var(--primary-color);
}

.sidebar-footer {
    margin-top: auto;
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
}

.sidebar-collapse-btn {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.9rem 1rem;
    border: none;
    border-radius: var(--radius-md);
    background: var(--surface-color);
    color: var(--text-color);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-fast), background var(--transition-fast);
    cursor: pointer;
}

.sidebar-collapse-btn:hover {
    transform: translateY(-1px);
}

@media (max-width: 1100px) {
    .sidebar-collapsed .layout-sidebar {
        width: 92px;
    }
}

@media (max-width: 992px) {
    .layout-sidebar {
        transform: translateX(-110%);
    }

    .mobile-sidebar-open .layout-sidebar {
        transform: translateX(0);
    }
}
</style>