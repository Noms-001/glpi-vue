## 🎨 Patterns & Combinaisons

### 🔗 Pattern 1: Formulaire Complet dans Modale
```html
<script setup>
import { ref } from 'vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'

const showModal = ref(false)
const form = ref({
  name: '',
  email: '',
  country: ''
})

const countries = [
  { id: 'fr', name: 'France' },
  { id: 'be', name: 'Belgique' },
  { id: 'ch', name: 'Suisse' }
]

const submitForm = () => {
  console.log('Formulaire:', form.value)
  form.value = { name: '', email: '', country: '' }
  showModal.value = false
}
</script>

<template>
  <BaseButton label="Nouveau" @click="showModal = true" />

  <BaseModal 
    v-model="showModal"
    title="Nouveau Contact"
    size="lg"
    :closeOnOutside="false"
  >
    <BaseInput 
      v-model="form.name"
      label="Nom"
      required
    />

    <BaseInput 
      v-model="form.email"
      type="email"
      label="Email"
      required
    />

    <BaseSelect 
      v-model="form.country"
      label="Pays"
      :options="countries"
      optionLabel="name"
      optionValue="id"
    />

    <template #footer>
      <BaseButton 
        label="Annuler"
        variant="secondary"
        @click="showModal = false"
      />
      <BaseButton 
        label="Enregistrer"
        variant="success"
        @click="submitForm"
      />
    </template>
  </BaseModal>
</template>
```

### 🔗 Pattern 2: Tableau avec CRUD
```html
<script setup>
import { ref } from 'vue'
import BaseTable from '../components/base/BaseTable.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'

const items = ref([
  { id: 1, title: 'Item 1', description: 'Desc 1' },
  { id: 2, title: 'Item 2', description: 'Desc 2' }
])

const showModal = ref(false)
const editingItem = ref(null)
const form = ref({ title: '', description: '' })

const openCreate = () => {
  editingItem.value = null
  form.value = { title: '', description: '' }
  showModal.value = true
}

const openEdit = (item) => {
  editingItem.value = item.id
  form.value = { ...item }
  showModal.value = true
}

const save = () => {
  if (editingItem.value) {
    const idx = items.value.findIndex(i => i.id === editingItem.value)
    if (idx >= 0) items.value[idx] = { id: editingItem.value, ...form.value }
  } else {
    items.value.push({ id: Date.now(), ...form.value })
  }
  showModal.value = false
}

const delete_ = (id) => {
  items.value = items.value.filter(i => i.id !== id)
}
</script>

<template>
  <div>
    <BaseButton label="Créer" @click="openCreate" />

    <BaseTable
      :items="items"
      :columns="[
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Titre' },
        { key: 'description', label: 'Description' },
        { key: 'actions', label: 'Actions' }
      ]"
      searchable
      sortable
    >
      <template #cell-actions="{ item }">
        <BaseButton 
          label="Éditer"
          size="sm"
          @click="openEdit(item)"
        />
        <BaseButton 
          label="Supprimer"
          variant="danger"
          size="sm"
          @click="delete_(item.id)"
        />
      </template>
    </BaseTable>

    <BaseModal 
      v-model="showModal"
      :title="editingItem ? 'Éditer' : 'Créer'"
      size="lg"
    >
      <BaseInput 
        v-model="form.title"
        label="Titre"
        required
      />

      <BaseInput 
        v-model="form.description"
        type="textarea"
        label="Description"
      />

      <template #footer>
        <BaseButton 
          label="Annuler"
          variant="secondary"
          @click="showModal = false"
        />
        <BaseButton 
          label="Enregistrer"
          variant="success"
          @click="save"
        />
      </template>
    </BaseModal>
  </div>
</template>
```

### 🔗 Pattern 3: Classe Personnalisée Réutilisable
```html
<script setup>
// Tous les components acceptent customClass

const inputClasses = {
  fullWidth: 'w-full',
  large: 'py-3 px-4 text-lg'
}

const buttonClasses = {
  block: 'w-full',
  rounded: 'rounded-lg'
}
</script>

<template>
  <BaseInput 
    v-model="name"
    label="Nom"
    :customClass="`${inputClasses.fullWidth} ${inputClasses.large}`"
  />

  <BaseButton 
    label="Envoyer"
    :customClass="`${buttonClasses.block} ${buttonClasses.rounded}`"
  />
</template>
```

### 🔧 Sections de démonstration et layout de `ComponentsTest`
Les pages de démonstration utilisent des wrappers CSS pour structurer les composants :

- `section` : encadre un bloc de documentation ou de démonstration.
- `component-showcase` : grille adaptative qui positionne plusieurs `demo-block`.
- `demo-block` : carte d’exemple bordée contenant un titre et un ensemble de démonstrations.
- `demo-content` : zone flexible qui aligne et espace les contrôles ou composants à l’intérieur du bloc.

```html
<section class="section">
  <h2>BaseButton</h2>
  <div class="component-showcase">
    <div class="demo-block">
      <h3>Variantes</h3>
      <div class="demo-content">
        <BaseButton label="Primaire" variant="primary" />
        <BaseButton label="Secondaire" variant="secondary" />
      </div>
    </div>
  </div>
</section>
```

### 🧩 Exemple de page avec layout de dashboard
Le fichier `src/views/Test.vue` utilise ces classes pour structurer une page complète :

- `page-section` pour le conteneur principal centré.
- `page-header` pour le titre, l’eyebrow et le sous-titre.
- `dashboard-grid` pour la grille de cartes de statistiques.
- `section-panel` pour les blocs de contenu isolés.
- `empty-state` pour les messages sans donnée.

```html
<section class="section">
  <header class="page-header">
    <span class="eyebrow">Tableau de bord</span>
    <h1 class="page-title">Vue d'ensemble</h1>
    <p class="page-subtitle">Votre espace GLPI moderne pour suivre les actifs, les indicateurs et l'activité.</p>
  </header>

  <div class="dashboard-grid">
    <BaseCard label="Actifs" value="24" subtitle="Chargés depuis l'API" icon="bi bi-hdd-stack" />
    <BaseCard label="Disponibilité" value="99.8%" subtitle="SLA actuel" icon="bi bi-cloud-check" />
    <BaseCard label="Alertes" value="12" subtitle="Tickets à surveiller" icon="bi bi-exclamation-triangle" />
  </div>

  <div class="section-panel mt-4">
    <h2>Derniers actifs</h2>
    <p class="text-muted-custom">Un aperçu rapide des actifs les plus récents.</p>

    <div class="row g-3">
      <div class="col-12 col-md-6">
        <BaseCard title="Serveur 01" subtitle="Serveur" />
      </div>
      <div class="col-12 col-md-6">
        <BaseCard title="Switch 12" subtitle="Réseau" />
      </div>
    </div>
  </div>

  <div class="section-panel mt-4">
    <div class="empty-state">Chargement des informations...</div>
  </div>
</section>
```

Ce pattern est utile pour construire des pages backoffice claires, responsives et modulaires en combinant les composants de base avec des helpers CSS de layout.

