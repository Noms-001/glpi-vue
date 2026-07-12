<script setup>
// @ts-nocheck

import { ref } from 'vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseTable from '../components/base/BaseTable.vue'
import BaseProgressBar from '../components/base/BaseProgressBar.vue'
import BaseLayout from '../layouts/BaseLayout.vue'

// ============ BASE BUTTON ============
const isLoading = ref(false)
const buttonClicked = ref('')

const handleButtonClick = (label) => {
    isLoading.value = true
    buttonClicked.value = label
    setTimeout(() => {
        isLoading.value = false
    }, 2000)
}

// ============ BASE INPUT ============
const inputText = ref('')
const inputEmail = ref('')
const inputPassword = ref('')
const inputError = ref('')
const textareaValue = ref('')
const fileValue = ref(null)
const checkboxValue = ref(false)
const radioValue = ref(null)
const colorValue = ref('#3b73f7')

const validateInput = () => {
    if (inputText.value.length < 3) {
        inputError.value = 'Le texte doit contenir au moins 3 caractères'
    } else {
        inputError.value = ''
    }
}

// ============ BASE SELECT ============
const selectedCity = ref(null)
const selectedStatus = ref('active')
const autocompleteValue = ref(null)

const cities = [
    { id: 1, name: 'Paris' },
    { id: 2, name: 'Lyon' },
    { id: 3, name: 'Marseille' },
    { id: 4, name: 'Toulouse' },
    { id: 5, name: 'Bordeaux' },
    { id: 6, name: 'Lille' }
]

const statuses = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'pending', label: 'En attente' }
]

// ============ BASE MODAL ============
const showSimpleModal = ref(false)
const showFormModal = ref(false)
const showConfirmModal = ref(false)

const formData = ref({
    name: '',
    email: '',
    city: null
})

const submitForm = () => {
    console.log('Formulaire soumis :', formData.value)
    showFormModal.value = false
    formData.value = { name: '', email: '', city: null }
}

const confirmAction = () => {
    showConfirmModal.value = false
}

// ============ BASE TABLE ============
const selectedItems = ref([])
const tableLoading = ref(false)

const users = ref([
    { id: 1, name: 'Jean Dupont', email: 'jean@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Marie Martin', email: 'marie@example.com', role: 'Utilisateur', status: 'inactive' },
    { id: 3, name: 'Pierre Bernard', email: 'pierre@example.com', role: 'Utilisateur', status: 'pending' },
    { id: 4, name: 'Sophie Rousseau', email: 'sophie@example.com', role: 'Modérateur', status: 'active' },
    { id: 5, name: 'Luc Moreau', email: 'luc@example.com', role: 'Admin', status: 'active' },
    { id: 6, name: 'Emma Petit', email: 'emma@example.com', role: 'Utilisateur', status: 'inactive' }
])

const userColumns = [
    { key: 'id', label: 'ID', align: 'center' },
    { key: 'name', label: 'Nom', class: 'fw-semibold' },
    { key: 'email', label: 'Email' },
    { 
        key: 'role', 
        label: 'Rôle',
        badge: true,
        badgeVariant: (value) => {
            if (value === 'Admin') return 'danger'
            if (value === 'Modérateur') return 'warning'
            return 'default'
        }
    },
    {
        key: 'status',
        label: 'Statut',
        badge: true,
        badgeVariant: (value) => {
            if (value === 'active') return 'success'
            if (value === 'inactive') return 'secondary'
            return 'warning'
        },
        formatter: (value) => {
            const labels = { active: 'Actif', inactive: 'Inactif', pending: 'En attente' }
            return labels[value] || value
        }
    }
]

const handleRowClick = (item) => {
    console.log('Ligne cliquée :', item)
}

// ============ BASE CARD ============
const productImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
const profileImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'

// ============ PROGRESS BAR ============
const progressValue = ref(65)
const progressLogs = ref([
    '🚀 Initialisation de la tâche...',
    '📄 Analyse des données en cours',
    '✅ Étape 1 terminée avec succès',
    '⚠️ Attention : donnée manquante',
    '📊 Traitement des fichiers...',
    '✅ Import terminé'
])

const simulateProgress = () => {
    progressValue.value = 0
    const interval = setInterval(() => {
        if (progressValue.value >= 100) {
            clearInterval(interval)
        } else {
            progressValue.value += Math.floor(Math.random() * 15) + 5
            if (progressValue.value > 100) progressValue.value = 100
        }
    }, 500)
}
</script>

