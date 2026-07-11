<script setup>
// @ts-nocheck

import { ref, onUnmounted } from 'vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseProgressBar from '../../components/base/BaseProgressBar.vue'
import { useToast } from '../../composables/useToast'
import DataManager from '../../utils/DataManager.js'
import ImageManager from '../../utils/ImageManager.js'

const { showSuccess, showError, showInfo, showWarning } = useToast()

const importModalOpen = ref(false)
const resetModalOpen = ref(false)
const importProgress = ref(0)
const resetProgress = ref(0)
const importLogs = ref(/** @type {string[]} */([]))
const resetLogs = ref(/** @type {string[]} */([]))
const csvFiles = ref(/** @type {File[]} */([]))
const imageZip = ref(/** @type {File|null} */(null))
const isImporting = ref(false)

// Timer refs
const importElapsedSeconds = ref(0)
const resetElapsedSeconds = ref(0)
let importTimer = /** @type {ReturnType<typeof setInterval> | null} */ (null)
let resetTimer = /** @type {ReturnType<typeof setInterval> | null} */ (null)

/** @param {string} message */
const addImportLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    importLogs.value.push(`[${timestamp}] ${message}`)
    if (importLogs.value.length > 50) {
        importLogs.value.shift()
    }
}

/** @param {string} message */
const addResetLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    resetLogs.value.push(`[${timestamp}] ${message}`)
    if (resetLogs.value.length > 50) {
        resetLogs.value.shift()
    }
}

/**
 * @param {number} progress 
 */
const updateImportProgress = (progress) => {
    importProgress.value = progress
}

const startTimer = (type) => {
    if (type === 'import') {
        importElapsedSeconds.value = 0
        if (importTimer) clearInterval(importTimer)
        importTimer = setInterval(() => {
            if (importModalOpen.value) {
                importElapsedSeconds.value++
            }
        }, 1000)
    } else if (type === 'reset') {
        resetElapsedSeconds.value = 0
        if (resetTimer) clearInterval(resetTimer)
        resetTimer = setInterval(() => {
            if (resetModalOpen.value) {
                resetElapsedSeconds.value++
            }
        }, 1000)
    }
}

const stopTimer = (type) => {
    if (type === 'import' && importTimer) {
        clearInterval(importTimer)
        importTimer = null
    } else if (type === 'reset' && resetTimer) {
        clearInterval(resetTimer)
        resetTimer = null
    }
}

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const clearSelection = () => {
    csvFiles.value = []
    imageZip.value = null
    addImportLog('🗑️ Sélection effacée')
}

const openImportModal = async () => {
    if (csvFiles.value.length === 0 && !imageZip.value) {
        addImportLog('❌ Aucun fichier sélectionné')
        importModalOpen.value = true
        setTimeout(() => {
            importModalOpen.value = false
        }, 2000)
        return
    }

    if (isImporting.value) {
        addImportLog('⚠️ Un import est déjà en cours')
        return
    }

    isImporting.value = true
    importLogs.value = ['🚀 Lancement de l’import de données...']
    importProgress.value = 0
    importModalOpen.value = true
    startTimer('import')

    // Vérifier si des fichiers CSV sont présents
    if (csvFiles.value.length === 0) {
        addImportLog('❌ Aucun fichier CSV sélectionné pour l\'import')
        isImporting.value = false
        stopTimer('import')
        return
    }

    addImportLog(`📄 Fichiers CSV à importer : ${csvFiles.value.length}`)
    csvFiles.value.forEach(file => {
        addImportLog(`   - ${file.name}`)
    })

    if (imageZip.value) {
        addImportLog(`📦 Archive ZIP : ${imageZip.value.name}`)
        // TODO: Implémenter le traitement du ZIP
        addImportLog(`⚠️ Le traitement des images n'est pas encore implémenté`)
    }

    try {
        const dataManager = new DataManager()

        // Appel de la fonction import avec les callbacks de log et progression
        const result = await dataManager.import(
            csvFiles.value,
            addImportLog,
            updateImportProgress
        )

        await ImageManager.import(
            result.map,
            imageZip.value,
            addImportLog
        )

        updateImportProgress(100)

        if (result.assets.length > 0 || result.tickets.length > 0 || result.ticketCosts.length > 0) {
            showSuccess(`Import réussi : ${result.assets.length} actifs, ${result.tickets.length} tickets et ${result.ticketCosts.length} coûts`)
        } else {
            showWarning('Aucune donnée n\'a été importée')
        }

    } catch (error) {
        console.error('Erreur lors de l\'import:', error)
        addImportLog(`❌ Erreur fatale lors de l'import : ${error.message}`)
        showError(`Erreur lors de l'import : ${error.message}`)
    } finally {
        isImporting.value = false
        stopTimer('import')
    }
}

