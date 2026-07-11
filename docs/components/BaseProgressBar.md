## 📊 BaseProgressBar

`BaseProgressBar` facilite l'affichage d'une barre de progression avec des logs en dessous. Il est conçu pour les workflows d'import, de traitement ou de reset où l'utilisateur doit suivre l'état de l'opération.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `Number` | `0` | Valeur de progression entre 0 et `max` |
| `label` | `String` | `''` | Titre de la barre de progression |
| `variant` | `String` | `primary` | Couleur : `primary`, `success`, `danger`, `warning`, `secondary` |
| `logs` | `Array` | `[]` | Liste de messages de log affichés sous la barre |
| `showLogs` | `Boolean` | `true` | Affiche ou masque la zone de logs |
| `max` | `Number` | `100` | Valeur maximale de progression |

### Exemple simple

```html
<BaseProgressBar
  label="Import des données"
  :value="45"
  variant="primary"
/>
```

### Exemple avec logs

```html
<BaseProgressBar
  label="Chargement"
  :value="82"
  variant="success"
  :logs="[
    'Initialisation du traitement...',
    'Analyse des fichiers CSV...',
    'Création des ressources...'
  ]"
/>
```

### Utilisation dans une modal

```html
<BaseModal title="Traitement" v-model="modalOpen">
  <BaseProgressBar
    label="Mise à jour"
    :value="progress"
    variant="primary"
    :logs="progressLogs"
  />

  <template #footer>
    <BaseButton label="Fermer" variant="secondary" @click="modalOpen = false" />
  </template>
</BaseModal>
```
