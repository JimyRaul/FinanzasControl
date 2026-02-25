<template>
  <div class="app-dark layout-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <i class="pi pi-wallet sidebar-logo"></i>
        <span class="sidebar-title">FinanzasControl</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <i :class="['pi', item.icon]"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <span class="text-muted" style="font-size: 0.75rem;">v1.0.0</span>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <RouterView />
    </main>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const route = useRoute()

const navItems = [
  { path: '/',               icon: 'pi-home',        label: 'Dashboard'      },
  { path: '/transacciones',  icon: 'pi-arrows-h',    label: 'Transacciones'  },
  { path: '/cuentas',        icon: 'pi-credit-card', label: 'Cuentas'        },
  { path: '/categorias',     icon: 'pi-tag',         label: 'Categorías'     },
]
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* === Sidebar === */
.sidebar {
  width: var(--fc-sidebar-width);
  min-width: var(--fc-sidebar-width);
  background: var(--fc-surface);
  border-right: 1px solid var(--fc-border);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
  box-shadow: 4px 0 20px rgba(0,0,0,0.2);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid var(--fc-border);
}

.sidebar-logo {
  font-size: 1.5rem;
  color: var(--fc-primary);
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--fc-text);
  letter-spacing: -0.3px;
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

.nav-item:hover {
  background: var(--fc-surface-2);
  color: var(--fc-text);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: var(--fc-primary-light);
}

.nav-item.active i {
  color: var(--fc-primary);
}

.sidebar-footer {
  padding: 1rem 1.25rem 0;
  border-top: 1px solid var(--fc-border);
  margin-top: auto;
}

/* === Main content === */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: var(--fc-bg);
}
</style>
