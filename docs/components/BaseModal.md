## 🔔 BaseModal

Modale réutilisable avec header, body, footer et événements.

### ⚙️ Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `modelValue` | Boolean | `false` | Ouvert/fermé (v-model) |
| `title` | String | `''` | Titre de la modale |
| `size` | String | `'md'` | `sm` \| `md` \| `lg` \| `xl` |
| `closeOnOutside` | Boolean | `true` | Ferme en cliquant dehors |
| `customClass` | String/Array/Object | `''` | Classes CSS additionnelles |

### 📋 Slots
- `header` - Contenu personnalisé du header
- `default` - Contenu principal de la modale
- `footer` - Pied de page optionnel

### 📋 Quick Copy - Tous les cas d'usage

#### 1️⃣ Modale Simple (Notification)
```html
<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>

<template>
  <div>
    <BaseButton 
      label="Ouvrir"
      @click="showModal = true"
    />

    <BaseModal 
      v-model="showModal"
      title="Notification"
      size="sm"
    >
      <p>Ceci est une notification simple.</p>
    </BaseModal>
  </div>
</template>
```

#### 2️⃣ Modale de Confirmation
```html
<script setup>
import { ref } from 'vue'
const showConfirm = ref(false)

const handleConfirm = () => {
  console.log('Confirmé!')
  showConfirm.value = false
}

const handleCancel = () => {
  console.log('Annulé')
  showConfirm.value = false
}
</script>

<template>
  <div>
    <BaseButton 
      label="Supprimer"
      variant="danger"
      @click="showConfirm = true"
    />

    <BaseModal 
      v-model="showConfirm"
      title="Confirmation"
      size="sm"
      :closeOnOutside="false"
    >
      <p>Êtes-vous sûr de vouloir supprimer cet élément?</p>
      
      <template #footer>
        <BaseButton 
          label="Annuler"
          variant="secondary"
          size="sm"
          @click="handleCancel"
        />
        <BaseButton 
          label="Supprimer"
          variant="danger"
          size="sm"
          @click="handleConfirm"
        />
      </template>
    </BaseModal>
  </div>
</template>
```

#### 3️⃣ Modale avec Formulaire
```html
<script setup>
import { ref } from 'vue'
const showForm = ref(false)
const formData = ref({
  name: '',
  email: ''
})

const handleSubmit = () => {
  console.log('Formulaire soumis:', formData.value)
  formData.value = { name: '', email: '' }
  showForm.value = false
}

const handleCancel = () => {
  formData.value = { name: '', email: '' }
  showForm.value = false
}
</script>

<template>
  <div>
    <BaseButton 
      label="Créer un utilisateur"
      @click="showForm = true"
    />

    <BaseModal 
      v-model="showForm"
      title="Créer un nouvel utilisateur"
      size="lg"
      :closeOnOutside="false"
    >
      <BaseInput 
        v-model="formData.name"
        label="Nom"
        placeholder="Entrez le nom"
        required
      />

      <BaseInput 
        v-model="formData.email"
        type="email"
        label="Email"
        placeholder="Entrez l'email"
        required
      />

      <template #footer>
        <BaseButton 
          label="Annuler"
          variant="secondary"
          @click="handleCancel"
        />
        <BaseButton 
          label="Créer"
          variant="success"
          @click="handleSubmit"
        />
      </template>
    </BaseModal>
  </div>
</template>
```

#### 4️⃣ Modale avec Select
```html
<script setup>
import { ref } from 'vue'
const showModal = ref(false)
const selectedOption = ref('')
const options = ['Option A', 'Option B', 'Option C']
</script>

<template>
  <div>
    <BaseButton label="Choisir" @click="showModal = true" />

    <BaseModal 
      v-model="showModal"
      title="Faire un choix"
    >
      <BaseSelect 
        v-model="selectedOption"
        label="Sélectionnez"
        :options="options"
      />

      <template #footer>
        <BaseButton 
          label="Annuler"
          variant="secondary"
          @click="showModal = false"
        />
        <BaseButton 
          label="Valider"
          @click="showModal = false"
        />
      </template>
    </BaseModal>
  </div>
</template>
```

#### 5️⃣ Modale Grande
```html
<script setup>
import { ref } from 'vue'
const showLarge = ref(false)
</script>

<template>
  <BaseButton label="Contenu détaillé" @click="showLarge = true" />

  <BaseModal 
    v-model="showLarge"
    title="Contenu détaillé"
    size="xl"
  >
    <div style="min-height: 400px;">
      <h3>Section 1</h3>
      <p>Contenu section 1...</p>
      <h3>Section 2</h3>
      <p>Contenu section 2...</p>
    </div>
  </BaseModal>
</template>
```

#### 6️⃣ Modale Petit (Alerte)
```html
<script setup>
import { ref } from 'vue'
const showAlert = ref(false)
</script>

<template>
  <BaseButton label="Alerte" @click="showAlert = true" />

  <BaseModal 
    v-model="showAlert"
    title="⚠️ Attention"
    size="sm"
  >
    <p>Une erreur s'est produite!</p>
  </BaseModal>
</template>
```

#### 7️⃣ Modale Non-Closable (Sauf footer)
```html
<script setup>
import { ref } from 'vue'
const showLocked = ref(false)
</script>

<template>
  <BaseModal 
    v-model="showLocked"
    title="Action en cours"
    :closeOnOutside="false"
  >
    <p>Veuillez compléter cette action...</p>
    
    <template #footer>
      <BaseButton 
        label="OK"
        @click="showLocked = false"
      />
    </template>
  </BaseModal>
</template>
```

#### 8️⃣ Header Personnalisé
```html
<script setup>
import { ref } from 'vue'
const showCustom = ref(false)
</script>

<template>
  <BaseModal 
    v-model="showCustom"
    size="md"
  >
    <template #header>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">🎉</span>
        <h3>Succès!</h3>
      </div>
    </template>

    <p>Opération réalisée avec succès.</p>

    <template #footer>
      <BaseButton 
        label="Fermer"
        @click="showCustom = false"
      />
    </template>
  </BaseModal>
</template>
```

---
