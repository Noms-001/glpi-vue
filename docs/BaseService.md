# Guide d'utilisation de BaseService

## Vue d'ensemble

`BaseService` est une classe de base qui fournit des méthodes standardisées pour interagir avec une API REST. Elle gère les opérations CRUD (Create, Read, Update, Delete) de manière générique pour n'importe quel modèle de données.

## Installation et initialisation

### Créer un service personnalisé

```javascript
import BaseService from '@/services/BaseService'
import MonModele from '@/models/MonModele'

// Créer une instance du service pour votre modèle
export const monService = new BaseService(MonModele)
```

### Utiliser un service existant

```javascript
import { assetService } from '@/services/BaseService'

// Le service est déjà instancié pour les Assets
```

## Méthodes principales

### 1. `getAll(params = {})`

Récupère tous les éléments de la ressource.

**Paramètres:**
- `params` (object) - Paramètres de requête optionnels pour filtrer/paginer

**Retour:**
- `Promise<any[]>` - Tableau d'objets du modèle

**Exemples:**

```javascript
// Récupérer tous les éléments
const assets = await assetService.getAll()

// Avec paramètres de filtrage
const activeAssets = await assetService.getAll({
  status: 'active',
  page: 1,
  limit: 10
})

// Les données sont automatiquement converties en instances du modèle
console.log(assets[0] instanceof Asset) // true
```

---

### 2. `getById(id)`

Récupère un élément spécifique par son ID.

**Paramètres:**
- `id` (string|number) - L'identifiant unique de l'élément **[Obligatoire]**

**Retour:**
- `Promise<Model>` - L'objet du modèle

**Exceptions:**
- Lance une erreur si `id` n'est pas fourni

**Exemples:**

```javascript
// Récupérer un asset par ID
const asset = await assetService.getById(5)
console.log(asset.name) // Accéder aux propriétés

// Avec variable dynamique
const userId = 123
const user = await userService.getById(userId)

// Gestion d'erreur
try {
  const asset = await assetService.getById(null) // Lance une erreur
} catch (error) {
  console.error('ID requis:', error.message)
}
```

---

### 3. `create(data)`

Crée un nouvel élément.

**Paramètres:**
- `data` (object | Model) - Les données à créer. Peut être :
  - Un objet JavaScript simple
  - Une instance du modèle

**Retour:**
- `Promise<any>` - La réponse du serveur

**Exemples:**

```javascript
// Avec un objet simple
const newAsset = await assetService.create({
  name: 'Mon nouvel asset',
  type: 'computer',
  status: 'active'
})

// Avec une instance du modèle
const asset = new Asset({
  name: 'Asset via instance',
  type: 'monitor'
})
const result = await assetService.create(asset)

// Le service gère automatiquement la conversion
// - Si c'est une instance du modèle, il utilise .toJson()
// - Si c'est un objet simple, il l'utilise directement
```

---

### 4. `update(id, data)`

Met à jour un élément existant.

**Paramètres:**
- `id` (string|number) - L'identifiant de l'élément à mettre à jour **[Obligatoire]**
- `data` (object | Model) - Les données à mettre à jour

**Retour:**
- `Promise<any>` - La réponse du serveur

**Exceptions:**
- Lance une erreur si `id` n'est pas fourni

**Exemples:**

```javascript
// Mise à jour avec objet simple
const result = await assetService.update(5, {
  name: 'Nom modifié',
  status: 'inactive'
})

// Mise à jour avec instance du modèle
const asset = new Asset({ name: 'Nouvel asset' })
await assetService.update(5, asset)

// Récupérer, modifier, puis mettre à jour
const asset = await assetService.getById(5)
asset.name = 'Nouveau nom'
await assetService.update(5, asset)

// Erreur si ID manquant
try {
  await assetService.update(null, { name: 'Test' })
} catch (error) {
  console.error('ID requis:', error.message)
}
```

---

### 5. `delete(id, force = false)`

Supprime un élément par son ID.

**Paramètres:**
- `id` (string|number) - L'identifiant de l'élément à supprimer **[Obligatoire]**
- `force` (boolean) - Force la suppression permanente (default: false)

**Retour:**
- `Promise<any>` - La réponse du serveur

**Exceptions:**
- Lance une erreur si `id` n'est pas fourni

**Exemples:**

```javascript
// Suppression simple
await assetService.delete(5)

// Suppression forcée (purge)
await assetService.delete(5, true)

// Avec paramètre nommé
await assetService.delete(5, { force: true })

// Gestion d'erreur
try {
  await assetService.delete(null)
} catch (error) {
  console.error('Erreur:', error.message)
}
```

