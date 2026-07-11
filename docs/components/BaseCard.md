## 🃏 BaseCard

`BaseCard` est un composant générique réutilisable pour créer des cartes stat, des cartes de contenu et des compositions libres. Il expose une API simple pour les cas courants et des slots pour les scénarios avancés.

### Principes

- Props simples pour les stat cards et les content cards.
- Slots pour personnaliser l'image, les badges, le titre, le corps, les actions et le footer.
- Variantes visuelles et responsive par défaut.
- Accessible et cohérent avec les autres composants de base.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `String` | `default` | Variantes visuelles disponibles : `default`, `primary`, `secondary`, `success`, `danger` |
| `size` | `String` | `md` | Taille de la carte : `sm`, `md`, `lg` |
| `image` | `String` | `''` | URL de l'image principale |
| `title` | `String` | `''` | Titre principal |
| `subtitle` | `String` | `''` | Sous-titre |
| `description` | `String` | `''` | Texte descriptif |
| `price` | `String` | `''` | Prix affiché |
| `oldPrice` | `String` | `''` | Ancien prix barré |
| `value` | `String \\ Number` | `''` | Valeur principale pour les stat cards |
| `label` | `String` | `''` | Libellé ou catégorie pour les stat cards |
| `icon` | `String` | `''` | Classe d'icône pour afficher une icône dans la stat card |
| `trend` | `String` | `''` | Indicateur de tendance (`+12%`, `-5%`) |
| `trendType` | `String` | `neutral` | Couleur de tendance : `positive`, `negative`, `neutral` |
| `badges` | `Array` | `[]` | Liste de badges. Peut contenir des chaînes ou des objets `{ label, variant, icon }` |
| `actionLabel` | `String` | `''` | Texte du bouton d'action par défaut |
| `actionVariant` | `String` | `primary` | Variante du bouton d'action par défaut |
| `disabled` | `Boolean` | `false` | État désactivé |
| `loading` | `Boolean` | `false` | Affiche un overlay de chargement |
| `customClass` | `String \\ Array \\ Object` | `''` | Classes CSS supplémentaires |

---

## Slots

| Slot | Description |
|---|---|
| `image` | Contenu personnalisé pour la zone image |
| `label` | Remplace le label de la stat card |
| `value` | Remplace la valeur principale |
| `trend` | Remplace l'indicateur de tendance |
| `badges` | Affiche un groupe de badges personnalisé |
| `title` | Contenu du titre personnalisé |
| `subtitle` | Contenu du sous-titre personnalisé |
| `description` | Contenu descriptif personnalisé |
| `actions` | Zone d'actions personnalisées |
| `footer` | Zone de footer personnalisée |
| `default` | Contenu principal libre dans la carte |

---

## Événements

| Événement | Payload | Description |
|---|---|---|
| `click` | `undefined` | Émis lorsque la carte est cliquée (sauf si `disabled` ou `loading`) |
| `actionClick` | `undefined` | Émis lorsque le bouton est cliquée (sauf si `disabled` ou `loading`) |

---

## Exemples

### Stat card simple

```html
<BaseCard value="150" />
```

### Stat card avec label

```html
<BaseCard label="Utilisateurs" value="150" />
```

### Stat card avec icône + tendance

```html
<BaseCard
  label="Tickets ouverts"
  value="42"
  icon="bi bi-ticket-fill"
  trend="+12%"
  trendType="positive"
  badges="[{ label: 'New', variant: 'primary' }]"
/>
```

### Content card produit

```html
<BaseCard
  image="https://via.placeholder.com/400x250"
  title="Casque audio"
  subtitle="Écoute immersive"
  description="Silencieux, confortable et longue autonomie."
  price="79€"
  oldPrice="99€"
  badges="[{ label: 'Promo', variant: 'danger' }, { label: 'Bestseller', variant: 'success' }]"
  actionLabel="Acheter"
  @actionClick="addToCart"
/>
```

### Contenu personnalisé avec slots

```html
<BaseCard>
  <template #image>
    <div class="custom-image">Mon image personnalisée</div>
  </template>

  <template #title>
    <h3>Carte personnalisée</h3>
  </template>

  <template #description>
    <p>Ce contenu est entièrement composé avec des slots.</p>
  </template>

  <template #actions>
    <BaseButton label="Voir" variant="secondary" />
    <BaseButton label="Partager" variant="primary" />
  </template>
</BaseCard>
```

### Boucle de cartes responsive

Pour afficher plusieurs cartes en grille, utilisez la prop `customClass` avec des classes Bootstrap telles que `col-md-4`.

```html
<div class="row">
  <BaseCard
    v-for="item in stats"
    :key="item.id"
    :label="item.label"
    :value="item.value"
    :icon="item.icon"
    customClass="col-md-4"
  />
</div>
```

### Offset Bootstrap avec `customClass`

Vous pouvez également appliquer l'équivalent Bootstrap d'un offset via `offset-md-*` pour centrer ou décaler une carte.

```html
<div class="row">
  <BaseCard
    label="Résumé"
    value="42"
    customClass="col-md-6 offset-md-3"
  />
</div>
```

Ces classes sont transmises directement au container de la carte, ce qui permet de combiner la puissance des helpers Bootstrap avec les cartes personnalisées.

---

## Bonnes pratiques

- Utilisez les props pour des cas simples et les slots pour la composition avancée.
- Les badges maison doivent rester concis et porteurs de sens.
- Préférez `trendType="positive"` ou `trendType="negative"` pour des indicateurs visuels clairs.
- Pour les actions multiples, utilisez le slot `actions` et ajoutez des `BaseButton`.
- N'utilisez pas plus de deux actions principales dans une carte standard.
