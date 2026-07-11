## 🔘 BaseButton

Bouton réutilisable avec variantes, tailles et états.

### ⚙️ Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | String | `''` | Texte du bouton |
| `variant` | String | `'primary'` | `primary` \| `secondary` \| `success` \| `danger` |
| `size` | String | `'md'` | `sm` \| `md` \| `lg` |
| `type` | String | `'button'` | `button` \| `submit` \| `reset` |
| `loading` | Boolean | `false` | Affiche spinner, désactive le bouton |
| `disabled` | Boolean | `false` | Bouton désactivé |
| `icon` | String | `''` | Classe d'icône (ex: `fa fa-trash`) |
| `customClass` | String/Array/Object | `''` | Classes CSS additionnelles |

### 💡 Événement principal
- `@click` fonctionne sur le bouton car l'élément racine est un `<button>`.

### 📋 Quick Copy - Tous les cas d'usage

#### 1️⃣ Bouton Primaire (Standard)
```html
<BaseButton label="Enregistrer" />
```

#### 2️⃣ Bouton Secondaire
```html
<BaseButton label="Annuler" variant="secondary" />
```

#### 3️⃣ Bouton Succès
```html
<BaseButton label="Créer" variant="success" />
```

#### 4️⃣ Bouton Danger
```html
<BaseButton label="Supprimer" variant="danger" />
```

#### 5️⃣ Avec Icône
```html
<BaseButton label="Supprimer" variant="danger" icon="fa fa-trash" />
```

#### 6️⃣ Tailles Différentes
```html
<BaseButton label="Petit" size="sm" />
<BaseButton label="Normal" size="md" />
<BaseButton label="Grand" size="lg" />
```

#### 7️⃣ Chargement
```html
<script setup>
import { ref } from 'vue'
const isLoading = ref(false)

const handleClick = async () => {
  isLoading.value = true
  await new Promise(r => setTimeout(r, 2000))
  isLoading.value = false
}
</script>

<template>
  <BaseButton label="Traiter" :loading="isLoading" @click="handleClick" />
</template>
```

#### 8️⃣ Désactivé
```html
<BaseButton label="Indisponible" disabled />
```

#### 9️⃣ Submit Form
```html
<BaseButton label="Envoyer" type="submit" />
```

#### 🔟 Slot Personnalisé
```html
<BaseButton>
  <span>🚀 Lancer</span>
</BaseButton>
```

#### 🎨 Classes Personnalisées
```html
<BaseButton label="Custom" customClass="ml-2 mt-4" />
```

---