---

### 6. `deleteAll(params = {})`

Supprime plusieurs éléments en fonction de critères.

**Paramètres:**
- `params` (object) - Options de suppression :
  - `ids` (number[]) - Tableau d'IDs à supprimer
  - `from` (number|null) - Supprimer à partir de cet ID
  - `to` (number|null) - Supprimer jusqu'à cet ID
  - `force` (boolean) - Force la suppression permanente

**Retour:**
- `Promise<any[]>` - Tableau des réponses pour chaque suppression

**Exceptions:**
- Lance une erreur s'il n'y a aucun élément à supprimer

**Exemples:**

```javascript
// Supprimer des IDs spécifiques
await assetService.deleteAll({
  ids: [1, 2, 3, 5]
})

// Supprimer une plage d'IDs
await assetService.deleteAll({
  from: 10,
  to: 20  // Supprime les IDs de 10 à 20
})

// Supprimer à partir d'un ID
await assetService.deleteAll({
  from: 100  // Supprime les IDs >= 100
})

// Supprimer jusqu'à un ID
await assetService.deleteAll({
  to: 50  // Supprime les IDs <= 50
})

// Combinaison : IDs spécifiques + plage
await assetService.deleteAll({
  ids: [1, 2, 3],
  from: 100,
  to: 110,
  force: true  // Suppression forcée
})

// Supprimer tous (pas de paramètre = erreur)
// Cette approche lève une erreur car aucun critère n'est fourni
try {
  await assetService.deleteAll({})
} catch (error) {
  console.error('Erreur:', error.message) // "Aucun élément à supprimer"
}
```

---

## Patterns d'utilisation courants

### Utilisation dans un composant Vue

```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { assetService } from '@/services/BaseService'

const assets = ref([])
const loading = ref(false)

// Charger tous les assets au montage du composant
onMounted(async () => {
  loading.value = true
  try {
    assets.value = await assetService.getAll()
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  } finally {
    loading.value = false
  }
})

// Ajouter un nouvel asset
const addAsset = async (data) => {
  try {
    await assetService.create(data)
    assets.value = await assetService.getAll() // Rafraîchir la liste
  } catch (error) {
    console.error('Erreur lors de la création:', error)
  }
}

// Supprimer un asset
const removeAsset = async (id) => {
  if (confirm('Êtes-vous sûr ?')) {
    try {
      await assetService.delete(id)
      assets.value = assets.value.filter(a => a.id !== id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}
</script>
```

### Chaînage d'opérations

```javascript
// Récupérer, modifier, puis sauvegarder
const updateAssetName = async (id, newName) => {
  const asset = await assetService.getById(id)
  asset.name = newName
  return await assetService.update(id, asset)
}

// Créer puis récupérer
const createAndFetch = async (data) => {
  const response = await assetService.create(data)
  return await assetService.getById(response.id)
}
```

### Traitement par lot

```javascript
// Créer plusieurs assets
const createMultiple = async (dataArray) => {
  return Promise.all(
    dataArray.map(data => assetService.create(data))
  )
}

// Mettre à jour plusieurs assets
const updateMultiple = async (updates) => {
  return Promise.all(
    updates.map(({ id, data }) => assetService.update(id, data))
  )
}

// Supprimer plusieurs assets
const deleteMultiple = async (ids) => {
  return assetService.deleteAll({ ids })
}
```

---

## Gestion des erreurs

```javascript
try {
  const asset = await assetService.getById(999)
} catch (error) {
  console.error('Type d\'erreur:', error.message)
  
  if (error.response?.status === 404) {
    console.log('Asset non trouvé')
  } else if (error.response?.status === 500) {
    console.log('Erreur serveur')
  } else {
    console.log('Erreur réseau ou autre')
  }
}
```

---

## Notes importantes

1. **Conversion automatique des données**: BaseService convertit automatiquement les données JSON en instances du modèle via les méthodes `fromArray()` et `fromJson()`

2. **Paramètres optionnels**: Les paramètres sont généralement flexibles :
   - `create()` accepte un objet simple ou une instance du modèle
   - `update()` accepte un objet simple ou une instance du modèle

3. **Validation des IDs**: Les méthodes `getById()`, `update()` et `delete()` valident que l'ID est fourni

4. **Gestion des ressources**: Chaque instance de BaseService est liée à une ressource spécifique définie dans le modèle (`Model.resource`)

5. **Promise-based**: Toutes les méthodes sont asynchrones et retournent des Promises
