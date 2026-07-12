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
    importLogs.value = ['🚀 Lancement de l\'import de données...']
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
        <!-- Page Header -->
        <div class="mb-4">
            <h1 class="page-title">Import & Reset</h1>
            <p class="page-subtitle">Chargez des fichiers CSV et une archive ZIP d'images pour l'import.</p>
        </div>

        <!-- Deux sections côte à côte -->
        <div class="row g-4">
            <!-- Section Import -->
            <div class="col-12 col-lg-6">
                <div class="card-custom h-100 d-flex flex-column">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0">
                            <i class="bi bi-cloud-arrow-up-fill"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Import de données</h2>
                        </div>
                    </div>
                    
                    <p class="text-muted-custom mb-4">Sélectionnez vos fichiers CSV et l'archive ZIP contenant les images.</p>

                    <div class="mb-4">
                        <label class="form-label-custom mb-2">
                            <i class="bi bi-file-earmark-spreadsheet me-2"></i>Fichiers CSV
                        </label>
                        <div class="file-upload-area">
                            <BaseInput v-model="csvFiles" type="file" accept=".csv" multiple :customClass="'w-100'" />
                        </div>
                        <div class="file-count-badge mt-2" v-if="csvFiles.length > 0">
                            <i class="bi bi-check-circle-fill"></i>
                            {{ csvFiles.length }} fichier(s) CSV sélectionné(s)
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label-custom mb-2">
                            <i class="bi bi-file-zip me-2"></i>Archive ZIP (images)
                        </label>
                        <div class="file-upload-area">
                            <BaseInput v-model="imageZip" type="file" accept=".zip" :customClass="'w-100'" />
                        </div>
                        <div class="file-count-badge zip mt-2" v-if="imageZip">
                            <i class="bi bi-check-circle-fill"></i>
                            {{ imageZip.name }}
                        </div>
                    </div>

                    <div class="mt-auto d-flex flex-wrap gap-3">
                        <BaseButton label="Importer les données" variant="primary"
                            :disabled="csvFiles.length === 0 && !imageZip" @click="openImportModal">
                            <i class="bi bi-upload me-2"></i> Importer les données
                        </BaseButton>
                        <BaseButton label="Effacer la sélection" variant="outline-secondary" @click="clearSelection">
                            <i class="bi bi-x-circle me-2"></i> Effacer la sélection
                        </BaseButton>
                    </div>
                </div>
            </div>

            <!-- Section Reset -->
            <div class="col-12 col-lg-6">
                <div class="card-custom h-100 d-flex flex-column">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="stat-icon mb-0" style="color: var(--danger-color);">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <div>
                            <h2 class="section-title mb-0">Réinitialisation</h2>
                        </div>
                    </div>
                    
                    <p class="text-muted-custom mb-4">Remettez à zéro toutes les données du backoffice. Cette action est irréversible.</p>

                    <div class="warning-card mb-4">
                        <div class="d-flex gap-3">
                            <div class="warning-icon">
                                <i class="bi bi-shield-exclamation"></i>
                            </div>
                            <div>
                                <strong>Attention</strong>
                                <p class="mb-0 mt-1">Cette action supprimera définitivement toutes les données. Assurez-vous d'avoir une sauvegarde avant de continuer.</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-auto">
                        <BaseButton label="Réinitialiser toutes les données" variant="danger" size="lg"
                            @click="openResetModal" class="w-100">
                            <i class="bi bi-arrow-repeat me-2"></i> Réinitialiser toutes les données
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Import -->
        <BaseModal title="Import de données" v-model="importModalOpen" size="lg">
            <div class="modal-header-custom" v-if="importModalOpen">
                <div class="modal-timer">
                    <i class="bi bi-hourglass-split"></i>
                    <span>Temps écoulé : <strong>{{ formatTime(importElapsedSeconds) }}</strong></span>
                </div>
            </div>
            <BaseProgressBar label="Import en cours" :value="importProgress" variant="primary" :logs="importLogs" />
            <template #footer>
                <BaseButton label="Fermer" variant="outline-secondary" @click="importModalOpen = false" />
            </template>
        </BaseModal>

        <!-- Modal Reset -->
        <BaseModal title="Réinitialisation" v-model="resetModalOpen" size="lg">
            <div class="modal-header-custom" v-if="resetModalOpen">
                <div class="modal-timer danger">
                    <i class="bi bi-hourglass-split"></i>
                    <span>Temps écoulé : <strong>{{ formatTime(resetElapsedSeconds) }}</strong></span>
                </div>
            </div>
            <BaseProgressBar label="Réinitialisation en cours" :value="resetProgress" variant="danger"
                :logs="resetLogs" />
            <template #footer>
                <BaseButton label="Fermer" variant="outline-secondary" @click="resetModalOpen = false" />
            </template>
        </BaseModal>
    </BaseLayout>
