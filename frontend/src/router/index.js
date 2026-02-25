import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    // ── Rutas públicas ─────────────────────────────────────
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { publica: true },
    },
    {
        path: '/registro',
        name: 'Registro',
        component: () => import('../views/RegisterView.vue'),
        meta: { publica: true },
    },

    // ── Rutas protegidas ───────────────────────────────────
    {
        path: '/',
        component: () => import('../components/layout/AppLayout.vue'),
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('../views/DashboardView.vue'),
            },
            {
                path: 'transacciones',
                name: 'Transacciones',
                component: () => import('../views/TransaccionesView.vue'),
            },
            {
                path: 'cuentas',
                name: 'Cuentas',
                component: () => import('../views/CuentasView.vue'),
            },
            {
                path: 'categorias',
                name: 'Categorias',
                component: () => import('../views/CategoriasView.vue'),
            },
            {
                path: 'presupuestos',
                name: 'Presupuestos',
                component: () => import('../views/PresupuestosView.vue'),
            },
        ],
    },

    // Fallback
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// ── Navigation guard ────────────────────────────────────────
router.beforeEach((to) => {
    const auth = useAuthStore()
    if (!to.meta.publica && !auth.estaLogueado) {
        return { name: 'Login' }
    }
    // Si ya está logueado y va a login/registro → redirigir al dashboard
    if (to.meta.publica && auth.estaLogueado) {
        return { name: 'Dashboard' }
    }
})

export default router
