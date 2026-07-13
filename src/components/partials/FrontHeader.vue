<script setup>
// @ts-nocheck

import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'

const theme = inject('theme', ref('light'))
const toggleTheme = inject('toggleTheme', () => {})
const router = useRouter()
const searchQuery = ref('')

const isActive = (path) => {
    return router.currentRoute.value.path === path
}

const goToBackoffice = () => {
    router.push('/backoffice/login')
}
</script>

<template>
    <!-- ============ SIDEBAR (identique à la référence) ============ -->
    <aside class="sidebar">
        <!-- Marque -->
        <div class="brand">
            <div class="brand-icon">
                <span style="font-weight: 800;">G</span>
            </div>
            <div>
                <div class="brand-name">Glpi Front</div>
                <div class="brand-sub">Parc informatique</div>
            </div>
        </div>

        <!-- Menu Principal -->
        <div class="nav-label">Main Menu</div>
        <router-link to="/items" class="nav-link-custom" :class="{ active: isActive('/items') }">
            <i class="bi bi-grid-1x2-fill"></i> Dashboard
            <i class="bi bi-chevron-right chevron"></i>
        </router-link>
        <router-link to="/tickets/new" class="nav-link-custom" :class="{ active: isActive('/tickets/new') }">
            <i class="bi bi-ticket-perforated"></i> Nouveau ticket
        </router-link>
        <router-link to="/tickets/kanban" class="nav-link-custom" :class="{ active: isActive('/tickets/kanban') }">
            <i class="bi bi-diagram-3"></i> Kanban
        </router-link>
        <router-link to="/tickets/costs" class="nav-link-custom" :class="{ active: isActive('/tickets/costs') }">
            <i class="bi bi-cash-coin"></i> Coûts
        </router-link>
        <router-link to="/tickets/sum-cost" class="nav-link-custom" :class="{ active: isActive('/tickets/costs') }">
            <i class="bi bi-cash-coin"></i> Coûts combinés
        </router-link>      
    </aside>

    <!-- ============ PARTIE DROITE (TOPBAR + CONTENU) ============ -->
    <div class="app-right">
        <!-- TOPBAR (identique à la référence) -->
        <header class="topbar">
            <!-- Recherche -->
            <div class="search-wrap search-box">
                <i class="bi bi-search search-icon"></i>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search..."
                    v-model="searchQuery"
                >
            </div>

            <!-- Boutons d'action -->
            <button class="btn btn-pill btn-import">
                <i class="bi bi-upload me-1"></i> Import
            </button>
            <button class="btn btn-pill btn-create" @click="goToBackoffice">
                <i class="bi bi-shield-lock me-1"></i><span>Backoffice</span>
            </button>

            <!-- Icône notifications -->
            <button class="icon-btn" title="Notifications">
                <i class="bi bi-bell"></i>
            </button>

            <!-- Toggle thème -->
            <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? 'Mode clair' : 'Mode sombre'">
                <i :class="theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
            </button>

            <!-- Utilisateur -->
            <div class="user-chip">
                <img 
                    src="https://ui-avatars.com/api/?name=User&background=0E3B36&color=fff&bold=true&size=40" 
                    class="user-avatar" 
                    alt="Utilisateur"
                >
                <div class="d-none d-md-block">
                    <div class="user-name">
                        Utilisateur 
                        <i class="bi bi-patch-check-fill" style="color: var(--brand-green); font-size:0.8rem;"></i>
                    </div>
                    <div class="user-email">GLPI Frontoffice</div>
                </div>
            </div>
        </header>

        <!-- CONTENU PRINCIPAL -->
        <main class="main-content">
            <slot />
        </main>

        <!-- FOOTER -->
        <footer class="front-footer">
            <span>© 2026 GLPI Dashboard</span>
            <span>Powered by Vue 3 & Bootstrap 5</span>
        </footer>
    </div>
</template>

