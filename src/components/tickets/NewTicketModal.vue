<script setup>
// @ts-nocheck
import { ref, computed, onMounted } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseSelect from '../base/BaseSelect.vue'
import { createTicket, addTicketItems, getAllRequesters, getAllTicketItems } from '../../utils/TicketManager.js'
import { useToast } from '../../composables/useToast.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { showSuccess, showError } = useToast()

const title = ref('')
const description = ref('')
const requesterOptions = ref([])
const itemOptions = ref([])
const selectedRequester = ref(null)
const selectedItems = ref([])
const currentItem = ref(null)

const loadOptions = async () => {
  try {
    const [requesters, items] = await Promise.all([getAllRequesters(), getAllTicketItems()])
    requesterOptions.value = requesters.map(user => ({ 
      id: user.id, 
      label: user.name || `${user.firstname || ''} ${user.realname || ''}`.trim() || `#${user.id}` 
    }))
    itemOptions.value = items.map(item => ({
      id: item.id,
      label: item.name || item.completename || item.computer_name || item.brand || `#${item.id}`,
      itemtype: item.itemtype || item.type || item.typeLabel || item.class || 'Asset'
    }))
  } catch (error) {
    console.error(error)
    showError('Erreur lors du chargement des options')
  }
}

const resetForm = () => {
  title.value = ''
  description.value = ''
  selectedRequester.value = null
  selectedItems.value = []
  currentItem.value = null
}

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

// Fonction appelée quand on sélectionne un item dans le select
const onItemSelect = (itemId) => {
  const item = itemOptions.value.find(i => i.id === itemId)

  if (!item) return

  if (selectedItems.value.some(i => i.id === item.id)) {
    showError('Cet actif a déjà été ajouté')
    currentItem.value = null
    return
  }

  selectedItems.value.push({ ...item })
  currentItem.value = null
}

const removeItem = (itemId) => {
  selectedItems.value = selectedItems.value.filter(item => item.id !== itemId)
}

const submit = async () => {
  if (!title.value || !description.value) {
    showError('Le titre et la description sont requis.')
    return
  }

  try {
    const created = await createTicket({
      name: title.value,
      content: description.value,
      status: 1,
      users_id_recipient: selectedRequester.value?.id || null
    })

    await addTicketItems(created.id, selectedItems.value)

    showSuccess('Ticket créé avec succès.')
    emit('created')
    closeModal()
  } catch (error) {
    console.error(error)
    showError('Impossible de créer le ticket.')
  }
}

onMounted(loadOptions)
</script>

<template>
  <BaseModal v-model:modelValue="isOpen" title="Créer un nouveau ticket" size="lg">
    <div class="row g-3">
      <div class="col-12">
        <BaseInput 
          v-model="title" 
          label="Titre du ticket" 
          placeholder="Entrez le titre du ticket" 
        />
      </div>
      
      <div class="col-12">
        <BaseInput 
          v-model="description" 
          type="textarea" 
          label="Description"
          placeholder="Entrez la description du ticket" 
          rows="4"
        />
      </div>
      
      <div class="col-12">
        <BaseSelect 
          v-model="selectedRequester" 
          label="Demandeur" 
          placeholder="Rechercher un demandeur"
          :options="requesterOptions" 
          optionLabel="label" 
          autocomplete 
        />
      </div>
      
      <div class="col-12">
        <label class="form-label fw-semibold">Ajouter des actifs</label>
        <BaseSelect 
          v-model="currentItem" 
          placeholder="Sélectionnez un actif à ajouter..."
          :options="itemOptions" 
          optionLabel="label" 
          optionValue="id"
          autocomplete 
          clearable
          @update:modelValue="onItemSelect"
        />
        <div class="form-text text-muted-custom mt-1">
          <i class="bi bi-info-circle"></i> Sélectionnez un actif pour l'ajouter automatiquement
        </div>
      </div>
      
      <!-- Liste des actifs sélectionnés avec style Bootstrap -->
      <div class="col-12" v-if="selectedItems.length">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <h3 class="h6 mb-0">
              <i class="bi bi-check-circle-fill text-success me-2"></i>
              Actifs sélectionnés ({{ selectedItems.length }})
            </h3>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div 
                v-for="item in selectedItems" 
                :key="item.id" 
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div class="d-flex flex-column">
                  <div class="fw-semibold">
                    <i class="bi bi-hdd-stack me-2 text-primary"></i>
                    {{ item.label }}
                  </div>
                  <div class="small text-muted-custom mt-1">
                    <span class="badge bg-secondary me-2">
                      <i class="bi bi-tag me-1"></i>
                      {{ item.itemtype }}
                    </span>
                    <span class="text-muted-custom">
                      <i class="bi bi-hash"></i> ID: {{ item.id }}
                    </span>
                  </div>
                </div>
                <BaseButton 
                  label="Supprimer" 
                  variant="danger" 
                  size="sm" 
                  icon="bi bi-trash" 
                  @click="removeItem(item.id)" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Message quand aucun actif sélectionné -->
      <div class="col-12" v-else>
        <div class="alert alert-light text-center border border-dashed rounded-3">
          <i class="bi bi-inbox fs-4 text-muted-custom d-block mb-2"></i>
          <p class="mb-0 text-muted-custom">Aucun actif sélectionné</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <BaseButton 
          label="Fermer" 
          variant="secondary" 
          size="sm" 
          @click="closeModal" 
        />
        <BaseButton 
          label="Créer le ticket" 
          variant="primary" 
          size="sm" 
          @click="submit" 
          :disabled="!title || !description"
        />
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed #dee2e6;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
}

.list-group-item {
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.bi {
  font-size: 0.9rem;
}
</style>