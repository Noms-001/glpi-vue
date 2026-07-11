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
    <header class="layout-header">
        <div class="header-left">
            <button type="button" class="btn-icon header-menu-btn" @click="openMobileSidebar"
                aria-label="Ouvrir le menu">
                <i class="bi bi-list"></i>
            </button>

            <div class="header-search-wrapper">
                <BaseInput icon="bi bi-search" v-model="searchQuery" type="search" placeholder="Rechercher..."
                    customClass="header-search-input" />
            </div>
        </div>

        <div class="header-actions">
            <BaseButton variant="secondary" size="sm"
                @click="() => { router.push('/') }"
                label="Frontoffice"
            />

            <button type="button" class="btn-icon header-action-btn" @click="toggleTheme" aria-label="Bascule thème">
                <i :class="theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun-fill'"></i>
            </button>

            <div class="user-menu">
                <div class="user-avatar">
                    <img src="https://ui-avatars.com/api/?name=GLPI&background=0D6EFD&color=fff&bold=true" alt="Avatar">
                </div>
                <div class="user-info">
                    <span>GLPI</span>
                    <small>Admin</small>
                </div>
                <i class="bi bi-chevron-down user-dropdown-icon"></i>
            </div>
        </div>

        <!-- Barre de recherche mobile -->
        <div class="mobile-search">
            <BaseInput icon="bi bi-search" v-model="searchQuery" type="search" placeholder="Rechercher..."
                customClass="mobile-search-input" />
        </div>
    </header>
</template>

<style scoped>
.layout-header {
    position: sticky;
    top: 0;
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
    background: var(--navbar-bg);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

/* Section gauche */
.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

/* Bouton menu mobile */
.header-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: var(--surface-color);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.header-menu-btn:hover {
    background: var(--primary-color);
    color: white;
}

.header-menu-btn i {
    font-size: 1.25rem;
}

/* Brand */
.header-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.header-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
}

.header-brand-text strong {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-color);
}

.header-brand-text span {
    font-size: 0.75rem;
    color: var(--text-muted-custom);
}

/* Wrapper recherche desktop */
.header-search-wrapper {
    flex: 1;
    max-width: 400px;
}

.header-search-input {
    width: 100%;
}

/* Actions header */
.header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.header-action-btn {
    position: relative;
    border: none;
    background: var(--surface-color);
    color: var(--text-color);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.header-action-btn:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
}

.notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 10px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Menu utilisateur */
.user-menu {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    background: var(--surface-color);
    cursor: pointer;
    transition: all 0.2s ease;
}

.user-menu:hover {
    background: var(--surface-hover);
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.user-info span {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color);
}

.user-info small {
    font-size: 0.6875rem;
    color: var(--text-muted-custom);
}

.user-dropdown-icon {
    font-size: 0.75rem;
    color: var(--text-muted-custom);
    transition: transform 0.2s ease;
}

.user-menu:hover .user-dropdown-icon {
    transform: rotate(180deg);
}

/* Recherche mobile (cachée par défaut) */
.mobile-search {
    display: none;
    width: 100%;
    margin-top: 0.75rem;
}

.mobile-search-input {
    width: 100%;
}

/* ============================================
   RESPONSIVE BREAKPOINTS
   ============================================ */

/* Tablette (768px - 1024px) */
@media (max-width: 1024px) {
    .layout-header {
        padding: 0.75rem 1rem;
    }

    .user-info {
        display: none;
    }

    .user-menu {
        padding: 0.5rem;
    }

    .user-dropdown-icon {
        display: none;
    }

    .header-search-wrapper {
        max-width: 300px;
    }
}

/* Mobile (moins de 768px) */
@media (max-width: 768px) {
    .layout-header {
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
    }

    .header-left {
        flex: 0 0 auto;
    }

    .header-menu-btn {
        display: flex;
    }

    .header-brand-text {
        display: flex;
    }

    .header-search-wrapper {
        display: none;
    }

    .mobile-search {
        display: block;
    }

    .header-actions {
        gap: 0.5rem;
    }

    .header-action-btn {
        width: 36px;
        height: 36px;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
    }
}

/* Petit mobile (moins de 480px) */
@media (max-width: 480px) {
    .layout-header {
        padding: 0.625rem 0.875rem;
    }

    .header-brand-text strong {
        font-size: 0.875rem;
    }

    .header-brand-text span {
        font-size: 0.6875rem;
    }

    .header-action-btn {
        width: 32px;
        height: 32px;
    }

    .header-action-btn i {
        font-size: 0.875rem;
    }

    .user-avatar {
        width: 28px;
        height: 28px;
    }

    .notification-badge {
        font-size: 0.5rem;
        min-width: 14px;
        height: 14px;
        top: -2px;
        right: -2px;
    }

    .mobile-search {
        margin-top: 0.5rem;
    }
}

/* Animations */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.mobile-search {
    animation: slideDown 0.3s ease;
}
</style>