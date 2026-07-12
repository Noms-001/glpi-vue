<script setup>
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import { logout } from '../../api/auth'
import router from '../../router'

const route = useRoute()
const sidebarCollapsed = inject('sidebarCollapsed')
const toggleSidebar = inject('toggleSidebar')
const mobileSidebarOpen = inject('mobileSidebarOpen')
const closeMobileSidebar = inject('closeMobileSidebar')

const menuItems = [
    { 
        label: 'Menu Principal', 
        type: 'label',
        items: [
            { label: 'Dashboard', icon: 'bi bi-grid-1x2-fill', path: '/backoffice/dashboard' },
            { label: 'Import / Reset', icon: 'bi bi-cloud-arrow-up-fill', path: '/backoffice/import' },
            { label: 'Import Mouvement', icon: 'bi bi-arrow-left-right', path: '/backoffice/import-mvt' },
        ]
    },
    { 
        label: 'Gestion', 
        type: 'label',
        items: [
            { label: 'Tickets', icon: 'bi bi-ticket-detailed', path: '/backoffice/tickets' },
            { label: 'Langue de statut', icon: 'bi bi-translate', path: '/backoffice/status-language' },
            { label: 'Couleur de statut', icon: 'bi bi-palette2', path: '/backoffice/status-color' },
        ]
    },
    { 
        label: 'Système', 
        type: 'label',
        items: [
            { label: 'Composants', icon: 'bi bi-grid-1x2', path: '/components-test' },
        ]
    }
]
</script>

<template>
    <aside class="sidebar" :aria-hidden="mobileSidebarOpen ? 'false' : 'true'">
        <div class="sidebar-scroll">
            <template v-for="section in menuItems" :key="section.label">
                <div class="nav-label">
                    <span>{{ section.label }}</span>
                </div>
                <router-link 
                    v-for="item in section.items" 
                    :key="item.path" 
                    :to="item.path" 
                    class="nav-link-custom"
                    :class="{ active: route.path === item.path }" 
                    :data-label="item.label"
                    @click="closeMobileSidebar"
                >
                    <i :class="item.icon" aria-hidden="true"></i>
                    <span class="nav-link-text">{{ item.label }}</span>
                    <i class="bi bi-chevron-right chevron"></i>
                </router-link>
            </template>

            <div class="mt-auto pt-3">
                <button 
                    type="button" 
                    class="nav-link-custom w-100 logout-btn" 
                    @click="logout(router)"
                    data-label="Déconnexion"
                >
                    <i class="bi bi-box-arrow-right"></i>
                    <span class="nav-link-text">Déconnexion</span>
                </button>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    padding: 22px 16px;
    position: sticky;
    top: var(--topbar-h);
    height: calc(100vh - var(--topbar-h));
    overflow: hidden;
    width: var(--sidebar-w);
    flex-shrink: 0;
    transition: width .25s ease, padding .25s ease;
    z-index: 60;
}

.app-shell.collapsed .sidebar {
    width: var(--sidebar-w-collapsed);
    padding: 22px 14px;
}

.sidebar-scroll {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}

.nav-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    text-transform: uppercase;
    padding: 14px 10px 8px 10px;
    white-space: nowrap;
    overflow: hidden;
}

.app-shell.collapsed .nav-label {
    text-align: center;
    padding-left: 0;
    padding-right: 0;
}

.app-shell.collapsed .nav-label span {
    display: none;
}

.nav-link-custom {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    color: var(--text-main);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 2px;
    transition: background .15s ease, color .15s ease;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
}

.nav-link-custom i {
    font-size: 1.05rem;
    width: 20px;
    text-align: center;
    color: var(--text-muted);
    flex-shrink: 0;
    transition: color .15s ease;
}

.nav-link-custom:hover {
    background: var(--pill-bg);
    color: var(--text-main);
}

.nav-link-custom.active {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active-text);
}

.nav-link-custom.active i {
    color: var(--sidebar-active-text);
}

.nav-link-custom .chevron {
    margin-left: auto;
    font-size: 0.8rem;
}

.nav-link-text {
    overflow: hidden;
    transition: opacity .2s ease;
}

.app-shell.collapsed .nav-link-custom {
    justify-content: center;
    padding: 10px;
}

.app-shell.collapsed .nav-link-text,
.app-shell.collapsed .chevron {
    display: none;
}

/* Tooltip sur version réduite */
.app-shell.collapsed .nav-link-custom {
    position: relative;
}

.app-shell.collapsed .nav-link-custom:hover::after {
    content: attr(data-label);
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    background: var(--text-main);
    color: var(--bg);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.78rem;
    white-space: nowrap;
    z-index: 70;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.logout-btn {
    color: var(--text-muted) !important;
}

.logout-btn:hover {
    color: var(--danger-color) !important;
}

.logout-btn:hover i {
    color: var(--danger-color) !important;
}

/* Scrollbar personnalisée */
.sidebar-scroll::-webkit-scrollbar {
    width: 6px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 999px;
}

.sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
}

@media (max-width: 991px) {
    .sidebar {
        position: fixed;
        left: 0;
        z-index: 60;
        box-shadow: 0 0 24px rgba(0,0,0,0.2);
        transform: translateX(-100%);
        transition: transform .3s ease, width .25s ease;
    }
    
    .mobile-sidebar-open .sidebar {
        transform: translateX(0);
    }
    
    .app-shell.collapsed .sidebar {
        width: var(--sidebar-w);
    }
}
</style>