const openResetModal = async () => {
    resetLogs.value = ['🔄 Début de la réinitialisation...']
    resetProgress.value = 0
    resetModalOpen.value = true
    startTimer('reset')

    try {
        const dataManager = new DataManager()

        await dataManager.reset(
            addResetLog,
            progress => {
                resetProgress.value = progress
            }
        )

        addResetLog(`✅ Réinitialisation terminée en ${formatTime(resetElapsedSeconds.value)}`)
        showSuccess('Réinitialisation terminée')

    } catch (error) {
        console.error(error)
        addResetLog(`❌ ${error.message}`)
        showError(error.message)
    } finally {
        stopTimer('reset')
    }
}

// Cleanup timers on component unmount
onUnmounted(() => {
    if (importTimer) clearInterval(importTimer)
    if (resetTimer) clearInterval(resetTimer)
})
</script>

<template>
    <BaseLayout>
        <section class="section">
            <header class="page-header">
                <span class="eyebrow">Backoffice</span>
                <h1 class="page-title">Import & reset de données</h1>
                <p class="page-subtitle">Chargez des fichiers CSV et une archive ZIP d'images, puis lancez l'import.</p>
            </header>

            <!-- Deux sections côte à côte -->
            <div class="row g-4">
                <!-- Section Import -->
                <div class="col-12 col-md-6">
                    <div class="section-panel h-100">
                        <h2>Import de données</h2>
                        <p class="text-muted-custom mb-4">Sélectionnez vos fichiers CSV et l'archive ZIP contenant les images.
                        </p>

                        <div class="mb-4">
                            <BaseInput v-model="csvFiles" type="file" label="Fichiers CSV" accept=".csv" multiple
                                :customClass="'w-100'" />
                            <small class="text-muted-custom mt-2 d-block">
                                {{ csvFiles.length }} fichier(s) CSV sélectionné(s)
                            </small>
                        </div>

                        <div class="mb-4">
                            <BaseInput v-model="imageZip" type="file" label="Archive ZIP (images)" accept=".zip"
                                :customClass="'w-100'" />
                            <small class="text-muted-custom mt-2 d-block">
                                {{ imageZip ? imageZip.name : 'Aucun fichier ZIP sélectionné' }}
                            </small>
                        </div>

                        <div class="d-flex flex-wrap gap-3">
                            <BaseButton label="Importer les données" variant="primary"
                                :disabled="csvFiles.length === 0 && !imageZip" @click="openImportModal" />
                            <BaseButton label="Effacer la sélection" variant="secondary" @click="clearSelection" />
                        </div>
                    </div>
                </div>

                <!-- Section Reset -->
                <div class="col-12 col-md-6">
                    <div class="section-panel h-100">
                        <h2>Réinitialisation</h2>
                        <p class="text-muted-custom mb-4">Remettez à zéro toutes les données du backoffice. Cette action est
                            irréversible.</p>

                        <div class="d-flex flex-column gap-3">
                            <div class="alert alert-warning" role="alert">
                                <i class="bi bi-exclamation-triangle"></i>
                                <strong>Attention :</strong> Cette action supprimera définitivement toutes les données.
                            </div>

                            <BaseButton label="Réinitialiser toutes les données" variant="danger" size="lg"
                                @click="openResetModal" class="w-100 col-6" />
                                
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Import -->
            <BaseModal title="Import de données" v-model="importModalOpen" size="lg">
                <div class="modal-timer" v-if="importModalOpen">
                    <i class="bi bi-hourglass-split"></i>
                    Temps écoulé : {{ formatTime(importElapsedSeconds) }}
                </div>
                <BaseProgressBar label="Import en cours" :value="importProgress" variant="primary" :logs="importLogs" />
                <template #footer>
                    <BaseButton label="Fermer" variant="secondary" @click="importModalOpen = false" />
                </template>
            </BaseModal>

            <!-- Modal Reset -->
            <BaseModal title="Réinitialisation" v-model="resetModalOpen" size="lg">
                <div class="modal-timer" v-if="resetModalOpen">
                    <i class="bi bi-hourglass-split"></i>
                    Temps écoulé : {{ formatTime(resetElapsedSeconds) }}
                </div>
                <BaseProgressBar label="Réinitialisation en cours" :value="resetProgress" variant="danger"
                    :logs="resetLogs" />
                <template #footer>
                    <BaseButton label="Fermer" variant="secondary" @click="resetModalOpen = false" />
                </template>
            </BaseModal>
        </section>
    </BaseLayout>
