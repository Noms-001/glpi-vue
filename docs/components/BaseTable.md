# 📊 BaseTable

---

# ⚙️ Props

| Prop          | Type                    | Défaut  | Description                                 |
| ------------- | ----------------------- | ------- | ------------------------------------------- |
| `items`       | Array                   | `[]`    | Données du tableau                          |
| `columns`     | Array                   | `[]`    | Configuration des colonnes                  |
| `pageSize`    | Number                  | `10`    | Nombre de lignes par page                   |
| `searchable`  | Boolean                 | `true`  | Active la recherche                         |
| `sortable`    | Boolean                 | `true`  | Active le tri                               |
| `loading`     | Boolean                 | `false` | Affiche l'état de chargement                |
| `customClass` | String | Array | Object | `''`    | Classes CSS supplémentaires                 |
| `onRowClick`  | Function                | `null`  | Callback exécuté lors du clic sur une ligne |
| `multiSelect` | Boolean                 | `false` | Active la sélection multiple des lignes     |
| `selectedItems` | Array                 | `[]`    | Tableau des items sélectionnés (v-model)    |

---

### ⚡ Events
- `update:selectedItems` : Émis quand une sélection change (lors de l'activation de multiSelect)

---

# 🚀 Démarrage rapide

## Données sous forme d'objets

```html
<script setup>
import { ref } from 'vue'

const users = ref([
  { id: 1, name: 'Jean' },
  { id: 2, name: 'Marie' }
])
</script>

<template>
  <BaseTable
    :items="users"
    :columns="[
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nom' }
    ]"
  />
</template>
```

---

## Données sous forme de tableau

```html
<script setup>
import { ref } from 'vue'

const users = ref([
  ['Marie', 15],
  ['Jose', 18]
])
</script>

<template>
  <BaseTable
    :items="users"
    :columns="['Nom', 'Age']"
  />
</template>
```

---

# 📑 Configuration des colonnes

## Colonne simple

```js
{
  key: 'name',
  label: 'Nom'
}
```

---

## Colonne calculée

Aucune propriété `key` n'est nécessaire.

```js
{
  label: 'Nom complet',
  formatter: (value, item) =>
    `${item.firstName} ${item.lastName}`
}
```

---

## Référence complète

```js
{
  key: 'status',
  label: 'Statut',

  badge: false,

  badgeVariant: 'primary',

  badgeColor: '#e3f2fd',
  badgeTextColor: '#1976d2',

  total: false,

  footer: 'TOTAL',

  totalFormatter: total => total,

  formatter: value => value,

  onClick: (value, item, event) => {}
}
```

---

# 🎨 Formatter

Permet de modifier l'affichage d'une cellule.

## Signature

```js
formatter(value)
```

ou

```js
formatter(value, item)
```

### Paramètres

| Paramètre | Description               |
| --------- | ------------------------- |
| `value`   | Valeur de la cellule      |
| `item`    | Objet complet de la ligne |

---

## Exemple simple

```js
{
  key: 'price',
  label: 'Prix',
  formatter: value => `${value} Ar`
}
```

---

## Exemple avec accès à la ligne

```js
{
  label: 'Montant',
  formatter: (value, item) => item.quantity * item.price
}
```

---

## Formatage de date

```js
{
  key: 'created_at',
  label: 'Créé le',
  formatter: value => new Date(value).toLocaleDateString()
}
```

---

## Valeur conditionnelle

```js
{
  key: 'status',
  formatter: value => value === 'active' ? 'Actif' : 'Inactif'
}
```

---

# 🏷️ Badges

## Badge simple

```js
{
  key: 'status',
  label: 'Statut',
  badge: true
}
```

---

## Badge Bootstrap

```js
{
  key: 'status',
  badge: true,
  badgeVariant: 'success'
}
```

---

## Badge dynamique

```js
{
  key: 'status',
  badge: true,
  badgeVariant: value =>
    value === 'Résolu'
      ? 'success'
      : 'warning'
}
```

---

## Badge dynamique avec accès à la ligne

```js
{
  key: 'status',
  badge: true,
  badgeVariant: (value, item) => {
    if (item.priority === 'Urgent') {
      return 'danger'
    }

    return 'primary'
  }
}
```

---

## Badge personnalisé

```js
{
  key: 'status',
  badge: true,
  badgeColor: '#e3f2fd',
  badgeTextColor: '#1976d2'
}
```

---

# 🖱️ Gestion des clics

## Clic sur une ligne

```html
<BaseTable
  :items="users"
  :columns="columns"
  :onRowClick="showUser"
/>
```

```js
const showUser = item => {
  console.log(item)
}
```

---

### Éléments ignorés automatiquement

Le clic sur la ligne n'est pas déclenché pour :

* `button`
* `input`
* `select`
* `textarea`
* `a`
* `.no-row-click`

---

## Clic sur une cellule

Signature :

```js
onClick(value)
```

ou

```js
onClick(value, item)
```

ou

```js
onClick(value, item, event)
```

Exemple :

```js
{
  key: 'name',
  label: 'Nom',
  onClick: (value, item) => {
    console.log(value)
    console.log(item)
  }
}
```

Le composant exécute automatiquement :

```js
event.stopPropagation()
```

Le clic de ligne n'est donc pas déclenché.

---

# 🧩 Slots

Utilisez un slot lorsque vous avez besoin d'un rendu Vue personnalisé.

Nom du slot :

```text
cell-<key>
```

---

## Exemple

```js
{
  key: 'actions',
  label: 'Actions'
}
```

```html
<template #cell-actions="{ item }">
  <BaseButton
    label="Modifier"
    @click="edit(item)"
  />
</template>
```

---

## Variables disponibles

```html
<template #cell-actions="{ item, value, column }">
```

| Variable | Description                 |
| -------- | --------------------------- |
| `item`   | Objet complet               |
| `value`  | Valeur de la cellule        |
| `column` | Configuration de la colonne |

---

# 📈 Totaux

## Somme automatique

```js
{
  key: 'quantity',
  label: 'Quantité',
  total: true
}
```

---

## Texte personnalisé dans le footer

```js
{
  key: 'name',
  footer: 'TOTAL'
}
```

---

## Formatage du total

```js
{
  key: 'price',
  total: true,
  totalFormatter: total =>
    `${total.toLocaleString()} Ar`
}
```

---

# 📋 Cas d'usage courants

## Multi-Select avec actions groupées

```html
<script setup>
import { ref } from 'vue'
import BaseTable from '@/components/base/BaseTable.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const users = ref([
  { id: 1, name: 'Jean', email: 'jean@example.com' },
  { id: 2, name: 'Marie', email: 'marie@example.com' },
  { id: 3, name: 'Pierre', email: 'pierre@example.com' }
])

const selectedUsers = ref([])

const deleteSelected = async () => {
  // Effectuer une action sur selectedUsers
  console.log('Supprimer:', selectedUsers.value)
  selectedUsers.value = []
}
</script>

<template>
  <div>
    <BaseButton 
      v-if="selectedUsers.length > 0"
      label="Supprimer la sélection"
      variant="danger"
      @click="deleteSelected"
    />
    
    <BaseTable
      :items="users"
      multiSelect
      v-model:selectedItems="selectedUsers"
      :columns="[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' }
      ]"
    />
    
    <p>{{ selectedUsers.length }} utilisateur(s) sélectionné(s)</p>
  </div>
</template>
```

**Fonctionnement:**
- `multiSelect="true"` affiche une colonne de checkboxes en première position
- `v-model:selectedItems` synchronise le tableau des items sélectionnés
- Une checkbox "Sélectionner tous" dans le header permet de cocher/décocher tous les items visibles
- Chaque ligne peut être cochée/décochée individuellement

---

## CRUD classique

```html
<BaseTable
  :items="users"
  searchable
  sortable
>
  <template #cell-actions="{ item }">
    <BaseButton
      label="Modifier"
      @click="edit(item)"
    />

    <BaseButton
      label="Supprimer"
      variant="danger"
      @click="remove(item)"
    />
  </template>
</BaseTable>
```

---

## Liste de tickets

```html
<BaseTable
  :items="tickets"
  :columns="[
    { key: 'id', label: 'ID' },

    {
      key: 'status',
      label: 'Statut',
      badge: true,
      badgeVariant: value => ({
        Nouveau: 'primary',
        'En cours': 'warning',
        Résolu: 'success',
        Fermé: 'secondary'
      })[value]
    }
  ]"
/>
```

---

## Tableau financier

```html
<BaseTable
  :items="payments"
  :columns="[
    {
      key: 'amount',
      label: 'Montant',
      total: true,

      formatter: value =>
        `${value.toLocaleString()} Ar`,

      totalFormatter: total =>
        `${total.toLocaleString()} Ar`
    }
  ]"
/>
```

---

## Navigation vers une page détail

```html
<BaseTable
  :items="products"
  :columns="columns"
  :onRowClick="item =>
    router.push(`/products/${item.id}`)"
/>
```

---

## Select dans une cellule

```html
<template #cell-status="{ item }">
  <BaseSelect
    v-model="item.status"
    :options="statuses"
    optionLabel="label"
    optionValue="value"
  />
</template>
```

---

## Loader

```html
<BaseTable
  :items="users"
  :columns="columns"
  :loading="loading"
/>
```

---

# 💡 Bonnes pratiques

### Utiliser `formatter`

Pour :

* formater une date
* ajouter une devise
* transformer une valeur
* calculer un affichage simple

```js
formatter: value => `${value} Ar`
```

---

### Utiliser un slot

Pour :

* boutons
* images
* composants Vue
* formulaires
* menus d'action

```html
<template #cell-actions>
```

---

### Utiliser `onRowClick`

Pour :

* ouvrir une page détail
* afficher une modal
* sélectionner une ligne

---

### Utiliser `column.onClick`

Pour :

* une action spécifique sur une cellule
* éviter le clic de ligne
