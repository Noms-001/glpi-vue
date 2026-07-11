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
    { key: 'name', label: 'Nom' },
    { key: 'comment', label: 'Commentaire' },
    { key: 'actiontime', label: 'Durée' },
    { key: 'cost_time', label: 'Temps' },
    { key: 'cost_fixed', label: 'Fixe' },
    { key: 'cost_material', label: 'Matériel' },
    { key: 'actions', label: 'Actions' }
]

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

/**
 * @param {any[]} items
 * @param {string} typeLabel
 * @returns {Array<{id:number,type:string,typeLabel:string,displayLabel:string}>}
 */
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

/**
 * @returns {Promise<{users: any[], allItems: any[]}>}
 */
async function loadFormData() {
    try {
        const users = await userService.getAll()
        const allItems = await getAllItems()

        const normalizedItems = [
            ...normalizeItems(
                allItems.filter(i => i.itemtype === 'Computer'),
                'Ordinateur'
            ),
            ...normalizeItems(
                allItems.filter(i => i.itemtype === 'Phone'),
                'Téléphone'
            ),
            ...normalizeItems(
                allItems.filter(i => i.itemtype === 'Monitor'),
                'Écran'
            )
        ]

        return { users, allItems: normalizedItems }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        throw error
    }
}

/**
 * @param {any[]} users
 * @returns {Array<{value:number,label:string}>}
 */
function getUserOptions(users) {
    return users.map(user => ({
        value: user.id,
        label: user.displayName || user.name || `#${user.id}`
    }))
}

/**
 * @param {any[]} items
 * @returns {Array<{value:string,label:string}>}
 */
function getItemOptions(items) {
    return items.map(item => ({
        value: `${item.type}|${item.id}`,
        label: `${item.typeLabel} — ${item.displayLabel}`
    }))
}

function removeItem(item) {
    selectedItems.value = selectedItems.value.filter(selected => !(selected.type === item.type && selected.id === item.id))
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
    if (!currentCost.name && !currentCost.comment && !currentCost.cost_time && !currentCost.cost_fixed && !currentCost.cost_material) {
        showCostModal.value = false
        return
    }
    form.costs.push({
        name: currentCost.name,
        comment: currentCost.comment,
        actiontime: currentCost.actiontime,
        cost_time: currentCost.cost_time,
        cost_fixed: currentCost.cost_fixed,
        cost_material: currentCost.cost_material
    })
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
}

