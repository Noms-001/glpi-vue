<script setup>
// @ts-nocheck

import { ref, computed } from 'vue'
import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
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

// Convertit une couleur hexadécimale (ex: "#RRGGBB" ou "#RGB") en luminance relative
function getContrastColor(hexColor) {
    if (!hexColor) return '#212529' // valeur par défaut (text-dark)

    let hex = hexColor.replace('#', '')
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    // Formule de luminance relative (WCAG)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Aperçu du statut sélectionné
const selectedStatusLabel = computed(() => {
    const found = statusOptions.find(opt => opt.value === statusColor.value.id)
    return found ? found.label : 'Aucun statut sélectionné'
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
            statusColor.value = new TicketStatusColor()
            return
        }

        errorMessage.value = response.error || 'Échec de l’enregistrement.'
    } catch (err) {
        errorMessage.value = err.message || 'Erreur de communication avec le serveur.'
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <BaseLayout>
        <section class="section">
            <header class="page-header">
                <span class="eyebrow">Backoffice</span>
                <h1 class="page-title">Ajouter une couleur de statut</h1>
                <p class="page-subtitle">
                    Associez une couleur à un statut de ticket GLPI.
                </p>
            </header>

            <div class="section-panel">
                <div class="form-grid">
                    <div class="form-field">
                        <BaseSelect 
                            label="Statut de ticket" 
                            placeholder="Sélectionner un statut" 
                            :options="statusOptions"
                            v-model="statusColor.id" 
                            required 
                            custom-class="w-100"
                        />
                    </div>
                    <div class="form-field">
                        <BaseInput 
                            label="Couleur" 
                            type="color" 
                            placeholder="Choisir une couleur"
                            v-model="statusColor.couleur" 
                            required 
                            custom-class="w-100 color-picker-field"
                        />
                    </div>
                </div>

                <!-- Zone d'aperçu avec texte adaptatif -->
                <div class="preview-card" v-if="statusColor.id && statusColor.couleur">
                    <div class="preview-label">Aperçu</div>
                    <div 
                        class="preview-badge" 
                        :style="{ 
                            backgroundColor: statusColor.couleur, 
                            color: getContrastColor(statusColor.couleur) 
                        }"
                    >
                        {{ selectedStatusLabel }}
                    </div>
                    <div class="preview-hex">{{ statusColor.couleur }}</div>
                </div>
                <div class="preview-card preview-placeholder" v-else>
                    <div class="preview-label">Aperçu</div>
                    <div class="preview-placeholder-text">
                        Choisissez un statut et une couleur pour voir l’aperçu.
                    </div>
                </div>

                <div class="form-actions">
                    <BaseButton 
                        label="Enregistrer la couleur" 
                        variant="primary" 
                        size="md" 
                        :disabled="submitting" 
                        :loading="submitting"
                        type="button" 
                        @click="submitColor" 
                        custom-class="submit-btn"
                    />
                </div>

                <transition name="fade">
                    <div v-if="errorMessage" class="form-alert form-alert-danger">
                        <span class="alert-icon">⚠️</span>
                        {{ errorMessage }}
                    </div>
                </transition>
                <transition name="fade">
                    <div v-if="successMessage" class="form-alert form-alert-success">
                        <span class="alert-icon">✓</span>
                        {{ successMessage }}
                    </div>
                </transition>
            </div>
        </section>
    </BaseLayout>
</template>

<style scoped>
.section-panel {
    background: var(--surface-color, #ffffff);
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.02);
    padding: 2rem;
    margin-top: 2rem;
    max-width: 780px;
    width: 80%;
    transition: all 0.2s ease;
}

.section-panel:hover {
    box-shadow: 0 20px 35px rgba(0, 0, 0, 0.08);
}

.form-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.form-field {
    width: 100%;
}

:deep(.color-picker-field input[type="color"]) {
    height: 48px;
    padding: 4px;
    cursor: pointer;
}

.preview-card {
    background: var(--bg-color) !important;
    border-radius: 20px;
    padding: 1.25rem;
    margin: 1.5rem 0;
    border: 1px solid var(--border-color);
    transition: all 0.2s;
}

.preview-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
}

.preview-badge {
    display: inline-block;
    padding: 0.5rem 1.25rem;
    border-radius: 40px;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    margin-bottom: 0.75rem;
    border: 1px solid rgba(255,255,255,0.3);
    transition: color 0.1s ease;
}

.preview-hex {
    font-family: 'SF Mono', monospace;
    font-size: 0.8rem;
    color: #475569;
    background: #ffffff;
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    border: 1px solid var(--border-color);
}

.preview-placeholder {
    text-align: center;
    background: #f1f5f9;
}

.preview-placeholder-text {
    font-size: 0.85rem;
    color: #64748b;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.submit-btn {
    min-width: 180px;
    transition: transform 0.1s ease, box-shadow 0.2s;
}

.submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
}

.form-alert {
    margin-top: 1.5rem;
    padding: 1rem 1.2rem;
    border-radius: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    backdrop-filter: blur(2px);
}

.alert-icon {
    font-size: 1.2rem;
}

.form-alert-danger {
    background: #fef2f2;
    color: #b91c1c;
    border-left: 4px solid #ef4444;
}

.form-alert-success {
    background: #f0fdf4;
    color: #15803d;
    border-left: 4px solid #22c55e;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

@media (max-width: 768px) {
    .section-panel {
        width: 95%;
        padding: 1.5rem;
    }
    .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    .form-actions {
        justify-content: stretch;
    }
    .submit-btn {
        width: 100%;
    }
    .preview-badge {
        font-size: 0.85rem;
        padding: 0.4rem 1rem;
    }
}
</style>