<style scoped>
/* ============ SIDEBAR (STYLES EXACTS DE LA RÉFÉRENCE) ============ */
.sidebar {
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    padding: 22px 18px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
}

/* Marque */
.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 6px 24px 6px;
}

.brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--brand-green);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1.1rem;
    flex-shrink: 0;
}

[data-theme="dark"] .brand-icon {
    color: #0C1216;
}

.brand-name {
    font-weight: 800;
    font-size: 1.05rem;
    line-height: 1.1;
    color: var(--text-main);
}

.brand-sub {
    font-size: 0.72rem;
    color: var(--text-muted);
    font-weight: 500;
}

/* Labels de section */
.nav-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    text-transform: uppercase;
    padding: 14px 10px 8px 10px;
}

/* Liens de navigation */
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
}

.nav-link-custom i {
    font-size: 1.05rem;
    width: 20px;
    text-align: center;
    color: var(--text-muted);
    flex-shrink: 0;
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

/* ============ TOPBAR (STYLES EXACTS DE LA RÉFÉRENCE) ============ */
.topbar {
    background: var(--topbar-bg);
    padding: 14px 28px;
    display: flex;
    align-items: center;
    position: fixed;
    width: 100%;
    z-index: 2000;
    gap: 20px;
}

/* Recherche */
.search-wrap {
    flex: 1;
    max-width: 520px;
}

.search-wrap .form-control {
    background: var(--search-bg);
    border: none;
    color: #fff;
    border-radius: 999px;
    padding: 10px 18px 10px 42px;
    font-size: 0.88rem;
    font-family: var(--font-family);
}

.search-wrap .form-control::placeholder {
    color: var(--search-text);
}

.search-wrap .form-control:focus {
    background: var(--search-bg);
    color: #fff;
    box-shadow: none;
    outline: none;
}

.search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--search-text);
}

.search-box {
    position: relative;
}

/* Boutons topbar */
.btn-pill {
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 9px 18px;
    white-space: nowrap;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    font-family: var(--font-family);
}

.btn-import {
    background: rgba(255,255,255,0.08);
    color: #fff;
}

.btn-import:hover {
    background: rgba(255,255,255,0.15);
    color: #fff;
}

.btn-create {
    background: var(--accent-orange);
    color: #23180a;
}

.btn-create:hover {
    filter: brightness(1.05);
    color: #23180a;
}

/* Icônes */
.icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border: none;
    flex-shrink: 0;
    font-size: 1.05rem;
    cursor: pointer;
    transition: background .15s ease;
}

.icon-btn:hover {
    background: rgba(255,255,255,0.15);
    color: #fff;
}

/* Theme toggle */
.theme-toggle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: none;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;
    flex-shrink: 0;
    cursor: pointer;
    transition: background .15s ease;
}

.theme-toggle:hover {
    background: rgba(255,255,255,0.15);
}

/* Utilisateur */
.user-chip {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
}

.user-name {
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.user-email {
    color: #9AA5AC;
    font-size: 0.75rem;
    white-space: nowrap;
}

/* ============ MAIN CONTENT ============ */
.main-content {
    flex: 1;
    padding: 28px 32px 40px 32px;
    background-color: var(--bg);
}

/* ============ FOOTER ============ */
.front-footer {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.75rem;
    background: var(--card-bg);
    color: var(--text-muted);
    font-size: 0.85rem;
    border-top: 1px solid var(--border-color);
}

/* ============ LAYOUT DROITE ============ */
.app-right {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* ============ SCROLLBAR ============ */
.sidebar::-webkit-scrollbar {
    width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 999px;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 991px) {
    .sidebar {
        display: none;
    }
    
    .topbar {
        padding: 12px 16px;
    }
}

@media (max-width: 768px) {
    .topbar {
        flex-wrap: wrap;
        gap: 12px;
    }
    
    .search-wrap {
        max-width: 100%;
        order: 2;
        width: 100%;
    }
    
    .main-content {
        padding: 20px 16px 30px 16px;
    }
    
    .front-footer {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>