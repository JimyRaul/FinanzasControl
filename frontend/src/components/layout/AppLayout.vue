<template>
  <div class="app-dark layout-wrapper">
    <!-- ── Overlay backdrop (mobile) ── -->
    <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false"></div>

    <!-- ── Sidebar ── -->
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar-header">
        <i class="pi pi-wallet sidebar-logo"></i>
        <span class="sidebar-title">FinanzasControl</span>
        <!-- Botón cerrar en móvil -->
        <button class="sidebar-close" @click="sidebarOpen = false">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
          @click="sidebarOpen = false"
        >
          <i :class="['pi', item.icon]"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <span class="text-muted" style="font-size:0.75rem">v1.0.0</span>
      </div>
    </aside>

    <!-- ── Main ── -->
    <div class="layout-main">
      <!-- Topbar móvil -->
      <header class="mobile-topbar">
        <button class="hamburger" @click="sidebarOpen = true">
          <i class="pi pi-bars"></i>
        </button>
        <div class="topbar-brand">
          <i class="pi pi-wallet" style="color:var(--fc-primary)"></i>
          <span>FinanzasControl</span>
        </div>
      </header>

      <main class="main-content">
        <RouterView />
      </main>
    </div>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const route      = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { path: '/',              icon: 'pi-home',        label: 'Dashboard'     },
  { path: '/transacciones', icon: 'pi-arrows-h',    label: 'Transacciones' },
  { path: '/cuentas',       icon: 'pi-credit-card', label: 'Cuentas'       },
  { path: '/categorias',    icon: 'pi-tag',         label: 'Categorías'    },
]
</script>

<style scoped>
/* ── Layout raíz ─────────────────────────────────────────── */
.layout-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Sidebar ─────────────────────────────────────────────── */
.sidebar {
  width: var(--fc-sidebar-width);
  min-width: var(--fc-sidebar-width);
  background: var(--fc-surface);
  border-right: 1px solid var(--fc-border);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
  box-shadow: 4px 0 20px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
  z-index: 200;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid var(--fc-border);
}

.sidebar-logo  { font-size: 1.5rem; color: var(--fc-primary); }
.sidebar-title { font-size: 1rem; font-weight: 700; flex: 1; letter-spacing: -0.3px; }

.sidebar-close {
  display: none;
  background: none;
  border: none;
  color: var(--fc-text-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--fc-radius-sm);
  color: var(--fc-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover { background: var(--fc-surface-2); color: var(--fc-text); }
.nav-item.active { background: rgba(99,102,241,0.15); color: var(--fc-primary-light); }
.nav-item.active i { color: var(--fc-primary); }

.sidebar-footer {
  padding: 1rem 1.25rem 0;
  border-top: 1px solid var(--fc-border);
  margin-top: auto;
}

/* ── Main content ────────────────────────────────────────── */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: var(--fc-bg);
}

/* ── Topbar móvil (oculta en desktop) ────────────────────── */
.mobile-topbar {
  display: none;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: var(--fc-surface);
  border-bottom: 1px solid var(--fc-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.hamburger {
  background: none;
  border: none;
  color: var(--fc-text);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
}

/* ── Backdrop ────────────────────────────────────────────── */
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 150;
  backdrop-filter: blur(2px);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .layout-wrapper {
    flex-direction: column;
  }

  /* Sidebar se convierte en drawer */
  .sidebar {
    position: fixed;
    inset-block: 0;
    left: 0;
    transform: translateX(-100%);
    height: 100dvh;
    z-index: 200;
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-close { display: block; }

  .sidebar-backdrop {
    display: block;
  }

  /* Mostrar topbar */
  .mobile-topbar {
    display: flex;
  }

  /* Padding reducido en móvil */
  .main-content {
    padding: 1rem;
  }
}
</style>
