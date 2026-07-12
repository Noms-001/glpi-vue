<script setup>
// @ts-nocheck
import { ref, onMounted, computed } from 'vue'
import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import { get, post } from '../../api/backend-client.js'
import { ticketStates } from '../../utils/TicketManager.js'
import TicketStatusTranslation from '../../models/tickets/TicketStatusTranslation.js'

const statusTranslation = ref(new TicketStatusTranslation())
const languageOptions = ref([])
const submitting = ref(false)
const loadingLanguages = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Historique des traductions (simulé)
const savedTranslations = ref([
    { id: 1, status: 'Nouveau', langue: 'en', valeur: 'New', date: '2026-01-15' },
    { id: 2, status: 'En cours', langue: 'en', valeur: 'In Progress', date: '2026-01-15' },
    { id: 3, status: 'Résolu', langue: 'en', valeur: 'Resolved', date: '2026-01-16' },
    { id: 4, status: 'Fermé', langue: 'es', valeur: 'Cerrado', date: '2026-01-17' }
])

const statusOptions = Array.from(ticketStates.values()).map((state) => ({
    value: state.id,
    label: state.name
}))

// Statut sélectionné pour l'aperçu
const selectedStatusName = computed(() => {
    const found = statusOptions.find(opt => opt.value === statusTranslation.value.id)
    return found ? found.label : '—'
})

const isFormValid = computed(() => {
    return statusTranslation.value.id && 
           statusTranslation.value.langue && 
           statusTranslation.value.valeur
})

const translationsColumns = [
    { key: 'status', label: 'Statut', class: 'fw-semibold' },
    { 
        key: 'langue', 
        label: 'Langue',
        align: 'center',
        badge: true,
        badgeVariant: 'primary'
    },
    { key: 'valeur', label: 'Traduction' }
]

const loadLanguages = async () => {
    loadingLanguages.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await get('/langues')

        if (response.success && Array.isArray(response.data)) {
            languageOptions.value = response.data.map((lang) => ({
                value: lang.code,
                label: lang.code.toUpperCase()
            }))
            return
        }

        // Fallback : langues par défaut
        languageOptions.value = [
            { value: 'fr', label: 'FR' },
            { value: 'en', label: 'EN' },
            { value: 'es', label: 'ES' },
            { value: 'de', label: 'DE' },
            { value: 'it', label: 'IT' },
            { value: 'pt', label: 'PT' }
        ]
    } catch (err) {
        // Fallback silencieux
        languageOptions.value = [
            { value: 'fr', label: 'FR' },
            { value: 'en', label: 'EN' },
            { value: 'es', label: 'ES' }
        ]
    } finally {
        loadingLanguages.value = false
    }
}

const submitTranslation = async () => {
    if (!isFormValid.value) {
        errorMessage.value = 'Veuillez compléter tous les champs.'
        successMessage.value = ''
        return
    }

    submitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const payload = {
            id: statusTranslation.value.id,
            langue: statusTranslation.value.langue,
            valeur: statusTranslation.value.valeur
        }

        const response = await post('/status', payload)

        if (response.success) {
            successMessage.value = `Traduction "${statusTranslation.value.valeur}" enregistrée avec succès.`
            
            // Ajouter à l'historique local
            savedTranslations.value.unshift({
                id: Date.now(),
                status: selectedStatusName.value,
                langue: statusTranslation.value.langue,
                valeur: statusTranslation.value.valeur,
                date: new Date().toISOString().split('T')[0]
            })
            
            statusTranslation.value = new TicketStatusTranslation()
            
            setTimeout(() => {
                successMessage.value = ''
            }, 4000)
            return
        }

        errorMessage.value = response.error || "Échec de l'enregistrement."
    } catch (err) {
        errorMessage.value = err.message || 'Erreur de communication avec le serveur.'
    } finally {
        submitting.value = false
    }
}

const removeTranslation = (id) => {
    savedTranslations.value = savedTranslations.value.filter(t => t.id !== id)
}

onMounted(loadLanguages)
</script>

