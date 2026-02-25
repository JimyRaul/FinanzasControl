import { createRouter, createWebHistory } from 'vue-router'

const routes = [
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
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