</template>

<style scoped>
.alert {
    padding: 1rem;
    border-radius: 0.375rem;
}

.alert-warning {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
}

.alert i {
    margin-right: 0.5rem;
}

/* Timer styling */
.modal-timer {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 2px solid var(--secondary-color);
    color: var(--secondary-color);
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: fit-content;
}

.modal-timer i {
    font-size: 1rem;
}

/* Enhanced logs preview styling - targets the logs container inside BaseProgressBar */
:deep(.logs-container) {
    max-height: 400px;
    overflow-y: auto;
    background: #1e1e2e;
    border-radius: 8px;
    padding: 1rem;
    font-family: var(--font-family);
    font-size: 0.8125rem;
    line-height: 1.5;
    border: 1px solid #2d2d3d;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

:deep(.logs-container .log-entry) {
    padding: 0.25rem 0;
    border-bottom: 1px solid #2d2d3d;
    color: #e0e0e0;
    white-space: pre-wrap;
    word-break: break-word;
}

:deep(.logs-container .log-entry:last-child) {
    border-bottom: none;
}

:deep(.logs-container .log-entry:hover) {
    background: #2a2a3a;
    padding-left: 0.5rem;
    transition: all 0.2s ease;
}

/* Custom scrollbar for logs */
:deep(.logs-container::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
}

:deep(.logs-container::-webkit-scrollbar-track) {
    background: #2d2d3d;
    border-radius: 4px;
}

:deep(.logs-container::-webkit-scrollbar-thumb) {
    background: #667eea;
    border-radius: 4px;
}

:deep(.logs-container::-webkit-scrollbar-thumb:hover) {
    background: #764ba2;
}

/* Log level colors */
:deep(.log-entry[data-level="error"]),
:deep(.log-entry:contains("❌")) {
    color: #ff6b6b;
}

:deep(.log-entry:contains("✅")) {
    color: #51cf66;
}

:deep(.log-entry:contains("⚠️")) {
    color: #ffd43b;
}

:deep(.log-entry:contains("🚀")),
:deep(.log-entry:contains("📊")) {
    color: #74c0fc;
    font-weight: 600;
}

/* Progress bar enhancement */
:deep(.progress) {
    height: 1.5rem;
    border-radius: 1rem;
    background-color: #e9ecef;
    overflow: hidden;
    margin-bottom: 1rem;
}

:deep(.progress-bar) {
    border-radius: 1rem;
    transition: width 0.3s ease;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8125rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    :deep(.logs-container) {
        max-height: 300px;
        font-size: 0.75rem;
        padding: 0.75rem;
    }

    .modal-timer {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
    }
}
</style>