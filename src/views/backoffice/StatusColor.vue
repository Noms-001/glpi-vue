<script setup>
// @ts-nocheck

import { ref, computed } from 'vue'
import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import { post } from '../../api/backend-client.js'
import { ticketStates } from '../../utils/TicketManager.js'
import TicketStatusColor from '../../models/tickets/TicketStatutsColor.js'

const statusColor = ref(new TicketStatusColor())
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const statusOptions = Array.from(ticketStates.values()).map((state) => ({
    value: state.id,
    label: state.name
}))

// Historique des couleurs sauvegardées (simulé)
const savedColors = ref([
    { id: 1, name: 'Nouveau', color: '#3B82F6' },
    { id: 2, name: 'En cours', color: '#F59E0B' },
    { id: 3, name: 'Résolu', color: '#10B981' },
    { id: 4, name: 'Fermé', color: '#6B7280' }
])

// Convertit une couleur hexadécimale en luminance relative
function getContrastColor(hexColor) {
    if (!hexColor) return '#212529'

    let hex = hexColor.replace('#', '')
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Convertit hex en RGB pour l'affichage
function hexToRgb(hex) {
    if (!hex) return null
    hex = hex.replace('#', '')
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
    }
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgb(${r}, ${g}, ${b})`
}

// Aperçu du statut sélectionné
const selectedStatusLabel = computed(() => {
    const found = statusOptions.find(opt => opt.value === statusColor.value.id)
    return found ? found.label : 'Aucun statut sélectionné'
})

const isFormValid = computed(() => {
    return statusColor.value.id && statusColor.value.couleur
})

const submitColor = async () => {
    if (!statusColor.value.id || !statusColor.value.couleur) {
        errorMessage.value = 'Veuillez compléter tous les champs.'
        successMessage.value = ''
        return
    }

    submitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const payload = {
            id: statusColor.value.id,
            couleur: statusColor.value.couleur
        }

        const response = await post('/status/color', payload)

        if (response.success) {
            successMessage.value = 'Couleur de statut enregistrée avec succès.'
            
            // Ajouter à l'historique local
            const existingIndex = savedColors.value.findIndex(c => c.id === statusColor.value.id)
            if (existingIndex > -1) {
                savedColors.value[existingIndex].color = statusColor.value.couleur
            } else {
                savedColors.value.push({
                    id: statusColor.value.id,
                    name: selectedStatusLabel.value,
                    color: statusColor.value.couleur
                })
            }
            
            statusColor.value = new TicketStatusColor()
            
            // Effacer le message après 3 secondes
            setTimeout(() => {
                successMessage.value = ''
            }, 3000)
            return
        }

        errorMessage.value = response.error || "Échec de l'enregistrement."
    } catch (err) {
        errorMessage.value = err.message || 'Erreur de communication avec le serveur.'
    } finally {
        submitting.value = false
    }
}

const removeColor = (id) => {
    savedColors.value = savedColors.value.filter(c => c.id !== id)
}
</script>

<template>
    <BaseLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <span class="eyebrow">Personnalisation</span>
            <h1 class="page-title">Couleurs de statut</h1>
            <p class="page-subtitle">
                Associez une couleur personnalisée à chaque statut de ticket.
            </p>
        </div>

        <div class="row g-4">
            <!-- Colonne gauche : Formulaire -->
            <div class="col-12 col-lg-7">
                <div class="card-custom">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0">
                            <i class="bi bi-palette2"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Nouvelle association</h2>
                            <p class="text-muted-custom small mb-0">Choisissez un statut et sa couleur</p>
                        </div>
                    </div>

                    <!-- Formulaire -->
                    <div class="row g-3 mb-4">
                        <div class="col-md-7">
                            <BaseSelect 
                                label="Statut de ticket" 
                                placeholder="Sélectionner un statut..." 
                                :options="statusOptions"
                                v-model="statusColor.id" 
                                required 
                            />
                        </div>
                        <div class="col-md-5">
                            <label class="form-label-custom">
                                <i class="bi bi-eyedropper me-2"></i>Couleur
                            </label>
                            <div class="color-input-wrapper">
                                <input 
                                    type="color" 
                                    v-model="statusColor.couleur"
                                    class="color-picker-input"
                                />
                                <span class="color-hex-code">{{ statusColor.couleur || '#000000' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Zone d'aperçu -->
                    <transition v-if="isFormValid" name="preview-fade">
                        <div class="preview-section">
                            <span class="preview-label">Aperçu en temps réel</span>
                            <div class="preview-content">
                                <div 
                                    class="preview-badge"
                                    :style="{ 
                                        backgroundColor: statusColor.couleur, 
                                        color: getContrastColor(statusColor.couleur) 
                                    }"
                                >
                                    {{ selectedStatusLabel }}
                                </div>
                                <div class="preview-colors-info">
                                    <div class="color-info-item">
                                        <span class="color-info-label">HEX</span>
                                        <span class="color-info-value">{{ statusColor.couleur }}</span>
                                    </div>
                                    <div class="color-info-item">
                                        <span class="color-info-label">RGB</span>
                                        <span class="color-info-value">{{ hexToRgb(statusColor.couleur) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>

                    <!-- Message placeholder -->
                    <div v-else class="preview-placeholder">
                        <i class="bi bi-eye"></i>
                        <span>Sélectionnez un statut et une couleur pour voir l'aperçu</span>
                    </div>

                    <!-- Actions -->
                    <div class="d-flex justify-content-end mt-4">
                        <BaseButton 
                            label="Enregistrer la couleur" 
                            variant="primary" 
                            size="lg"
                            :disabled="!isFormValid || submitting" 
                            :loading="submitting"
                            @click="submitColor" 
                            icon="bi bi-check-lg"
                        />
                    </div>

                    <!-- Messages -->
                    <transition name="alert-fade">
                        <div v-if="errorMessage" class="alert-custom alert-danger mt-3">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                            <span>{{ errorMessage }}</span>
                        </div>
                    </transition>
                    <transition name="alert-fade">
                        <div v-if="successMessage" class="alert-custom alert-success mt-3">
                            <i class="bi bi-check-circle-fill"></i>
                            <span>{{ successMessage }}</span>
                        </div>
                    </transition>
                </div>
            </div>

            <!-- Colonne droite : Couleurs sauvegardées -->
            <div class="col-12 col-lg-5">
                <div class="card-custom h-100">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0">
                            <i class="bi bi-bookmark-check"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Couleurs enregistrées</h2>
                            <p class="text-muted-custom small mb-0">{{ savedColors.length }} statut(s) configuré(s)</p>
                        </div>
                    </div>

                    <div v-if="savedColors.length === 0" class="empty-state-small">
                        <i class="bi bi-inbox"></i>
                        <span>Aucune couleur configurée</span>
                    </div>

                    <div v-else class="saved-colors-list">
                        <div 
                            v-for="saved in savedColors" 
                            :key="saved.id"
                            class="saved-color-item"
                        >
                            <div class="saved-color-left">
                                <div 
                                    class="saved-color-dot"
                                    :style="{ backgroundColor: saved.color }"
                                ></div>
                                <div>
                                    <div class="saved-color-name">{{ saved.name }}</div>
                                    <div class="saved-color-hex">{{ saved.color }}</div>
                                </div>
                            </div>
                            <button 
                                class="saved-color-remove"
                                @click="removeColor(saved.id)"
                                title="Supprimer"
                            >
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
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

/* ============ FORM ============ */
.form-label-custom {
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--text-main);
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.color-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: var(--bg);
    border: 1.5px solid var(--border-color);
    border-radius: 10px;
    transition: all 0.2s ease;
}

.color-input-wrapper:focus-within {
    border-color: var(--brand-green);
    box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.1);
}

.color-picker-input {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    padding: 2px;
    background: transparent;
}

.color-picker-input::-webkit-color-swatch-wrapper {
    padding: 0;
}

.color-picker-input::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
}

.color-hex-code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: 0.03em;
}

/* ============ PREVIEW ============ */
.preview-section {
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
    margin-bottom: 1rem;
}

.preview-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.preview-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1.5rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: -0.01em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-colors-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.color-info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.color-info-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    background: var(--pill-bg);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    letter-spacing: 0.05em;
}

.color-info-value {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-main);
}

.preview-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    background: var(--bg);
    border-radius: 14px;
    color: var(--text-muted);
    font-size: 0.88rem;
    border: 1px dashed var(--border-color);
}

.preview-placeholder i {
    font-size: 1.2rem;
    opacity: 0.6;
}

/* ============ ALERTS ============ */
.alert-custom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    font-size: 0.88rem;
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

/* ============ SAVED COLORS ============ */
.saved-colors-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.saved-color-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem;
    background: var(--bg);
    border-radius: 12px;
    transition: all 0.2s ease;
}

.saved-color-item:hover {
    background: var(--pill-bg);
}

.saved-color-left {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}

.saved-color-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.saved-color-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-main);
}

.saved-color-hex {
    font-size: 0.78rem;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: var(--text-muted);
}

.saved-color-remove {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 0.8rem;
}

.saved-color-remove:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.empty-state-small {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: var(--text-muted);
    font-size: 0.88rem;
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
        align-items: flex-start;
    }
    
    .color-input-wrapper {
        flex-direction: column;
        align-items: stretch;
    }
    
    .color-hex-code {
        text-align: center;
    }
}
</style>