</template>

<style scoped>
/* Page Header */
.page-title {
    font-size: 1.7rem;
    margin-bottom: 2px;
    font-weight: 800;
    color: var(--text-main);
}

.page-subtitle {
    color: var(--text-muted);
    font-size: 0.92rem;
    font-weight: 500;
    margin: 0;
}

/* Cards */
.card-custom {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 28px;
    transition: box-shadow .2s ease;
}

.card-custom:hover {
    box-shadow: var(--shadow-md);
}

/* Section Title */
.section-title {
    font-size: 1.35rem;
    font-weight: 800;
    margin-bottom: 2px;
    color: var(--text-main);
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

/* Form Labels */
.form-label-custom {
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--text-main);
    display: flex;
    align-items: center;
}

.form-label-custom i {
    color: var(--text-muted);
}

/* File Upload Area */
.file-upload-area {
    background: var(--bg);
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 16px;
    transition: border-color .2s ease, background .2s ease;
}

.file-upload-area:hover {
    border-color: var(--brand-green);
    background: var(--brand-green-light);
}

/* File Count Badge */
.file-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    background: var(--brand-green-light);
    color: var(--brand-green);
    font-size: 0.8rem;
    font-weight: 600;
}

.file-count-badge.zip {
    background: rgba(244, 169, 80, 0.12);
    color: var(--accent-orange);
}

.file-count-badge i {
    font-size: 0.75rem;
}

/* Warning Card */
.warning-card {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 14px;
    padding: 18px;
    color: var(--danger-color);
}

.warning-card strong {
    font-size: 0.95rem;
    font-weight: 700;
}

.warning-card p {
    font-size: 0.85rem;
    color: var(--text-muted);
}

.warning-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(239, 68, 68, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
}

/* Modal Timer */
.modal-header-custom {
    margin-bottom: 1rem;
}

.modal-timer {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 999px;
    background: var(--brand-green-light);
    color: var(--brand-green);
    font-size: 0.85rem;
    font-weight: 500;
}

.modal-timer.danger {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.modal-timer i {
    font-size: 0.95rem;
}

.modal-timer strong {
    font-weight: 700;
}

/* Logs Container */
:deep(.logs-container) {
    max-height: 400px;
    overflow-y: auto;
    background: var(--bg);
    border-radius: 12px;
    padding: 1rem;
    font-family: var(--font-family);
    font-size: 0.8125rem;
    line-height: 1.6;
    border: 1px solid var(--border-color);
}

:deep(.logs-container .log-entry) {
    padding: 4px 0;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-main);
    white-space: pre-wrap;
    word-break: break-word;
}

:deep(.logs-container .log-entry:last-child) {
    border-bottom: none;
}

:deep(.logs-container .log-entry:hover) {
    background: var(--pill-bg);
    border-radius: 4px;
    padding-left: 8px;
    transition: all 0.2s ease;
}

/* Scrollbar */
:deep(.logs-container::-webkit-scrollbar) {
    width: 6px;
}

:deep(.logs-container::-webkit-scrollbar-track) {
    background: transparent;
}

:deep(.logs-container::-webkit-scrollbar-thumb) {
    background: var(--border-color);
    border-radius: 999px;
}

:deep(.logs-container::-webkit-scrollbar-thumb:hover) {
    background: var(--text-muted);
}

/* Progress Bar */
:deep(.progress) {
    height: 8px;
    border-radius: 999px;
    background: var(--pill-bg);
    overflow: hidden;
    margin-bottom: 1rem;
}

:deep(.progress-bar) {
    border-radius: 999px;
    transition: width 0.4s ease;
}

/* Buttons */
.btn-outline-secondary {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-main);
}

.btn-outline-secondary:hover {
    background: var(--pill-bg);
    border-color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
    .card-custom {
        padding: 20px;
    }
    
    .section-title {
        font-size: 1.2rem;
    }
    
    .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
    }
    
    :deep(.logs-container) {
        max-height: 300px;
        font-size: 0.75rem;
    }
    
    .warning-card {
        padding: 14px;
    }
}
</style>