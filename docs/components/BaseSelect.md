## 🎯 BaseSelect

Sélecteur dropdown avec support d'objets complexes et formatage personnalisé.

### ⚙️ Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `modelValue` | String/Number/Object | `null` | Valeur sélectionnée (v-model) |
| `options` | Array | `[]` | Liste des options |
| `label` | String | `''` | Libellé du select |
| `placeholder` | String | `'Sélectionner'` | Texte par défaut |
| `optionLabel` | String | `'label'` | Propriété à afficher |
| `optionValue` | String | `'value'` | Propriété pour la valeur |
| `optionFormatter` | Function | `null` | Fonction de formatage personnalisé |
| `required` | Boolean | `false` | Select obligatoire |
| `disabled` | Boolean | `false` | Select désactivé |
| `error` | String | `''` | Message d'erreur |
| `customClass` | String/Array/Object | `''` | Classes CSS additionnelles |
| `autocomplete` | Boolean | `false` | Classes CSS additionnelles |

### 📋 Quick Copy - Tous les cas d'usage

#### 1️⃣ Select Simple (Array de strings)
```html
<script setup>
import { ref } from 'vue'
const selected = ref('')
const options = ['Option 1', 'Option 2', 'Option 3']
</script>

<template>
  <BaseSelect 
    v-model="selected"
    label="Choisissez"
    :options="options"
  />
</template>
```

#### 2️⃣ Select avec Objets (label/value)
```html
<script setup>
import { ref } from 'vue'
const selectedCity = ref('')
const cities = [
  { value: 'paris', label: 'Paris' },
  { value: 'lyon', label: 'Lyon' },
  { value: 'marseille', label: 'Marseille' }
]
</script>

<template>
  <BaseSelect 
    v-model="selectedCity"
    label="Ville"
    :options="cities"
    optionLabel="label"
    optionValue="value"
  />
</template>
```

#### 3️⃣ Select avec IDs Numériques
```html
<script setup>
import { ref } from 'vue'
const selectedId = ref('')
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
]
</script>

<template>
  <BaseSelect 
    v-model="selectedId"
    label="Sélectionner un item"
    :options="items"
    optionLabel="name"
    optionValue="id"
  />
</template>
```

#### 4️⃣ Requis avec Validation
```html
<script setup>
import { ref } from 'vue'
const status = ref('')
const statusError = ref('')
const statuses = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'pending', label: 'En attente' }
]

const validateStatus = () => {
  if (!status.value) {
    statusError.value = 'Statut requis'
  } else {
    statusError.value = ''
  }
}
</script>

<template>
  <BaseSelect 
    v-model="status"
    label="Statut"
    :options="statuses"
    required
    :error="statusError"
  />
</template>
```

#### 5️⃣ Formatage Personnalisé
```html
<script setup>
import { ref } from 'vue'
const selectedUser = ref('')
const users = [
  { id: 1, firstName: 'Jean', lastName: 'Dupont', role: 'Admin' },
  { id: 2, firstName: 'Marie', lastName: 'Martin', role: 'User' },
  { id: 3, firstName: 'Pierre', lastName: 'Bernard', role: 'Moderator' }
]
</script>

<template>
  <BaseSelect 
    v-model="selectedUser"
    label="Utilisateur"
    :options="users"
    optionValue="id"
    :optionFormatter="
      user => `${user.firstName} ${user.lastName} (${user.role})`
    "
  />
</template>
```

#### 6️⃣ Désactivé
```html
<BaseSelect 
  v-model="selected"
  label="Indisponible"
  :options="options"
  disabled
/>
```

#### 7️⃣ Placeholder Personnalisé et auto complete
```html
<BaseSelect 
  v-model="selected"
  label="Catégorie"
  :options="categories"
  placeholder="-- Veuillez choisir --"
  autocomplete
/>
```

#### 8️⃣ Classe Personnalisée
```html
<BaseSelect 
  v-model="selected"
  label="Option"
  :options="options"
  customClass="w-full max-w-sm"
/>
```

#### 9️⃣ Chargement Dynamique (API)
```html
<script setup>
import { ref, onMounted } from 'vue'

const selectedUser = ref('')
const users = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await fetch('/api/users')
    users.value = await response.json()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <p v-if="loading">Chargement...</p>
    <BaseSelect 
      v-else
      v-model="selectedUser"
      label="Utilisateur"
      :options="users"
      optionLabel="name"
      optionValue="id"
    />
  </div>
</template>
```

---
