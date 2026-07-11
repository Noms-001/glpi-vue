<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { login } from '../../api/auth.js'
import { useTheme } from '../../composables/useTheme.js'

const UNIQUE_CODE = '1234'
const router = useRouter()
const password = ref(UNIQUE_CODE)
const errorMessage = ref('')
const isLoading = ref(false)
const { theme, toggleTheme } = useTheme()

const handleLogin = async () => {
  errorMessage.value = ''

  if (!password.value || password.value.trim() === '') {
    errorMessage.value = "Veuillez entrer votre code d'accès"
    return
  }

  if (password.value !== UNIQUE_CODE) {
    errorMessage.value = 'Mot de passe incorrect'
    password.value = ''
    return
  }

  try {
    isLoading.value = true
    await login()
    router.push('/backoffice/tickets')
  } catch (error) {
    errorMessage.value = 'Erreur lors de la connexion. Veuillez réessayer.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-frame">
      <div class="auth-card fade-in">
      
        <div class="auth-utilities">
          <BaseButton type="button" variant="secondary" @click="toggleTheme" customClass="auth-theme-toggle">
            <i :class="theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun-fill'"></i>
          </BaseButton>
        </div>
        <div class="auth-card-head">
          <img src="../../assets/logo.png" alt="GLPI Logo" class="auth-logo" />
          <div>
            <span class="auth-label">GLPI Modern</span>
            <p class="auth-intro">Connexion sécurisée au tableau de bord.</p>
          </div>
        </div>

        <div class="auth-copy">
          <p class="eyebrow">Accès back-office</p>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <BaseInput
            v-model="password"
            type="password"
            label="Code d'accès"
            placeholder="••••••••"
            :error="errorMessage"
            :disabled="isLoading"
          />

          <BaseButton type="submit" :loading="isLoading" :disabled="isLoading" customClass="w-100">
            Connexion
          </BaseButton>
        </form>

        <div class="auth-footer-note">
          <span>© 2026 GLPI Dashboard</span>
          <small>Vue 3 & Bootstrap 5 • Design moderne</small>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.12), transparent 24%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.08), transparent 30%),
    var(--bg-color);
}

.auth-frame {
  width: min(530px, 100%);
}

.auth-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-xl);
  padding: 2rem;
}

.auth-card-head {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.75rem;
}

.auth-logo {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  object-fit: cover;
  background: var(--bg-color);
  padding: 0.5rem;
}

.auth-label {
  display: inline-flex;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-color);
}

.auth-intro {
  margin: 0.25rem 0 0;
  color: var(--text-muted-custom);
  font-size: 0.95rem;
}

.auth-copy {
  margin-bottom: 1.75rem;
}

.auth-utilities {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.auth-theme-toggle {
  justify-content: center;
  padding: 0.5rem 1rem;
}

.auth-copy .eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.82rem;
}

.auth-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 2.5vw, 2.5rem);
}

.auth-copy p {
  color: var(--text-muted-custom);
  margin-top: 0.85rem;
  line-height: 1.75;
}

.auth-form {
  display: grid;
  gap: 1.25rem;
}

.auth-footer-note {
  margin-top: 1.75rem;
  color: var(--text-muted-custom);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.92rem;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 1.5rem;
  }

  .auth-copy h1 {
    font-size: 2rem;
  }
}
</style>