<template>
    <BaseLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <span class="eyebrow">Développement</span>
            <h1 class="page-title">Composants UI</h1>
            <p class="page-subtitle">
                Bibliothèque de composants réutilisables — Testez et explorez chaque élément.
            </p>
        </div>

        <!-- ==================== BASE BUTTON ==================== -->
        <div class="card-custom mb-4">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-ui-checks"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">BaseButton</h2>
                    <p class="text-muted-custom small mb-0">Boutons avec variants, tailles et états</p>
                </div>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <h3 class="demo-label">Variants</h3>
                    <div class="d-flex flex-wrap gap-2">
                        <BaseButton label="Primaire" variant="primary" />
                        <BaseButton label="Secondaire" variant="secondary" />
                        <BaseButton label="Outline" variant="outline-secondary" />
                        <BaseButton label="Succès" variant="success" />
                        <BaseButton label="Danger" variant="danger" />
                        <BaseButton label="Warning" variant="warning" />
                        <BaseButton label="Ghost" variant="ghost" />
                    </div>
                </div>

                <div class="col-md-6">
                    <h3 class="demo-label">Tailles & États</h3>
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <BaseButton label="Small" size="sm" />
                        <BaseButton label="Medium" size="md" />
                        <BaseButton label="Large" size="lg" />
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <BaseButton label="Avec icône" icon="bi bi-star-fill" variant="warning" />
                        <BaseButton label="Loading" variant="primary" :loading="isLoading" @click="handleButtonClick('Test')" />
                        <BaseButton label="Pill" pill variant="success" />
                        <BaseButton icon="bi bi-gear" variant="ghost" title="Paramètres" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== BASE INPUT ==================== -->
        <div class="card-custom mb-4">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-input-cursor-text"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">BaseInput</h2>
                    <p class="text-muted-custom small mb-0">Champs de saisie avec validation et icônes</p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <h3 class="demo-label">Types standards</h3>
                    <div class="d-flex flex-column gap-3">
                        <BaseInput v-model="inputText" label="Texte" placeholder="Entrez du texte..." icon="bi bi-pencil" />
                        <BaseInput v-model="inputEmail" type="email" label="Email" placeholder="email@exemple.com" icon="bi bi-envelope" />
                        <BaseInput v-model="inputPassword" type="password" label="Mot de passe" placeholder="••••••••" />
                        <BaseInput v-model="textareaValue" type="textarea" label="Description" placeholder="Écrivez votre message..." />
                    </div>
                </div>

                <div class="col-md-6">
                    <h3 class="demo-label">Types spéciaux</h3>
                    <div class="d-flex flex-column gap-3">
                        <div>
                            <label class="input-label mb-2">Couleur</label>
                            <BaseInput v-model="colorValue" type="color" />
                        </div>
                        <BaseInput v-model="fileValue" type="file" label="Fichier" placeholder="Sélectionner un fichier..." />
                        <div class="d-flex gap-4">
                            <BaseInput v-model="checkboxValue" type="checkbox" label="J'accepte les conditions" />
                        </div>
                        <div class="d-flex gap-4">
                            <BaseInput v-model="radioValue" type="radio" :value="true" label="Oui" />
                            <BaseInput v-model="radioValue" type="radio" :value="false" label="Non" />
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <h3 class="demo-label">Validation & Erreurs</h3>
                    <div class="row g-3 align-items-end">
                        <div class="col-md-8">
                            <BaseInput 
                                v-model="inputText" 
                                label="Texte (min 3 caractères)" 
                                :error="inputError" 
                                required 
                                helper="Saisissez au moins 3 caractères"
                            />
                        </div>
                        <div class="col-md-4">
                            <BaseButton label="Valider" variant="primary" @click="validateInput" class="w-100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== BASE SELECT ==================== -->
        <div class="card-custom mb-4">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-list-check"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">BaseSelect</h2>
                    <p class="text-muted-custom small mb-0">Sélecteur natif et autocomplete avec recherche</p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-4">
                    <h3 class="demo-label">Select natif</h3>
                    <BaseSelect 
                        v-model="selectedCity" 
                        label="Ville" 
                        :options="cities" 
                        optionLabel="name" 
                        optionValue="id" 
                        placeholder="Choisir une ville..."
                        clearable
                    />
                </div>
                <div class="col-md-4">
                    <h3 class="demo-label">Avec statut</h3>
                    <BaseSelect 
                        v-model="selectedStatus" 
                        label="Statut" 
                        :options="statuses" 
                        required 
                    />
                </div>
                <div class="col-md-4">
                    <h3 class="demo-label">Autocomplete</h3>
                    <BaseSelect 
                        v-model="autocompleteValue" 
                        label="Rechercher une ville" 
                        :options="cities" 
                        optionLabel="name" 
                        optionValue="id"
                        autocomplete 
                        searchable 
                        clearable
                        placeholder="Tapez pour rechercher..."
                    />
                </div>
            </div>
        </div>

        <!-- ==================== BASE MODAL ==================== -->
        <div class="card-custom mb-4">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-window"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">BaseModal</h2>
                    <p class="text-muted-custom small mb-0">Fenêtres modales avec animations et tailles</p>
                </div>
            </div>

            <div class="d-flex flex-wrap gap-2">
                <BaseButton label="Modale simple" variant="primary" @click="showSimpleModal = true" />
                <BaseButton label="Modale formulaire" variant="success" @click="showFormModal = true" />
                <BaseButton label="Modale confirmation" variant="danger" @click="showConfirmModal = true" />
            </div>
        </div>

        <!-- ==================== BASE PROGRESS BAR ==================== -->
        <div class="card-custom mb-4">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-bar-chart-steps"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">BaseProgressBar</h2>
                    <p class="text-muted-custom small mb-0">Barre de progression avec logs et animations</p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <BaseProgressBar 
                        label="Progression" 
                        :value="progressValue" 
                        variant="primary"
                        :logs="progressLogs"
                        animated
                    />
                    <BaseButton 
                        label="Simuler" 
                        variant="primary" 
                        size="sm" 
                        @click="simulateProgress" 
                        class="mt-3"
                    />
                </div>
                <div class="col-md-6">
                    <div class="d-flex flex-column gap-3">
                        <BaseProgressBar label="Succès" :value="100" variant="success" :showLogs="false" />
                        <BaseProgressBar label="Attention" :value="45" variant="warning" :showLogs="false" striped />
                        <BaseProgressBar label="Erreur" :value="20" variant="danger" :showLogs="false" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== BASE TABLE ==================== -->
        <div class="card-custom mb-4">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-table"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">BaseTable</h2>
                    <p class="text-muted-custom small mb-0">Tableau de données avec tri, recherche et sélection</p>
                </div>
            </div>

            <BaseTable 
                :items="users" 
                :columns="userColumns"
                :loading="tableLoading"
                :selectedItems="selectedItems"
                @update:selectedItems="selectedItems = $event"
                :onRowClick="handleRowClick"
                searchable 
                sortable
                multiSelect
                :pageSize="4"
                empty-message="Aucun utilisateur trouvé"
            >
                <template #cell-actions="{ item }">
                    <div class="d-flex gap-1">
                        <BaseButton icon="bi bi-pencil" variant="ghost" size="sm" title="Modifier" />
                        <BaseButton icon="bi bi-trash" variant="ghost" size="sm" title="Supprimer" />
                    </div>
                </template>
            </BaseTable>

            <div v-if="selectedItems.length" class="mt-3">
                <p class="text-muted-custom small mb-0">
                    <strong>{{ selectedItems.length }}</strong> élément(s) sélectionné(s)
                </p>
            </div>
        </div>

        <!-- ==================== BASE CARD ==================== -->
        <div class="card-custom">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="stat-icon mb-0">
                    <i class="bi bi-card-text"></i>
                </div>
                <div>
                    <h2 class="section-title mb-0">BaseCard</h2>
                    <p class="text-muted-custom small mb-0">Cartes statistiques, contenu et produits</p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-3">
                    <BaseCard 
                        icon="bi bi-people-fill" 
                        label="Utilisateurs" 
                        value="1,234" 
                        trend="+12.5%" 
                        trend-type="positive" 
                    />
                </div>
                <div class="col-md-3">
                    <BaseCard 
                        icon="bi bi-ticket-perforated" 
                        label="Tickets" 
                        value="42" 
                        trend="-3.2%" 
                        trend-type="negative" 
                    />
                </div>
                <div class="col-md-3">
                    <BaseCard 
                        icon="bi bi-currency-euro" 
                        label="Revenus" 
                        value="8,950€" 
                        trend="+22%" 
                        trend-type="positive" 
                    />
                </div>
                <div class="col-md-3">
                    <BaseCard 
                        icon="bi bi-clock-history" 
                        label="En attente" 
                        value="7" 
                    />
                </div>

                <div class="col-md-6">
                    <BaseCard 
                        :image="productImage" 
                        title="Casque sans fil Premium" 
                        subtitle="Audio HD • Bluetooth 5.0"
                        description="Réduction de bruit active, autonomie 30h, coussinets mémoire de forme."
                        price="79,99€" 
                        oldPrice="99,99€"
                        :badges="[
                            { label: '-20%', variant: 'danger' },
                            { label: 'Best-seller', variant: 'success' }
                        ]"
                        actionLabel="Ajouter au panier" 
                        actionVariant="primary"
                    />
                </div>
                <div class="col-md-6">
                    <BaseCard 
                        :image="profileImage" 
                        title="Sophie Rousseau" 
                        subtitle="Product Designer"
                        description="10+ ans d'expérience en UX/UI design. Disponible pour des missions freelance."
                        :badges="[
                            { label: 'Disponible', variant: 'success', icon: 'bi bi-check-circle' },
                            { label: 'Top Rated', variant: 'warning', icon: 'bi bi-star-fill' }
                        ]"
                        actionLabel="Contacter" 
                        actionVariant="outline-secondary"
                    />
                </div>
            </div>
        </div>

        <!-- ==================== MODALS ==================== -->
        <BaseModal v-model="showSimpleModal" title="Modale Simple" size="md">
            <p>Ceci est une modale simple avec un contenu basique.</p>
            <p class="text-muted-custom">Elle se ferme en cliquant à l'extérieur ou sur le bouton ×.</p>
            <div class="alert-custom alert-info mt-3">
                <i class="bi bi-info-circle"></i>
                <span>Le composant supporte les transitions animées.</span>
            </div>
        </BaseModal>

        <BaseModal v-model="showFormModal" title="Nouvel utilisateur" size="lg" :closeOnOutside="false">
            <div class="d-flex flex-column gap-3">
                <BaseInput v-model="formData.name" label="Nom complet" placeholder="Jean Dupont" required />
                <BaseInput v-model="formData.email" type="email" label="Email" placeholder="jean@exemple.com" required />
                <BaseSelect v-model="formData.city" label="Ville" :options="cities" optionLabel="name" optionValue="id" placeholder="Sélectionner une ville..." />
            </div>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showFormModal = false" />
                <BaseButton label="Créer l'utilisateur" variant="success" @click="submitForm" icon="bi bi-person-plus" />
            </template>
        </BaseModal>

        <BaseModal v-model="showConfirmModal" title="Confirmation" size="sm" :closeOnOutside="false">
            <div class="text-center py-3">
                <i class="bi bi-exclamation-triangle-fill text-danger mb-3" style="font-size: 2.5rem;"></i>
                <p class="fw-semibold mb-2">Êtes-vous sûr de vouloir continuer ?</p>
                <p class="text-muted-custom small mb-0">Cette action est irréversible.</p>
            </div>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showConfirmModal = false" />
                <BaseButton label="Confirmer" variant="danger" @click="confirmAction" icon="bi bi-check-lg" />
            </template>
        </BaseModal>
    </BaseLayout>
</template>

<style scoped>
/* ============ PAGE HEADER ============ */
.page-header {
    margin-bottom: 1.5rem;
}

.eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    background: var(--brand-green-light);
    color: var(--brand-green);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.page-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.02em;
}

.page-subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
    font-weight: 500;
    margin: 0;
}

/* ============ CARDS ============ */
.card-custom {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 24px;
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.01em;
    margin: 0;
}

.stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--pill-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: var(--brand-green);
    flex-shrink: 0;
}

/* ============ DEMO LABELS ============ */
.demo-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
}

.input-label {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-main);
    display: block;
}

/* ============ ALERTS ============ */
.alert-custom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 500;
}

.alert-info {
    background: rgba(59, 130, 246, 0.08);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .card-custom {
        padding: 18px;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
}
</style>