<script setup>
//@ts-nocheck
import { onMounted, ref } from 'vue';
import FrontLayout from '../../../layouts/FrontLayout.vue';
import { get, post } from '../../../api/backend-client.js';
import BaseTable from '../../../components/base/BaseTable.vue';
import BaseInput from '../../../components/base/BaseInput.vue';
import BaseModal from '../../../components/base/BaseModal.vue';
import BaseSelect from '../../../components/base/BaseSelect.vue';
import BaseButton from '../../../components/base/BaseButton.vue';
import { useToast } from '../../../composables/useToast';

const ticketCosts = ref([])
const ticketCancelCosts = ref([])
const showModal = ref(false)
const loading = ref(false)
const valeur = ref(null)
const plafond = ref(null)
const mode = ref(null)
const ticket = ref(null)
const { showError, showInfo, showSuccess } = useToast()

onMounted(async () => {
    try {
        loading.value = true
        const response = await get('/item-cost/ticket-cost')
        if (response.success) {
            ticketCosts.value = response.data
            showInfo('Donnees chargees avec succes')
        } else {
            throw new Error(response.error)
        }
        const response2 = await get('/item-cost/ticket-cancel-cost')
        if (response2.success) {
            ticketCancelCosts.value = response2.data
            showInfo('Donnees chargees avec succes')
        } else {
            throw new Error(response2.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors du chargement de donnees')
        loading.value = false
    }
    loading.value = false
})

const confirmChange = async () => {
    try {
        const payload = {
            ticketId: ticket.value.ticketId,
            groupId: ticket.value.groupId,
            costTypeId: ticket.value.costTypeId,
            cost: ticket.value.cost,
            value: valeur.value,
            mode: mode.value
        }
        const response = await post('/item-cost/update', payload)
        if (response.success) {
            showSuccess(response.data)
        } else {
            throw new Error(response.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors de la modification du ticket')
    }
}

const showEdit = (item) => {
    showModal.value = true
    ticket.value = item
}

const retablir = async (item) => {
    try {
        const response = await post(`/item-cost/retablir?ticketId=${item.ticketId}&groupId=${item.groupId}`)
        if (response.success) {
            showSuccess(response.data)
        } else {
            showError(response.error)
            console.error(response.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors de la retablissement')
    }
}

const validePlafond = async () => {
    try {
        const response = await post(`/item-cost/plafond?plafond=${plafond.value}`)
        if (response.success) {
            showSuccess(response.data)
        } else {
            showError(response.error)
            console.error(response.error)
        }
    } catch (error) {
        console.error(error)
        showError('Erreur lors de l enregistrement du plafond')
    }
    plafond.value = null
}

</script>

<template>
    <FrontLayout>
        <BaseInput v-model="plafond" type="number" label="Plafond" />
        <BaseButton label="Valider" variant="primary" customClass="ml-2 mt-4" size="md" @click="validePlafond" />
        <BaseTable :items="ticketCosts" :loading="loading" :columns="[
            { key: 'ticketId', label: 'Ref Ticket' },
            { key: 'groupId', label: 'Group' },
            { key: 'costTypeId', label: 'Type Cost' },
            { key: 'cost', label: 'Cost' },
            { key: 'mode', label: 'Mode de calcul' },
            { key: 'value', label: 'Valeur' }
        ]" :onRowClick="showEdit" customClass="ml-2 mt-4" />
        <BaseModal v-model="showModal" title="Modifier Cost" size="md">
            <BaseInput v-model="valeur" type="number" label="Valeur" />
            <BaseSelect v-if="ticket.costTypeId == 2" v-model="mode" label="Mode de calcul" :options="[1, 2, 3, 4]" />
            <BaseButton label="Valider" variant="primary" customClass="ml-2 mt-4" size="md" @click="confirmChange" />
        </BaseModal>
        <BaseTable :items="ticketCancelCosts" :loading="loading" :columns="[
            { key: 'ticketId', label: 'Ref Ticket' },
            { key: 'groupId', label: 'Group' },
            { key: 'costTypeId', label: 'Type Cost' },
            { key: 'cost', label: 'Cost' },
            { key: 'mode', label: 'Mode de calcul' },
            { key: 'value', label: 'Valeur' }
        ]" :onRowClick="retablir" customClass="ml-2 mt-4" />
    </FrontLayout>
</template>