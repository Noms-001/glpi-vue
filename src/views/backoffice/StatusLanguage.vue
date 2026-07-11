<script setup>
// @ts-nocheck
import { ref, onMounted } from 'vue'
import BaseLayout from '../../layouts/BaseLayout.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { get, post } from '../../api/backend-client.js'
import { ticketStates } from '../../utils/TicketManager.js'
import TicketStatusTranslation from '../../models/tickets/TicketStatusTranslation.js'

const statusTranslation = ref(new TicketStatusTranslation())
const languageOptions = ref([])
const submitting = ref(false)
const loadingLanguages = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const statusOptions = Array.from(ticketStates.values()).map((state) => ({
    value: state.id,
    label: state.name
}))

const loadLanguages = async () => {
    loadingLanguages.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await get('/langues')

        if (response.success && Array.isArray(response.data)) {
            languageOptions.value = response.data.map((lang) => ({
                value: lang.code,
                label: lang.code
            }))
            return
        }

        errorMessage.value = response.error || 'Impossible de charger les langues.'
    } catch (err) {
        errorMessage.value = err.message || 'Erreur de chargement des langues.'
    } finally {
        loadingLanguages.value = false
    }
}

const submitTranslation = async () => {
    if (!statusTranslation.value.id || !statusTranslation.value.langue || !statusTranslation.value.valeur) {
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
            successMessage.value = 'Traduction de statut enregistrée avec succès.'
            statusTranslation.value = new TicketStatusTranslation()
            return
        }

        errorMessage.value = response.error || 'Échec de l’enregistrement.'
    } catch (err) {
        errorMessage.value = err.message || 'Erreur de communication avec le serveur.'
    } finally {
        submitting.value = false
    }
}

onMounted(loadLanguages)
</script>

<template>
    <BaseLayout>
        <section class="section">
            <header class="page-header">
                <span class="eyebrow">Backoffice</span>
                <h1 class="page-title">Ajouter une langue de statut</h1>
                <p class="page-subtitle">
                    Créez ou mettez à jour une traduction de libellé de statut de ticket.
                </p>
            </header>

            <div class="section-panel">
                <div class="form-grid">
                    <BaseSelect
                        label="Statut de ticket"
                        placeholder="Sélectionner un statut"
                        :options="statusOptions"
                        v-model="statusTranslation.id"
                        required
                    />

                    <BaseSelect
                        label="Langue"
                        placeholder="Saisir ou sélectionner une langue"
                        :options="languageOptions"
                        autocomplete
                        allowCustom
                        v-model="statusTranslation.langue"
                    />

                    <BaseInput
                        label="Valeur"
                        placeholder="Exemple : Réglé"
                        v-model="statusTranslation.valeur"
                        required
                    />
                </div>

                <div class="form-actions">
                    <BaseButton
                        label="Valider"
                        variant="primary"
                        size="md"
                        :disabled="submitting || loadingLanguages"
                        :loading="submitting"
                        type="button"
                        @click="submitTranslation"
                    />
                </div>

                <div v-if="errorMessage" class="form-alert form-alert-danger">
                    {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="form-alert form-alert-success">
                    {{ successMessage }}
                </div>
            </div>
        </section>
    </BaseLayout>
</template>

<style scoped>
.section-panel {
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 2rem;
    margin-top: 2rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1.5rem;
}

.form-actions {
    margin-top: 1.5rem;
}

.form-alert {
    margin-top: 1.5rem;
    padding: 1rem 1.2rem;
    border-radius: var(--radius-lg);
    font-weight: 500;
}

.form-alert-danger {
    background: rgba(220, 38, 38, 0.1);
    color: var(--danger-color);
    border: 1px solid rgba(220, 38, 38, 0.2);
}

.form-alert-success {
    background: rgba(22, 163, 74, 0.1);
    color: var(--success-color);
    border: 1px solid rgba(22, 163, 74, 0.2);
}
</style>
