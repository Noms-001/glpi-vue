<script setup>
//@ts-nocheck
import { onMounted, ref, computed } from 'vue'
import { useToast } from '../../composables/useToast'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import DataManager from '../../utils/DataManager'
import { ticketService } from '../../services/BaseService'
import { handleMouvementTicket } from '../../utils/TicketManager'

const { showError, showSuccess } = useToast()

const csvFile = ref(/** @type {File | null} */ (null))
const ticket = ref(null)
const mouvement = ref(null)
const mode = ref(null)
const valeur = ref(null)
const loading = ref(false)
const importProgress = ref(0)
const showResetModal = ref(false)
const importLogs = ref([])

const dataManager = new DataManager()
const tickets = ref([])

// ----- Options pour les selects -----
const mouvementOptions = [
    { label: 'Ouverture', value: 'OPEN', icon: 'bi bi-play-circle' },
    { label: 'Fermeture', value: 'CLOSE', icon: 'bi bi-stop-circle' },
    { label: 'Annulation', value: 'CANCEL', icon: 'bi bi-x-circle' }
]

const modeOptions = [
    { label: 'Mode 1 - Standard', value: 1 },
    { label: 'Mode 2 - Rapide', value: 2 },
    { label: 'Mode 3 - Avancé', value: 3 },
    { label: 'Mode 4 - Expert', value: 4 }
]

// ----- Formatter pour les tickets -----
const ticketFormatter = (t) => `#${t.externalid} - ${t.name || 'Sans titre'}`

// ----- État du formulaire -----
const isFormValid = computed(() => {
    if (!ticket.value || !mouvement.value) return false
    if (mouvement.value === 'OPEN' && !mode.value) return false
    return true
})

const showModeSelect = computed(() => mouvement.value === 'OPEN')

// ----- Import CSV -----
const importCost = async () => {
    if (!csvFile.value) {
        showError('Aucun fichier sélectionné')
        return
    }

    loading.value = true
    importProgress.value = 0
    importLogs.value = [`📄 Analyse du fichier : ${csvFile.value.name}`]

    try {
        const data = await dataManager.parseCsv(csvFile.value)
        importLogs.value.push(`✅ ${data.length} lignes parsées avec succès`)
        importProgress.value = 50
        
        await dataManager.importMouvement(data, tickets.value)
        importProgress.value = 100
        importLogs.value.push('✅ Importation terminée avec succès')
        
        showSuccess('Importation des mouvements terminée')
    } catch (error) {
        importLogs.value.push(`❌ Erreur : ${error.message}`)
        showError(error.message || 'Erreur lors de l\'importation')
    } finally {
        loading.value = false
        setTimeout(() => {
            importProgress.value = 0
            importLogs.value = []
        }, 3000)
    }
}

// ----- Reset -----
const confirmReset = () => {
    showResetModal.value = true
}

const resetCost = async () => {
    loading.value = true
    showResetModal.value = false
    
    try {
        await dataManager.resetItemCost()
        showSuccess('Réinitialisation des coûts terminée')
    } catch (error) {
        showError(error.message || 'Erreur lors de la réinitialisation')
    } finally {
        loading.value = false
    }
}

// ----- Saisie manuelle -----
const handleSaisie = async () => {
    if (!isFormValid.value) {
        showError('Veuillez remplir tous les champs requis')
        return
    }

    loading.value = true

    try {
        await handleMouvementTicket(
            ticket.value, 
            mouvement.value, 
            valeur.value, 
            mode.value
        )
        
        const ticketInfo = tickets.value.find(t => t.id === ticket.value)
        showSuccess(`Mouvement enregistré pour le ticket #${ticketInfo?.externalid || ticket.value}`)
        
        // Réinitialiser le formulaire
        ticket.value = null
        mouvement.value = null
        valeur.value = null
        mode.value = null
    } catch (error) {
        showError(error.message || 'Erreur lors de l\'enregistrement du mouvement')
    } finally {
        loading.value = false
    }
}

