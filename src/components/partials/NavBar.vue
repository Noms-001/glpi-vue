<script setup>
import { inject } from 'vue'
import BaseInput from '../base/BaseInput.vue'
import router from '../../router/index.js'
import BaseButton from '../base/BaseButton.vue'

const searchQuery = defineModel('searchQuery')
const theme = inject('theme')
const toggleTheme = inject('toggleTheme')
const openMobileSidebar = inject('openMobileSidebar')
</script>

<template>
    <header class="topbar">
        <div class="topbar-brand" @click="openMobileSidebar" id="sidebarToggle">
            <div class="brand-icon">
                <img src="../../assets/logo.png" alt="logo glpi" width="40">
            </div>
            <div class="brand-text">
                <div class="brand-name">GLPI Admin</div>
                <div class="brand-sub">Gestion de parc informatique</div>
            </div>
        </div>

        <div class="search-wrap search-box d-none d-md-block">
            <i class="bi bi-search search-icon"></i>
            <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher..." 
                v-model="searchQuery"
            >
        </div>

        <div class="topbar-right">
            <button class="btn btn-pill btn-import d-none d-sm-inline-flex" @click="() => { router.push('/backoffice/import') }">
                <i class="bi bi-upload me-1"></i> Import
            </button>
            <button class="btn btn-pill btn-create" @click="() => { router.push('/') }">
                <i class="bi bi-boxes me-1"></i><span>Frontoffice</span>
            </button>

            <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? 'Mode clair' : 'Mode sombre'">
                <i :class="theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
            </button>

            <div class="user-chip">
                <img 
                    src="https://ui-avatars.com/api/?name=GLPI&background=0E3B36&color=fff&bold=true&size=40" 
                    class="user-avatar" 
                    alt="Admin GLPI"
                >
                <div class="d-none d-md-block">
                    <div class="user-name">
                        Administrateur 
                        <i class="bi bi-patch-check-fill" style="color: var(--brand-green); font-size:0.8rem;"></i>
                    </div>
                    <div class="user-email">GLPI Backoffice</div>
                </div>
            </div>
        </div>

        <!-- Barre de recherche mobile -->
        <div class="mobile-search d-md-none w-100 mt-2">
            <i class="bi bi-search search-icon"></i>
            <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher..." 
                v-model="searchQuery"
            >
        </div>
    </header>
</template>

<style scoped>
/* ============ TOPBAR ============ */
.topbar {
    background: var(--topbar-bg);
    height: var(--topbar-h);
    padding: 0 15px;
    display: flex;
    align-items: center;
    gap: 18px;
    position: sticky;
    top: 0;
    z-index: 100;
    flex-wrap: wrap;
}

.topbar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    width: var(--sidebar-w);
    flex-shrink: 0;
    padding-right: 10px;
    transition: width .25s ease;
    cursor: pointer;
}

.app-shell.collapsed .topbar-brand {
    width: var(--sidebar-w-collapsed);
}

.brand-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background: var(--sidebar-active-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sidebar-active-text);
    font-size: 1.1rem;
    flex-shrink: 0;
}

.brand-name {
    font-weight: 800;
    font-size: 1.02rem;
    line-height: 1.1;
    color: #fff;
    white-space: nowrap;
}

.brand-sub {
    font-size: 0.7rem;
    color: #9AA5AC;
    font-weight: 500;
    white-space: nowrap;
}

.brand-text {
    overflow: hidden;
    transition: opacity .2s ease, width .2s ease;
}

.app-shell.collapsed .brand-text {
    opacity: 0;
    width: 0;
}

/* Zone de recherche */
.search-wrap {
    flex: 1;
    max-width: 480px;
}

.search-wrap .form-control {
    background: var(--search-bg);
    border: none;
    color: #fff;
    border-radius: 999px;
    padding: 10px 18px 10px 42px;
    font-size: 0.88rem;
}

.search-wrap .form-control::placeholder {
    color: var(--search-text);
}

.search-wrap .form-control:focus {
    background: var(--search-bg);
    color: #fff;
    box-shadow: none;
    outline: none;
    border: 1px solid rgba(255,255,255,0.2);
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

/* Partie droite */
.topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
}

.btn-pill {
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 9px 18px;
    white-space: nowrap;
    border: none;
    display: inline-flex;
    align-items: center;
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

.theme-toggle {
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
}

.theme-toggle:hover {
    background: rgba(255,255,255,0.15);
    color: #fff;
}

/* Menu utilisateur */
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
    flex-shrink: 0;
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

/* Barre de recherche mobile */
.mobile-search {
    position: relative;
}

.mobile-search .form-control {
    background: var(--search-bg);
    border: none;
    color: #fff;
    border-radius: 999px;
    padding: 10px 18px 10px 42px;
    font-size: 0.88rem;
}

.mobile-search .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--search-text);
}

@media (max-width: 991px) {
    .topbar-brand {
        width: auto;
    }
    .app-shell.collapsed .topbar-brand {
        width: auto;
    }
    .app-shell.collapsed .brand-text {
        opacity: 1;
        width: auto;
    }
}

@media (max-width: 768px) {
    .topbar {
        flex-wrap: wrap;
        padding: 10px 12px;
    }
    .topbar-right {
        gap: 8px;
    }
    .theme-toggle {
        width: 36px;
        height: 36px;
    }
    .user-avatar {
        width: 36px;
        height: 36px;
    }
}
</style>