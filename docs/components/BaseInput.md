## 📝 BaseInput

Champ input multifonction: texte, email, password, file, checkbox, radio, textarea, color.

### ⚙️ Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `modelValue` | String/Number/Boolean/Object/Array | `null` | Valeur du champ (v-model) |
| `value` | String/Number/Boolean | `''` | Valeur utilisée pour les radios |
| `type` | String | `'text'` | Type du champ |
| `label` | String | `''` | Libellé du champ |
| `placeholder` | String | `''` | Texte d'indication |
| `name` | String | `''` | Attribut name HTML |
| `required` | Boolean | `false` | Champ obligatoire |
| `disabled` | Boolean | `false` | Champ désactivé |
| `readonly` | Boolean | `false` | Champ en lecture seule |
| `icon` | String | `''` | Icône à gauche |
| `iconRight` | String | `''` | Icône à droite |
| `error` | String | `''` | Message d'erreur |
| `multiple` | Boolean | `false` | Multiple files (type=file) |
| `accept` | String | `''` | Types de fichiers acceptés |
| `helper` | String | `''` | Texte d'aide affiché sous le champ |
| `customClass` | String/Array/Object | `''` | Classes CSS additionnelles |

### ⚡ Events
- `update:modelValue` : Émis lors de la saisie ou du changement de valeur
- `blur` : Émis quand le champ perd le focus
- `focus` : Émis quand le champ reçoit le focus

### 💡 Notes pratiques
- `type="textarea"` affiche un champ de texte multilignes.
- `type="file"` supporte `multiple` et `accept`.
- Pour un radio, utilisez `value` pour définir la valeur de l'option.
- `customClass` ajoute des classes CSS au conteneur du composant.

#### 1️⃣ Texte Simple
```html
<script setup>
import { ref } from 'vue'
const username = ref('')
</script>

<template>
  <BaseInput 
    v-model="username"
    type="text"
    label="Nom d'utilisateur"
    placeholder="Entrez votre nom"
  />
</template>
```

#### 2️⃣ Email
```html
<script setup>
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <BaseInput 
    v-model="email"
    type="email"
    label="Email"
    placeholder="votre@email.com"
    icon="fa fa-envelope"
  />
</template>
```

#### 3️⃣ Mot de Passe
```html
<script setup>
import { ref } from 'vue'
const password = ref('')
</script>

<template>
  <BaseInput 
    v-model="password"
    type="password"
    label="Mot de passe"
    icon="fa fa-lock"
  />
</template>
```

#### 4️⃣ Nombre
```html
<script setup>
import { ref } from 'vue'
const quantity = ref(0)
</script>

<template>
  <BaseInput 
    v-model="quantity"
    type="number"
    label="Quantité"
    placeholder="0"
  />
</template>
```

#### 5️⃣ Avec Validation & Erreur
```html
<script setup>
import { ref } from 'vue'
const username = ref('')
const error = ref('')

const validateUsername = () => {
  if (username.value.length < 3) {
    error.value = 'Min 3 caractères'
  } else {
    error.value = ''
  }
}
</script>

<template>
  <BaseInput 
    v-model="username"
    label="Username"
    :error="error"
    @blur="validateUsername"
  />
</template>
```

#### 6️⃣ Requis & Requis avec Erreur
```html
<script setup>
import { ref } from 'vue'
const name = ref('')
const nameError = ref('')
</script>

<template>
  <BaseInput 
    v-model="name"
    label="Nom"
    required
    :error="nameError"
    placeholder="Obligatoire"
  />
</template>
```

#### 7️⃣ Note d'aide sous le champ
```html
<script setup>
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <BaseInput
    v-model="email"
    type="email"
    label="Email"
    placeholder="votre@email.com"
    helper="Nous n'utiliserons cette adresse que pour la notification."
  />
</template>
```

#### 8️⃣ Readonly / Disabled
```html
<BaseInput 
  v-model="value"
  label="ID (lecture seule)"
  readonly
  value="12345"
/>

<BaseInput 
  v-model="value"
  label="Indisponible"
  disabled
/>
```

#### 9️⃣ Avec Icônes (Gauche + Droite)
```html
<script setup>
import { ref } from 'vue'
const search = ref('')
</script>

<template>
  <BaseInput 
    v-model="search"
    type="text"
    label="Rechercher"
    placeholder="Tapez..."
    icon="fa fa-search"
    iconRight="fa fa-times"
  />
</template>
```

#### 1️⃣0️⃣ Textarea
```html
<script setup>
import { ref } from 'vue'
const comment = ref('')
</script>

<template>
  <BaseInput 
    v-model="comment"
    type="textarea"
    label="Commentaire"
    placeholder="Entrez votre message..."
  />
</template>
```

#### 🔟 File Upload (Single)
```html
<script setup>
import { ref } from 'vue'
const file = ref(null)
</script>

<template>
  <BaseInput 
    v-model="file"
    type="file"
    label="Télécharger une photo"
    accept=".jpg,.jpeg,.png"
  />
</template>
```

#### 1️⃣1️⃣ File Upload (Multiple)
```html
<script setup>
import { ref } from 'vue'
const files = ref([])
</script>

<template>
  <BaseInput 
    v-model="files"
    type="file"
    label="Télécharger plusieurs fichiers"
    accept=".pdf,.doc,.docx"
    multiple
  />
</template>
```

#### 1️⃣2️⃣ Checkbox
```html
<script setup>
import { ref } from 'vue'
const termsAccepted = ref(false)
</script>

<template>
  <BaseInput 
    v-model="termsAccepted"
    type="checkbox"
    label="J'accepte les conditions"
    value="true"
  />
</template>
```

#### 1️⃣3️⃣ Radio Group
```html
<script setup>
import { ref } from 'vue'
const gender = ref('')
</script>

<template>
  <div>
    <p>Genre:</p>
    <BaseInput 
      v-model="gender"
      type="radio"
      label="Homme"
      value="male"
    />
    <BaseInput 
      v-model="gender"
      type="radio"
      label="Femme"
      value="female"
    />
    <BaseInput 
      v-model="gender"
      type="radio"
      label="Autre"
      value="other"
    />
  </div>
</template>
```

#### 1️⃣4️⃣ Checkbox Multi-Select (Tableau)
```html
<script setup>
import { ref } from 'vue'
const selectedItems = ref([])
const availableItems = [
  { id: 1, name: 'Option 1' },
  { id: 2, name: 'Option 2' },
  { id: 3, name: 'Option 3' }
]
</script>

<template>
  <div>
    <p>Sélectionnez plusieurs éléments:</p>
    <BaseInput 
      v-for="item in availableItems"
      :key="item.id"
      v-model="selectedItems"
      type="checkbox"
      :label="item.name"
      :value="item"
    />
    <p>Éléments sélectionnés: {{ selectedItems.length }}</p>
  </div>
</template>
```

**Fonctionnement:**
- Quand `modelValue` est un tableau et `type="checkbox"`, chaque checkbox ajoute/retire son `value` du tableau.
- Si le `value` est un objet, il est ajouté ou retiré du tableau par comparaison JSON.
- Idéal pour les formulaires multi-sélection!

#### Color
```html
<script setup>
import { ref } from 'vue'
const color = ref('')
</script>

<template>
  <div>
    <BaseInput 
      v-model="color"
      type="color"
      label="Color"
    />
  </div>
</template>
```

#### 1️⃣5️⃣ Classe Personnalisée
```html
<BaseInput 
  v-model="name"
  label="Nom"
  customClass="w-full bg-gray-100"
/>
```

---
