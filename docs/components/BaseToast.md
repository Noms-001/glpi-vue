# BaseToast

## Méthodes disponibles

| Méthode                          | Paramètres                               | Description                      |
| -------------------------------- | ---------------------------------------- | -------------------------------- |
| `showSuccess(message, duration)` | `message: string`<br>`duration?: number` | Affiche un toast de succès       |
| `showError(message, duration)`   | `message: string`<br>`duration?: number` | Affiche un toast d'erreur        |
| `showInfo(message, duration)`    | `message: string`<br>`duration?: number` | Affiche un toast d'information   |
| `showWarning(message, duration)` | `message: string`<br>`duration?: number` | Affiche un toast d'avertissement |

## Paramètres

| Paramètre  | Type     | Défaut | Description                        |
| ---------- | -------- | ------ | ---------------------------------- |
| `message`  | `string` | -      | Message à afficher dans le toast   |
| `duration` | `number` | `5000` | Durée d'affichage en millisecondes |

Le composable `useToast` permet d'afficher facilement des notifications (toasts) dans n'importe quel composant de l'application.

## Notes

* Le paramètre `duration` est optionnel.
* Si aucune durée n'est fournie, le toast disparaît automatiquement après **5 secondes**.
* Les notifications sont affichées en haut à droite de l'écran.
* Plusieurs notifications peuvent être affichées simultanément.
* Un clic sur une notification permet de la fermer immédiatement.

## Import

```js
import { useToast } from '@/composables/useToast'

const { showSuccess, showError, showInfo, showWarning } = useToast()
```

## Exemples d'utilisation

### Toast de succès

```js
showSuccess('Import terminé avec succès.')
```

### Toast d'erreur

```js
showError('Une erreur est survenue lors de l’import.')
```

### Toast d'information

```js
showInfo('Les données sont en cours de traitement.')
```

### Toast d'avertissement

```js
showWarning('Suppression en cours...', 3000)
```

### Exemple complet

```js
import { useToast } from '@/composables/useToast'

const { showSuccess, showError } = useToast()

const saveData = async () => {
  try {
    await api.save()

    showSuccess('Données enregistrées avec succès.')
  } catch (error) {
    showError('Impossible d’enregistrer les données.')
  }
}
```