// ----- Chargement initial -----
onMounted(async () => {
    try {
        loading.value = true
        tickets.value = await ticketService.getAll()
    } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error)
        showError('Erreur lors du chargement des tickets')
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <BaseLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <span class="eyebrow">Mouvements</span>
            <h1 class="page-title">Import de mouvements</h1>
            <p class="page-subtitle">
                Importez des mouvements par fichier CSV ou saisissez-les manuellement.
            </p>
        </div>

        <div class="row g-4">
            <!-- Colonne gauche : Saisie manuelle -->
            <div class="col-12 col-lg-6">
                <div class="card-custom h-100">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0">
                            <i class="bi bi-pencil-square"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Saisie manuelle</h2>
                            <p class="text-muted-custom small mb-0">Enregistrer un mouvement unitaire</p>
                        </div>
                    </div>

                    <div class="d-flex flex-column gap-3">
                        <!-- Sélection du ticket -->
                        <div>
                            <BaseSelect 
                                v-model="ticket" 
                                label="Ticket de référence" 
                                :options="tickets" 
                                optionValue="id"
                                :optionFormatter="ticketFormatter"
                                placeholder="Rechercher un ticket..."
                                autocomplete
                                searchable
                                :loading="loading"
                            />
                        </div>

                        <!-- Type de mouvement -->
                        <div>
                            <BaseSelect 
                                v-model="mouvement" 
                                label="Type de mouvement" 
                                :options="mouvementOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Sélectionner un mouvement..."
                            />
                        </div>

                        <!-- Mode (conditionnel) -->
                        <transition name="slide-fade">
                            <div v-if="showModeSelect">
                                <BaseSelect 
                                    v-model="mode" 
                                    label="Mode" 
                                    :options="modeOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Sélectionner un mode..."
                                />
                            </div>
                        </transition>

                        <!-- Valeur -->
                        <div>
                            <BaseInput 
                                v-model="valeur" 
                                type="number" 
                                label="Valeur" 
                                placeholder="Saisir une valeur..."
                                icon="bi bi-cash"
                            />
                        </div>

                        <!-- Bouton d'action -->
                        <div class="mt-2">
                            <BaseButton 
                                label="Enregistrer le mouvement" 
                                variant="primary" 
                                @click="handleSaisie"
                                :loading="loading"
                                :disabled="!isFormValid"
                                icon="bi bi-check-lg"
                                size="lg"
                                class="w-100"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Colonne droite : Import CSV -->
            <div class="col-12 col-lg-6">
                <div class="card-custom h-100">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0">
                            <i class="bi bi-file-earmark-spreadsheet"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Import CSV</h2>
                            <p class="text-muted-custom small mb-0">Importez un fichier de mouvements</p>
                        </div>
                    </div>

                    <div class="d-flex flex-column gap-3">
                        <!-- Upload fichier -->
                        <div>
                            <BaseInput 
                                v-model="csvFile" 
                                type="file" 
                                label="Fichier CSV" 
                                accept=".csv"
                                placeholder="Sélectionner un fichier CSV..."
                            />
                        </div>

                        <!-- Barre de progression -->
                        <transition name="slide-fade">
                            <div v-if="importProgress > 0" class="import-progress">
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="small fw-semibold">Progression</span>
                                    <span class="small fw-bold">{{ importProgress }}%</span>
                                </div>
                                <div class="progress-track">
                                    <div 
                                        class="progress-fill" 
                                        :class="{ 'progress-complete': importProgress === 100 }"
                                        :style="{ width: importProgress + '%' }"
                                    ></div>
                                </div>
                            </div>
                        </transition>

                        <!-- Logs -->
                        <transition name="slide-fade">
                            <div v-if="importLogs.length > 0" class="import-logs">
                                <div 
                                    v-for="(log, index) in importLogs" 
                                    :key="index" 
                                    class="log-entry"
                                    :class="{
                                        'log-success': log.includes('✅'),
                                        'log-error': log.includes('❌'),
                                        'log-info': log.includes('📄')
                                    }"
                                >
                                    {{ log }}
                                </div>
                            </div>
                        </transition>

                        <!-- Boutons d'action -->
                        <div class="d-flex gap-3 mt-2">
                            <BaseButton 
                                label="Importer" 
                                variant="primary" 
                                :disabled="!csvFile || loading"
                                @click="importCost"
                                :loading="loading"
                                icon="bi bi-upload"
                                class="flex-fill"
                            />
                            <BaseButton 
                                label="Réinitialiser" 
                                variant="danger" 
                                @click="confirmReset"
                                :loading="loading"
                                icon="bi bi-arrow-repeat"
                                outline
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de confirmation reset -->
        <BaseModal v-model="showResetModal" title="Confirmer la réinitialisation" size="sm">
            <div class="text-center py-3">
                <div class="warning-icon-large mb-3">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <p class="mb-2 fw-semibold">Réinitialiser tous les coûts ?</p>
                <p class="text-muted-custom small mb-0">
                    Cette action supprimera définitivement tous les coûts des éléments.
                    Cette opération est irréversible.
                </p>
            </div>
            <template #footer>
                <BaseButton label="Annuler" variant="outline-secondary" @click="showResetModal = false" />
                <BaseButton label="Réinitialiser" variant="danger" @click="resetCost" icon="bi bi-exclamation-triangle" />
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
    padding: 28px;
    transition: box-shadow 0.2s ease;
}

.card-custom:hover {
    box-shadow: var(--shadow-md);
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

/* ============ IMPORT PROGRESS ============ */
.import-progress {
    background: var(--bg);
    border-radius: 10px;
    padding: 1rem;
}

.progress-track {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: var(--pill-bg);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--brand-green), #1a5c53);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 12px rgba(14, 59, 54, 0.2);
}

.progress-complete {
    background: linear-gradient(90deg, #10b981, #059669);
    animation: progress-pulse 2s ease-in-out infinite;
}

/* ============ IMPORT LOGS ============ */
.import-logs {
    background: var(--bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 0.75rem;
    max-height: 150px;
    overflow-y: auto;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.8rem;
}

.log-entry {
    padding: 0.35rem 0;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-muted);
    line-height: 1.5;
}

.log-entry:last-child {
    border-bottom: none;
}

.log-success {
    color: var(--success-color);
}

.log-error {
    color: var(--danger-color);
}

.log-info {
    color: #74c0fc;
}

/* Scrollbar logs */
.import-logs::-webkit-scrollbar {
    width: 5px;
}

.import-logs::-webkit-scrollbar-track {
    background: transparent;
}

.import-logs::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 999px;
}

/* ============ WARNING ICON ============ */
.warning-icon-large {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    margin: 0 auto;
}

/* ============ TRANSITIONS ============ */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
}

/* ============ ANIMATIONS ============ */
@keyframes progress-pulse {
    0%, 100% {
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
    }
    50% {
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
    }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .card-custom {
        padding: 20px;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .section-title {
        font-size: 1.1rem;
    }
    
    .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
    }
}
</style>