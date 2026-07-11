## 💡 Tips & Tricks

### ✅ Validation Locale
```html
<script setup>
import { ref } from 'vue'

const email = ref('')
const emailError = ref('')

const validateEmail = () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email.value)) {
    emailError.value = 'Email invalide'
  } else {
    emailError.value = ''
  }
}
</script>

<template>
  <BaseInput 
    v-model="email"
    type="email"
    label="Email"
    :error="emailError"
    @blur="validateEmail"
  />
</template>
```

### ✅ Chargement d'API
```html
<script setup>
import { ref, onMounted } from 'vue'

const data = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/api/data')
    data.value = await res.json()
  } finally {
    loading.value = false
  }
})
</script>
```

### ✅ Disabled Conditionnel
```html
<BaseButton 
  label="Enregistrer"
  :disabled="!form.name || !form.email"
/>
```

---
