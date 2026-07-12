<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { login } from '../../api/auth.js'
import { useTheme } from '../../composables/useTheme.js'

const UNIQUE_CODE = '1234'
const router = useRouter()
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const { theme, toggleTheme } = useTheme()
const mounted = ref(false)

onMounted(() => {
  // Animation d'entrée
  setTimeout(() => {
    mounted.value = true
  }, 100)
})

const handleLogin = async () => {
  errorMessage.value = ''

  if (!password.value || password.value.trim() === '') {
    errorMessage.value = "Veuillez entrer votre code d'accès"
    return
  }

  if (password.value !== UNIQUE_CODE) {
    errorMessage.value = 'Code d\'accès incorrect'
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
  <div class="login-page" :class="{ 'login-loaded': mounted }">
    <!-- Fond décoratif -->
    <div class="login-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Contenu principal -->
    <div class="login-container">
      <div class="login-card">
        <!-- En-tête -->
        <div class="login-header">
          <div class="brand-wrapper">
            <div class="brand-icon">
              <img src="../../assets/logo.png" alt="GLPI Logo" class="brand-logo" />
            </div>
            <div class="brand-info">
              <h1 class="brand-name">GLPI Admin</h1>
              <p class="brand-subtitle">Gestion de parc informatique</p>
            </div>
          </div>
          
          <button 
            class="theme-toggle-btn" 
            @click="toggleTheme" 
            :title="theme === 'light' ? 'Mode sombre' : 'Mode clair'"
          >
            <i :class="theme === 'light' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'"></i>
          </button>
        </div>

        <!-- Séparateur -->
        <div class="divider">
          <span class="divider-text">Accès back-office</span>
        </div>

        <!-- Formulaire -->
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-shield-lock"></i>
              Code d'accès
            </label>
            
            <div class="input-wrapper" :class="{ 'input-error': errorMessage }">
              <i class="bi bi-lock input-icon-left"></i>
              <input 
                v-model="password" 
                type="password" 
                class="form-input"
                placeholder="••••••••"
                :disabled="isLoading"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              />
            </div>
            
            <transition name="error-fade">
              <p v-if="errorMessage" class="error-message">
                <i class="bi bi-exclamation-circle"></i>
                {{ errorMessage }}
              </p>
            </transition>
          </div>

          <BaseButton 
            type="submit" 
            :loading="isLoading" 
            :disabled="isLoading" 
            variant="primary"
            size="lg"
            class="w-100 login-btn"
          >
            <i class="bi bi-box-arrow-in-right me-2"></i>
            Connexion
          </BaseButton>
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <div class="footer-item">
            <i class="bi bi-shield-check"></i>
            <span>Connexion sécurisée</span>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-item">
            <span>© 2026 GLPI Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============ PAGE LAYOUT ============ */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  background: var(--bg);
  opacity: 0;
  transition: opacity 0.6s ease;
}

.login-loaded {
  opacity: 1;
}

/* ============ BACKGROUND ============ */
.login-background {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: var(--brand-green);
  top: -150px;
  right: -100px;
  animation: float-shape 20s ease-in-out infinite;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: var(--accent-orange);
  bottom: -100px;
  left: -100px;
  animation: float-shape 25s ease-in-out infinite reverse;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: var(--primary-color);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float-shape 30s ease-in-out infinite;
}

@keyframes float-shape {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 40px) scale(0.9);
  }
  75% {
    transform: translate(-40px, -20px) scale(1.05);
  }
}

/* ============ CONTAINER ============ */
.login-container {
  width: 100%;
  max-width: 460px;
  position: relative;
  z-index: 1;
}

/* ============ CARD ============ */
.login-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05);
  padding: 2.5rem 2rem;
  backdrop-filter: blur(10px);
  animation: card-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ============ HEADER ============ */
.login-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--brand-green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(14, 59, 54, 0.3);
}

.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0;
}

/* ============ THEME TOGGLE ============ */
.theme-toggle-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--pill-bg);
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.theme-toggle-btn:hover {
  background: var(--brand-green-light);
  color: var(--brand-green);
  transform: rotate(15deg);
}

/* ============ DIVIDER ============ */
.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: var(--card-bg);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ============ FORM ============ */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.01em;
}

.form-label i {
  color: var(--brand-green);
  font-size: 0.95rem;
}

/* ============ INPUT ============ */
.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  height: 52px;
  padding: 0 1rem 0 2.75rem;
  background: var(--bg);
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-main);
  font-family: var(--font-family);
  font-size: 1rem;
  letter-spacing: 0.3em;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: var(--text-muted);
  letter-spacing: 0.3em;
  opacity: 0.6;
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-green);
  box-shadow: 0 0 0 3px rgba(14, 59, 54, 0.1);
  background: var(--card-bg);
}

.input-wrapper.input-error .form-input {
  border-color: var(--danger-color);
}

.input-wrapper.input-error .form-input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon-left {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1rem;
  pointer-events: none;
  transition: color 0.2s ease;
}

.form-input:focus ~ .input-icon-left {
  color: var(--brand-green);
}

/* ============ ERROR ============ */
.error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  padding: 0.35rem 0.75rem;
  background: rgba(239, 68, 68, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.error-message i {
  font-size: 0.85rem;
}

/* ============ BUTTON ============ */
.login-btn {
  height: 52px;
  font-size: 1rem;
  margin-top: 0.5rem;
}

/* ============ FOOTER ============ */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

.footer-item i {
  color: var(--success-color);
  font-size: 0.85rem;
}

.footer-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--border-color);
}

/* ============ TRANSITIONS ============ */
.error-fade-enter-active {
  transition: all 0.3s ease-out;
}

.error-fade-leave-active {
  transition: all 0.2s ease-in;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 3rem;
  }
  
  .login-card {
    padding: 1.75rem 1.25rem;
  }
  
  .brand-name {
    font-size: 1.3rem;
  }
  
  .brand-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }
  
  .brand-logo {
    width: 30px;
    height: 30px;
  }
  
  .form-input {
    height: 48px;
    font-size: 0.95rem;
  }
  
  .login-btn {
    height: 48px;
  }
  
  .login-footer {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .footer-divider {
    display: none;
  }
}
</style>