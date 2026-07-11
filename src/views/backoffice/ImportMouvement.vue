<script setup>
//@ts-nocheck
import { onMounted, ref } from 'vue';
import { useToast } from '../../composables/useToast';
import BaseInput from '../../components/base/BaseInput.vue';
import BaseButton from '../../components/base/BaseButton.vue';
import BaseLayout from '../../layouts/BaseLayout.vue';
import DataManager from '../../utils/DataManager';
import BaseSelect from '../../components/base/BaseSelect.vue';
import { ticketService } from '../../services/BaseService';
import { handleMouvementTicket } from '../../utils/TicketManager';
import { get, post } from '../../api/backend-client';
const { showError, showSuccess } = useToast()
const csvFile = ref(/** @type {File} */)
const ticket = ref(null)
const mouvement = ref(null)
const mode = ref(null)
const valeur = ref(null)
const loading = ref(false)
const dataManager = new DataManager()
const tickets = ref([])

const importCost = async () => {
    if (csvFile.value === null) {
        showError('❌ Aucun fichier sélectionné')
        return
    }
    try {
        loading.value = true
        const data = await dataManager.parseCsv(csvFile.value);
        await dataManager.importMouvement(data, tickets.value)
        showSuccess("Importation termine")
    } catch (error) {
        showError(error)
    }
    loading.value = false
}

const resetCost = async () => {
    loading.value = true
    try {
        loading.value = true
        await dataManager.resetItemCost()
        showSuccess("Reinitialisation terminee")
    } catch (error) {
        showError(error)
    }
    loading.value = false
}

const formatter = (t) => `Ref#${t.externalid}`

const handleSaisie = async () => {
    try {
        loading.value = true
        await handleMouvementTicket(ticket.value, mouvement.value, valeur.value, mode.value)
        showSuccess("importation terminee")
    } catch (error) {
        showError(error)
    }
    ticket.value = null
    mouvement.value = null
    valeur.value = null
    mode.value = null
    loading.value = false
}

onMounted(async () => {
    try {
        loading.value = true
        tickets.value = await ticketService.getAll()
        showSuccess("Donnees chargees avec succes")
    } catch (error) {
        console.log(error)
        showSuccess("Erreur lors du chargement des donnees")
    }
    loading.value = false
})
</script>

<template>
    <BaseLayout>
        <div class="section row">
            <div class="demo-block col-5 me-5 ms-4">
                <BaseSelect v-model="ticket" label="Reference ticket" :options="tickets" :optionValue="'id'"
                    :optionFormatter="formatter" />
                <BaseSelect v-model="mouvement" label="Mouvement" :options="['OPEN', 'CLOSE', 'CANCEL']" />
                <BaseSelect v-if="mouvement === 'OPEN'" v-model="mode" label="Mode" :options="[1, 2, 3, 4]" />
                <BaseInput v-model="valeur" type="number" label="Valeur" />
                <BaseButton label="Importer les données" variant="primary" @click="handleSaisie"
                    customClass="col-6 me-2 mt-3" :loading="loading" />
            </div>
            <div class="demo-block col-6">
                <BaseInput v-model="csvFile" type="file" label="Fichier CSV" accept=".csv" />
                <BaseButton label="Importer les données" variant="primary" :disabled="csvFile === null"
                    @click="importCost" customClass="col-5 mt-3 me-3 ms-3" :loading="loading" />
                <BaseButton label="Reinitialiser les données" variant="danger" :disabled="csvFile === null"
                    :loading="loading" @click="resetCost" customClass="col-6" />
            </div>
        </div>
    </BaseLayout>
</template>