async function submitTicket() {
    loading.value = true
    try {
        // Validation
        if (!form.name.trim()) {
            throw new Error('Le sujet est requis.')
        }
        if (!form.content.trim()) {
            throw new Error('La description est requise.')
        }

        // Créer le ticket
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

        // Ajouter les items et coûts
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
        <section class="container py-4">
            <header class="mb-4">
                <h1 class="h3">Création de ticket</h1>
                <p style="color: var(--text-muted-custom)">Remplissez les informations du ticket, ajoutez des éléments et des
                    coûts
                    facultatifs.</p>
            </header>

            <form @submit.prevent="submitTicket">
                <div class="section">
                    <h2>Informations générales</h2>
                    <div class="row g-3">
                        <BaseSelect v-model="form.requesterId" :options="userOptions" label="Demandeur"
                            placeholder="Sélectionner un demandeur" optionLabel="label" optionValue="value" autocomplete
                            customClass="col-md-6" />


                        <BaseSelect v-model="form.status" :options="statusOptions" label="Statut"
                            placeholder="Sélectionner un statut" required customClass="col-md-6" />


                        <BaseSelect v-model="form.type" :options="typeOptions" label="Type"
                            placeholder="Sélectionner un type" required customClass="col-md-6" />


                        <BaseSelect v-model="form.priority" :options="severityOptions" label="Priorité"
                            placeholder="Sélectionner une priorité" required customClass="col-md-6" />


                        <BaseSelect v-model="form.urgency" :options="severityOptions" label="Urgence"
                            placeholder="Sélectionner une urgence" required customClass="col-md-6" />


                        <BaseSelect v-model="form.impact" :options="severityOptions" label="Impact"
                            placeholder="Sélectionner un impact" required customClass="col-md-6" />

                        <BaseInput v-model="form.name" label="Titre" placeholder="Titre du ticket" required />
                    </div>

                    <BaseInput v-model="form.content" type="textarea" label="Description"
                        placeholder="Décrivez le problème ou la demande" required customClass="mt-4" />
                </div>

                <div class="section">
                    <h2>Éléments</h2>
                    <BaseSelect v-model="itemSelection" :options="itemOptions" label="Rechercher un élément"
                        placeholder="Ordinateur, téléphone ou écran" optionLabel="label" optionValue="value"
                        autocomplete customClass="mb-3" />

                    <div v-if="selectedItems.length" class="list-group mb-3">
                        <div class="list-group-item d-flex justify-content-between align-items-center"
                            v-for="item in selectedItems" :key="`${item.type}-${item.id}`">
                            <div>
                                <div class="fw-semibold">{{ item.typeLabel }}</div>
                                <div>{{ item.displayLabel }}</div>
                            </div>
                            <BaseButton type="button" variant="danger" size="sm" @click="removeItem(item)">Supprimer
                            </BaseButton>
                        </div>
                    </div>

                    <p v-if="!selectedItems.length" class="text-muted-custom">Ajoutez des éléments en recherchant un
                        ordinateur, un téléphone ou un écran.</p>
                </div>

                <div class="section">
                    <h2 class="d-flex justify-content-between">Coûts (optionnel)
                        <BaseButton type="button" @click="addCost">Ajouter un coût</BaseButton>
                    </h2>
                    <div v-if="form.costs.length" class="mb-3">
                        <BaseTable :items="form.costs" :columns="costColumns" customClass="mb-3">
                            <template #cell-actions="{ item }">
                                <BaseButton type="button" variant="danger" size="sm" @click="removeCostItem(item)">
                                    Supprimer</BaseButton>
                            </template>
                        </BaseTable>
                    </div>
                    <div v-else class="mb-3" style="color: var(--text-color)">
                        Aucun cout
                    </div>

                    <BaseModal v-model="showCostModal" title="Ajouter un coût" size="md" :closeOnOutside="true">
                        <div class="row g-3">
                            <div class="col-12">
                                <BaseInput v-model="currentCost.name" label="Nom du coût" placeholder="Nom du coût" />
                            </div>
                            <div class="col-12">
                                <BaseInput v-model="currentCost.comment" label="Commentaire"
                                    placeholder="Commentaire" />
                            </div>
                            <div class="col-md-6">
                                <BaseInput v-model.number="currentCost.actiontime" type="number" label="Durée"
                                    placeholder="0" />
                            </div>
                            <div class="col-md-6">
                                <BaseInput v-model.number="currentCost.cost_time" type="number" label="Coût temps"
                                    placeholder="0" />
                            </div>
                            <div class="col-md-6">
                                <BaseInput v-model.number="currentCost.cost_fixed" type="number" label="Coût fixe"
                                    placeholder="0" />
                            </div>
                            <div class="col-md-6">
                                <BaseInput v-model.number="currentCost.cost_material" type="number"
                                    label="Coût matériel" placeholder="0" />
                            </div>
                        </div>
                        <template #footer>
                            <BaseButton type="button" variant="secondary" @click="showCostModal = false">Annuler
                            </BaseButton>
                            <BaseButton type="button" @click="saveCost">Enregistrer</BaseButton>
                        </template>
                    </BaseModal>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                    <BaseButton type="submit" :loading="loading" label="Créer le ticket" />
                    <BaseButton type="button" variant="secondary" @click="resetForm">Réinitialiser</BaseButton>
                </div>

            </form>
        </section>
    </FrontLayout>
</template>