<template>
    <BaseLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <span class="eyebrow">Traductions</span>
            <h1 class="page-title">Langues de statut</h1>
            <p class="page-subtitle">
                Gérez les traductions des libellés de statuts de tickets.
            </p>
        </div>

        <div class="row g-4">
            <!-- Colonne gauche : Formulaire -->
            <div class="col-12 col-lg-6">
                <div class="card-custom">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0">
                            <i class="bi bi-translate"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Nouvelle traduction</h2>
                            <p class="text-muted-custom small mb-0">Associez une traduction à un statut</p>
                        </div>
                    </div>

                    <!-- Formulaire -->
                    <div class="d-flex flex-column gap-3">
                        <!-- Statut -->
                        <div>
                            <BaseSelect
                                label="Statut de ticket"
                                placeholder="Sélectionner un statut..."
                                :options="statusOptions"
                                v-model="statusTranslation.id"
                                required
                            />
                        </div>

                        <!-- Langue -->
                        <div>
                            <BaseSelect
                                label="Langue"
                                placeholder="Saisir ou sélectionner une langue..."
                                :options="languageOptions"
                                autocomplete
                                allowCustom
                                searchable
                                v-model="statusTranslation.langue"
                                :loading="loadingLanguages"
                            />
                        </div>

                        <!-- Valeur -->
                        <div>
                            <BaseInput
                                label="Traduction"
                                placeholder="Exemple : Réglé, New, Resolved..."
                                v-model="statusTranslation.valeur"
                                required
                                icon="bi bi-pencil"
                            />
                        </div>

                        <!-- Aperçu -->
                        <transition v-if="isFormValid" name="preview-fade">
                            <div class="translation-preview">
                                <span class="preview-label">Aperçu</span>
                                <div class="preview-content">
                                    <div class="preview-original">
                                        <span class="preview-tag">Original</span>
                                        <span class="preview-text">{{ selectedStatusName }}</span>
                                    </div>
                                    <i class="bi bi-arrow-right preview-arrow"></i>
                                    <div class="preview-translated">
                                        <span class="preview-tag">{{ statusTranslation.langue?.toUpperCase() }}</span>
                                        <span class="preview-text translated">{{ statusTranslation.valeur || '...' }}</span>
                                    </div>
                                </div>
                            </div>
                        </transition>

                        <!-- Placeholder -->
                        <div v-else class="preview-placeholder">
                            <i class="bi bi-eye"></i>
                            <span>Remplissez tous les champs pour voir l'aperçu</span>
                        </div>

                        <!-- Bouton -->
                        <div class="mt-2">
                            <BaseButton
                                label="Enregistrer la traduction"
                                variant="primary"
                                size="lg"
                                :disabled="!isFormValid || submitting || loadingLanguages"
                                :loading="submitting"
                                @click="submitTranslation"
                                icon="bi bi-check-lg"
                                class="w-100"
                            />
                        </div>

                        <!-- Messages -->
                        <transition name="alert-fade">
                            <div v-if="errorMessage" class="alert-custom alert-danger">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                                <span>{{ errorMessage }}</span>
                            </div>
                        </transition>
                        <transition name="alert-fade">
                            <div v-if="successMessage" class="alert-custom alert-success">
                                <i class="bi bi-check-circle-fill"></i>
                                <span>{{ successMessage }}</span>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>

            <!-- Colonne droite : Traductions sauvegardées -->
            <div class="col-12 col-lg-6">
                <div class="card-custom h-100">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0">
                            <i class="bi bi-bookmark-check"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Traductions enregistrées</h2>
                            <p class="text-muted-custom small mb-0">{{ savedTranslations.length }} traduction(s)</p>
                        </div>
                    </div>

                    <BaseTable 
                        :items="savedTranslations" 
                        :columns="translationsColumns"
                        :pageSize="5"
                        searchable
                        empty-message="Aucune traduction enregistrée"
                    >
                        <template #cell-actions="{ item }">
                            <BaseButton 
                                icon="bi bi-trash" 
                                variant="ghost" 
                                size="sm" 
                                @click="removeTranslation(item.id)"
                                title="Supprimer"
                            />
                        </template>
                    </BaseTable>
                </div>
            </div>
        </div>
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
    padding: 28px;
    height: 100%;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.01em;
    margin: 0;
}

.stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--pill-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    color: var(--brand-green);
    flex-shrink: 0;
}

/* ============ PREVIEW ============ */
.translation-preview {
    background: var(--bg);
    border-radius: 14px;
    padding: 1.25rem;
    border: 1px solid var(--border-color);
}

.preview-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    display: block;
    margin-bottom: 0.75rem;
}

.preview-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.preview-original,
.preview-translated {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    background: var(--card-bg);
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid var(--border-color);
}

.preview-tag {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--brand-green);
}

.preview-text {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-main);
}

.preview-text.translated {
    color: var(--accent-orange);
    font-style: italic;
}

.preview-arrow {
    font-size: 1.2rem;
    color: var(--text-muted);
}

.preview-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: var(--bg);
    border-radius: 14px;
    color: var(--text-muted);
    font-size: 0.88rem;
    border: 1px dashed var(--border-color);
}

.preview-placeholder i {
    font-size: 1.1rem;
    opacity: 0.6;
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

.alert-danger {
    background: rgba(239, 68, 68, 0.08);
    color: var(--danger-color);
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
    background: rgba(16, 185, 129, 0.08);
    color: var(--success-color);
    border: 1px solid rgba(16, 185, 129, 0.2);
}

/* ============ TRANSITIONS ============ */
.preview-fade-enter-active,
.alert-fade-enter-active {
    transition: all 0.3s ease-out;
}

.preview-fade-leave-active,
.alert-fade-leave-active {
    transition: all 0.2s ease-in;
}

.preview-fade-enter-from,
.alert-fade-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}

.preview-fade-leave-to,
.alert-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .card-custom {
        padding: 20px;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .preview-content {
        flex-direction: column;
        align-items: stretch;
    }
    
    .preview-arrow {
        transform: rotate(90deg);
        align-self: center;
    }
    
    .preview-original,
    .preview-translated {
        text-align: center;
    }
}
</style>