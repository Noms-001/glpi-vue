<script setup>
// @ts-nocheck
import { ref, computed, reactive, watch, onMounted } from 'vue'
import BaseInput from '../../../components/base/BaseInput.vue'
import BaseSelect from '../../../components/base/BaseSelect.vue'
import BaseButton from '../../../components/base/BaseButton.vue'
import BaseModal from '../../../components/base/BaseModal.vue'
import BaseTable from '../../../components/base/BaseTable.vue'
import { useToast } from '../../../composables/useToast.js'
import FrontLayout from '../../../layouts/FrontLayout.vue'
import {
    statusOptions,
    typeOptions,
    severityOptions,
    createTicket,
    addTicketItems,
    addTicketCosts,
} from '../../../utils/TicketManager.js'
import { userService } from '../../../services/BaseService.js'
import { getAllItems } from '../../../utils/ItemManager.js'

const users = ref([])
const allItems = ref([])
const selectedItems = ref([])
const itemSelection = ref('')
const showCostModal = ref(false)
const loading = ref(false)
const currentStep = ref(1)
const { showSuccess, showError } = useToast()

const currentCost = reactive({
    name: '',
    comment: '',
    actiontime: 0,
    cost_time: 0,
    cost_fixed: 0,
    cost_material: 0
})

const form = reactive({
    requesterId: undefined,
    status: 1,
    type: 1,
    priority: 3,
    urgency: 3,
    impact: 3,
    name: '',
    content: '',
    costs: []
})

const userOptions = computed(() => getUserOptions(users.value))
const itemOptions = computed(() => getItemOptions(allItems.value))

const costColumns = [
    { key: 'name', label: 'Nom', class: 'fw-semibold' },
    { key: 'comment', label: 'Commentaire' },
    { key: 'actiontime', label: 'Durée (s)', align: 'right' },
    { key: 'cost_time', label: 'Coût/h', align: 'right' },
    { key: 'cost_fixed', label: 'Fixe', align: 'right' },
    { key: 'cost_material', label: 'Matériel', align: 'right' }
]

const steps = [
    { number: 1, label: 'Informations', icon: 'bi-info-circle' },
    { number: 2, label: 'Éléments & Coûts', icon: 'bi-box-seam' },
    { number: 3, label: 'Récapitulatif', icon: 'bi-check2-all' }
]

const isStep1Valid = computed(() => {
    return form.name.trim() && form.content.trim()
})

watch(itemSelection, (value) => {
    if (!value) return
    const [type, id] = value.split('|')
    const selectedItem = allItems.value.find(item => item.type === type && String(item.id) === id)
    if (!selectedItem) {
        itemSelection.value = ''
        return
    }
    const duplicate = selectedItems.value.find(item => item.type === selectedItem.type && item.id === selectedItem.id)
    if (!duplicate) {
        selectedItems.value.push(selectedItem)
    }
    itemSelection.value = ''
})

function normalizeItems(items, typeLabel) {
    return items.map(item => {
        const labelParts = []
        if (item.name) labelParts.push(item.name)
        if (item.brand) labelParts.push(item.brand)
        if (item.serial) labelParts.push(item.serial)
        if (item.model) labelParts.push(item.model)
        return {
            id: item.id,
            type: typeLabel.toLowerCase(),
            typeLabel,
            displayLabel: labelParts.length ? labelParts.join(' - ') : `#${item.id}`
        }
    })
}

async function loadFormData() {
    try {
        const users = await userService.getAll()
        const allItems = await getAllItems()

        const normalizedItems = [
            ...normalizeItems(allItems.filter(i => i.itemtype === 'Computer'), 'Ordinateur'),
            ...normalizeItems(allItems.filter(i => i.itemtype === 'Phone'), 'Téléphone'),
            ...normalizeItems(allItems.filter(i => i.itemtype === 'Monitor'), 'Écran')
        ]

        return { users, allItems: normalizedItems }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        throw error
    }
}

function getUserOptions(users) {
    return users.map(user => ({
        value: user.id,
        label: user.displayName || user.name || `#${user.id}`
    }))
}

function getItemOptions(items) {
    return items.map(item => ({
        value: `${item.type}|${item.id}`,
        label: `${item.typeLabel} — ${item.displayLabel}`
    }))
}

function removeItem(item) {
    selectedItems.value = selectedItems.value.filter(
        selected => !(selected.type === item.type && selected.id === item.id)
    )
}

function addCost() {
    currentCost.name = ''
    currentCost.comment = ''
    currentCost.actiontime = 0
    currentCost.cost_time = 0
    currentCost.cost_fixed = 0
    currentCost.cost_material = 0
    showCostModal.value = true
}

function saveCost() {
    if (!currentCost.name && !currentCost.comment && !currentCost.cost_time && 
        !currentCost.cost_fixed && !currentCost.cost_material) {
        showCostModal.value = false
        return
    }
    form.costs.push({ ...currentCost })
    showCostModal.value = false
}

function removeCostItem(costItem) {
    const index = form.costs.indexOf(costItem)
    if (index !== -1) {
        form.costs.splice(index, 1)
    }
}

function resetForm() {
    form.requesterId = undefined
    form.status = 1
    form.type = 1
    form.priority = 3
    form.urgency = 3
    form.impact = 3
    form.name = ''
    form.content = ''
    form.costs = []
    selectedItems.value = []
    itemSelection.value = ''
    currentStep.value = 1
}

function nextStep() {
    if (currentStep.value < 3) {
        currentStep.value++
    }
}

function prevStep() {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

async function submitTicket() {
    loading.value = true
    try {
        if (!form.name.trim()) throw new Error('Le sujet est requis.')
        if (!form.content.trim()) throw new Error('La description est requise.')

        const ticketPayload = {
            name: form.name,
            content: form.content,
            status: form.status,
            type: form.type,
            priority: form.priority,
            urgency: form.urgency,
            impact: form.impact,
            users_id_recipient: form.requesterId || 0,
            users_id_lastupdater: form.requesterId || 0
        }

        const ticket = await createTicket(ticketPayload)

        await Promise.all([
            addTicketItems(ticket.id, selectedItems.value),
            addTicketCosts(ticket.id, form.costs)
        ])

        showSuccess('Le ticket a été créé avec succès.')
        resetForm()
    } catch (error) {
        console.error(error)
        showError(error.message || 'Une erreur est survenue lors de la création du ticket.')
    } finally {
        loading.value = false
    }
}

async function loadData() {
    try {
        const { users: loadedUsers, allItems: loadedItems } = await loadFormData()
        users.value = loadedUsers
        allItems.value = loadedItems
    } catch (error) {
        console.error(error)
        showError('Impossible de charger les données de création.')
    }
}

onMounted(loadData)
</script>

<template>
    <FrontLayout>
        <!-- Page Header -->
        <div class="page-header mb-4">
            <span class="eyebrow">Tickets</span>
            <h1 class="page-title">Création d'un ticket</h1>
            <p class="page-subtitle">
                Remplissez les informations pour créer un nouveau ticket.
            </p>
        </div>

        <!-- Steps Indicator -->
        <div class="steps-indicator mb-4">
            <div 
                v-for="step in steps" 
                :key="step.number"
                :class="['step-item', { 
                    'step-active': currentStep === step.number,
                    'step-completed': currentStep > step.number
                }]"
            >
                <div class="step-circle">
                    <i v-if="currentStep > step.number" class="bi bi-check-lg"></i>
                    <span v-else>{{ step.number }}</span>
                </div>
                <div class="step-info">
                    <span class="step-label">{{ step.label }}</span>
                </div>
                <div v-if="step.number < 3" class="step-line"></div>
            </div>
        </div>

        <form @submit.prevent="submitTicket">
            <!-- Étape 1 : Informations générales -->
            <div v-show="currentStep === 1" class="card-custom mb-4">
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="stat-icon mb-0">
                        <i class="bi bi-info-circle"></i>
                    </div>
                    <div>
                        <h2 class="section-title mb-0">Informations générales</h2>
                        <p class="text-muted-custom small mb-0">Détails principaux du ticket</p>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <BaseSelect 
                            v-model="form.requesterId" 
                            :options="userOptions" 
                            label="Demandeur"
                            placeholder="Rechercher un demandeur..." 
                            optionLabel="label" 
                            optionValue="value" 
                            autocomplete
                            searchable
                        />
                    </div>
                    <div class="col-md-6">
                        <BaseSelect 
                            v-model="form.status" 
                            :options="statusOptions" 
                            label="Statut"
                            placeholder="Sélectionner un statut" 
                            required 
                        />
                    </div>
                    <div class="col-md-6">
                        <BaseSelect 
                            v-model="form.type" 
                            :options="typeOptions" 
                            label="Type"
                            placeholder="Sélectionner un type" 
                            required 
                        />
                    </div>
                    <div class="col-md-6">
                        <BaseSelect 
                            v-model="form.priority" 
                            :options="severityOptions" 
                            label="Priorité"
                            placeholder="Sélectionner une priorité" 
                            required 
                        />
                    </div>
                    <div class="col-md-6">
                        <BaseSelect 
                            v-model="form.urgency" 
                            :options="severityOptions" 
                            label="Urgence"
                            placeholder="Sélectionner une urgence" 
                            required 
                        />
                    </div>
                    <div class="col-md-6">
                        <BaseSelect 
                            v-model="form.impact" 
                            :options="severityOptions" 
                            label="Impact"
                            placeholder="Sélectionner un impact" 
                            required 
                        />
                    </div>
                    <div class="col-12">
                        <BaseInput 
                            v-model="form.name" 
                            label="Titre du ticket" 
                            placeholder="Ex : Problème de connexion réseau..." 
                            required 
                            icon="bi bi-pencil"
                        />
                    </div>
                    <div class="col-12">
                        <BaseInput 
                            v-model="form.content" 
                            type="textarea" 
                            label="Description détaillée"
                            placeholder="Décrivez précisément le problème ou la demande..."
                            required 
                        />
                    </div>
                </div>

                <div class="d-flex justify-content-end mt-4">
                    <BaseButton 
                        type="button" 
                        label="Continuer" 
                        variant="primary" 
                        @click="nextStep"
                        :disabled="!isStep1Valid"
                        icon="bi bi-arrow-right"
                    />
                </div>
            </div>

            <!-- Étape 2 : Éléments & Coûts -->
            <div v-show="currentStep === 2" class="card-custom mb-4">
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="stat-icon mb-0">
                        <i class="bi bi-box-seam"></i>
                    </div>
                    <div>
                        <h2 class="section-title mb-0">Éléments & Coûts</h2>
                        <p class="text-muted-custom small mb-0">Associez des équipements et des coûts (optionnel)</p>
                    </div>
                </div>

                <!-- Éléments -->
                <div class="mb-4">
                    <h3 class="subsection-title mb-3">
                        <i class="bi bi-pc-display me-2"></i>Équipements associés
                    </h3>
                    <BaseSelect 
                        v-model="itemSelection" 
                        :options="itemOptions" 
                        label="Rechercher un équipement"
                        placeholder="Ordinateur, téléphone ou écran..." 
                        optionLabel="label" 
                        optionValue="value"
                        autocomplete 
                        searchable 
                    />

                    <div v-if="selectedItems.length" class="selected-items mt-3">
                        <div 
                            class="selected-item" 
                            v-for="item in selectedItems" 
                            :key="`${item.type}-${item.id}`"
                        >
                            <div class="selected-item-info">
                                <span class="selected-item-type">{{ item.typeLabel }}</span>
                                <span class="selected-item-name">{{ item.displayLabel }}</span>
                            </div>
                            <button type="button" class="selected-item-remove" @click="removeItem(item)" title="Retirer">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>

                    <p v-if="!selectedItems.length" class="empty-hint mt-3">
                        <i class="bi bi-info-circle"></i>
                        Aucun équipement associé. Vous pouvez en ajouter via la recherche ci-dessus.
                    </p>
                </div>

                <!-- Coûts -->
                <div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 class="subsection-title mb-0">
                            <i class="bi bi-cash-coin me-2"></i>Coûts associés
                        </h3>
                        <BaseButton type="button" variant="outline-secondary" size="sm" @click="addCost" icon="bi bi-plus-lg">
                            Ajouter un coût
                        </BaseButton>
                    </div>

                    <div v-if="form.costs.length" class="mb-3">
                        <BaseTable :items="form.costs" :columns="costColumns" :pageSize="5">
                            <template #cell-actions="{ item }">
                                <BaseButton 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    @click="removeCostItem(item)"
                                    icon="bi bi-trash"
                                    title="Supprimer"
                                />
                            </template>
                        </BaseTable>
                    </div>
                    <p v-else class="empty-hint">
                        <i class="bi bi-info-circle"></i>
                        Aucun coût ajouté. Cliquez sur "Ajouter un coût" pour en créer un.
                    </p>
                </div>

                <div class="d-flex justify-content-between mt-4">
                    <BaseButton type="button" label="Retour" variant="outline-secondary" @click="prevStep" icon="bi bi-arrow-left" />
                    <BaseButton type="button" label="Continuer" variant="primary" @click="nextStep" icon="bi bi-arrow-right" />
                </div>
            </div>

            <!-- Étape 3 : Récapitulatif -->
            <div v-show="currentStep === 3" class="card-custom mb-4">
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="stat-icon mb-0">
                        <i class="bi bi-check2-all"></i>
                    </div>
                    <div>
                        <h2 class="section-title mb-0">Récapitulatif</h2>
                        <p class="text-muted-custom small mb-0">Vérifiez les informations avant de créer le ticket</p>
                    </div>
                </div>

                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Titre</span>
                        <span class="summary-value">{{ form.name || '—' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Demandeur</span>
                        <span class="summary-value">{{ userOptions.find(u => u.value === form.requesterId)?.label || 'Non défini' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Statut</span>
                        <span class="summary-value">{{ statusOptions.find(s => s.value === form.status)?.label || '—' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Type</span>
                        <span class="summary-value">{{ typeOptions.find(t => t.value === form.type)?.label || '—' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Priorité</span>
                        <span class="summary-value">{{ severityOptions.find(s => s.value === form.priority)?.label || '—' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Équipements</span>
                        <span class="summary-value">{{ selectedItems.length || 'Aucun' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Coûts</span>
                        <span class="summary-value">{{ form.costs.length || 'Aucun' }}</span>
                    </div>
                    <div class="summary-item summary-full">
                        <span class="summary-label">Description</span>
                        <span class="summary-value">{{ form.content || '—' }}</span>
                    </div>
                </div>

                <div class="d-flex justify-content-between mt-4">
                    <BaseButton type="button" label="Retour" variant="outline-secondary" @click="prevStep" icon="bi bi-arrow-left" />
                    <BaseButton 
                        type="submit" 
                        :loading="loading" 
                        label="Créer le ticket" 
                        variant="success"
                        icon="bi bi-check-lg"
                        size="lg"
                    />
                </div>
            </div>
        </form>

        <!-- Modal Ajout de coût -->
        <BaseModal v-model="showCostModal" title="Ajouter un coût" size="md">
            <div class="row g-3">
                <div class="col-12">
                    <BaseInput v-model="currentCost.name" label="Nom du coût" placeholder="Ex : Main d'œuvre" icon="bi bi-tag" />
                </div>
                <div class="col-12">
                    <BaseInput v-model="currentCost.comment" label="Commentaire" placeholder="Détail du coût..." />
                </div>
                <div class="col-md-6">
                    <BaseInput v-model.number="currentCost.actiontime" type="number" label="Durée (secondes)" placeholder="0" />
                </div>
                <div class="col-md-6">
                    <BaseInput v-model.number="currentCost.cost_time" type="number" label="Coût horaire (€)" placeholder="0" />
                </div>
                <div class="col-md-6">
                    <BaseInput v-model.number="currentCost.cost_fixed" type="number" label="Coût fixe (€)" placeholder="0" />
                </div>
                <div class="col-md-6">
                    <BaseInput v-model.number="currentCost.cost_material" type="number" label="Coût matériel (€)" placeholder="0" />
                </div>
            </div>
            <template #footer>
                <BaseButton type="button" variant="outline-secondary" @click="showCostModal = false">
                    Annuler
                </BaseButton>
                <BaseButton type="button" variant="primary" @click="saveCost" icon="bi bi-check-lg">
                    Enregistrer
                </BaseButton>
            </template>
        </BaseModal>
    </FrontLayout>
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

/* ============ STEPS INDICATOR ============ */
.steps-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 0 1rem;
}

.step-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    position: relative;
}

.step-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    background: var(--pill-bg);
    color: var(--text-muted);
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.step-active .step-circle {
    background: var(--brand-green);
    color: #fff;
}

.step-completed .step-circle {
    background: var(--success-color);
    color: #fff;
}

.step-info {
    display: flex;
    flex-direction: column;
}

.step-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
    white-space: nowrap;
}

.step-active .step-label {
    color: var(--brand-green);
}

.step-completed .step-label {
    color: var(--success-color);
}

.step-line {
    flex: 1;
    height: 2px;
    background: var(--border-color);
    margin: 0 0.5rem;
    transition: background 0.3s ease;
}

.step-completed + .step-item .step-line,
.step-completed .step-line {
    background: var(--success-color);
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

.subsection-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main);
    display: flex;
    align-items: center;
}

.subsection-title i {
    color: var(--brand-green);
}

/* ============ SELECTED ITEMS ============ */
.selected-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.selected-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--bg);
    border-radius: 10px;
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
}

.selected-item:hover {
    border-color: var(--brand-green);
}

.selected-item-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.selected-item-type {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--brand-green);
}

.selected-item-name {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text-main);
}

.selected-item-remove {
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
}

.selected-item-remove:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

/* ============ EMPTY HINT ============ */
.empty-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--bg);
    border-radius: 10px;
    color: var(--text-muted);
    font-size: 0.85rem;
    border: 1px dashed var(--border-color);
}

/* ============ SUMMARY ============ */
.summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background: var(--bg);
    border-radius: 10px;
}

.summary-full {
    grid-column: 1 / -1;
}

.summary-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.summary-value {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-main);
    word-break: break-word;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
    .card-custom {
        padding: 20px;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .steps-indicator {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .step-line {
        display: none;
    }
    
    .summary-grid {
        grid-template-columns: 1fr;
    }
    
    .step-info {
        display: none;
    }
}
</style>