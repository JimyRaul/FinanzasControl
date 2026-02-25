<template>
  <div>
    <!-- Header con selector de mes -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Resumen financiero · {{ mesNombre }} {{ anio }}</p>
      </div>
      <div class="mes-nav">
        <Button icon="pi pi-chevron-left" text rounded @click="cambiarMes(-1)" />
        <span class="mes-label">{{ mesNombre }} {{ anio }}</span>
        <Button icon="pi pi-chevron-right" text rounded @click="cambiarMes(1)" :disabled="esMesActual" />
      </div>
    </div>

    <!-- Loading inicial -->
    <div v-if="cargando" class="loading-center">
      <ProgressSpinner strokeWidth="3" />
    </div>

    <template v-else>
      <!-- ── KPI Cards ──────────────────────────────────── -->
      <div class="kpi-grid">
        <div class="kpi-card card kpi-balance">
          <div class="kpi-icon"><i class="pi pi-wallet"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Balance del mes</span>
            <span class="kpi-value" :class="datos.balance >= 0 ? 'text-success' : 'text-danger'">
              {{ fmt(datos.balance) }}
            </span>
          </div>
          <div class="kpi-trend" :class="datos.balance >= 0 ? 'trend-up' : 'trend-down'">
            <i :class="datos.balance >= 0 ? 'pi-trending-up' : 'pi-trending-down'" class="pi"></i>
          </div>
        </div>

        <div class="kpi-card card kpi-ingresos">
          <div class="kpi-icon kpi-icon--green"><i class="pi pi-arrow-up-right"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Ingresos</span>
            <span class="kpi-value text-success">{{ fmt(datos.ingresos) }}</span>
          </div>
        </div>

        <div class="kpi-card card kpi-gastos">
          <div class="kpi-icon kpi-icon--red"><i class="pi pi-arrow-down-right"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Gastos</span>
            <span class="kpi-value text-danger">{{ fmt(datos.gastos) }}</span>
          </div>
        </div>

        <div class="kpi-card card kpi-ahorro">
          <div class="kpi-icon kpi-icon--purple"><i class="pi pi-percentage"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Tasa de ahorro</span>
            <span class="kpi-value" :class="tasaAhorro >= 0 ? 'text-success' : 'text-danger'">
              {{ tasaAhorro }}%
            </span>
          </div>
        </div>
      </div>

      <!-- ── Gráficas ──────────────────────────────────── -->
      <div class="charts-grid">
        <!-- Dona: gastos por categoría -->
        <div class="card chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Gastos por categoría</h3>
            <span class="text-muted" style="font-size:0.8rem">{{ mesNombre }}</span>
          </div>
          <div v-if="donutData && donutData.labels.length > 0" class="chart-wrap">
            <Chart type="doughnut" :data="donutData" :options="donutOpts" />
          </div>
          <div v-else class="chart-empty">
            <i class="pi pi-chart-pie"></i>
            <p>Sin gastos este mes</p>
          </div>
        </div>

        <!-- Barras: evolución 6 meses -->
        <div class="card chart-card chart-card--wide">
          <div class="chart-header">
            <h3 class="chart-title">Ingresos vs Gastos</h3>
            <span class="text-muted" style="font-size:0.8rem">Últimos 6 meses</span>
          </div>
          <div v-if="barData" class="chart-wrap chart-wrap--tall">
            <Chart type="bar" :data="barData" :options="barOpts" />
          </div>
        </div>
      </div>

      <!-- ── Fila inferior ─────────────────────────────── -->
      <div class="bottom-grid">
        <!-- Últimas transacciones -->
        <div class="card">
          <div class="chart-header">
            <h3 class="chart-title">Últimos movimientos</h3>
            <Button label="Ver todos" text size="small" @click="$router.push('/transacciones')" />
          </div>
          <div v-if="datos.recientes.length === 0" class="chart-empty">
            <i class="pi pi-inbox"></i>
            <p>Sin transacciones registradas</p>
          </div>
          <div v-else class="recientes-lista">
            <div v-for="tx in datos.recientes" :key="tx._id" class="rec-item">
              <div
                class="rec-icon"
                :style="`background:${colorCat(tx.categoria_id)}22;color:${colorCat(tx.categoria_id)}`"
              >
                <i :class="['pi', iconoCat(tx.categoria_id)]"></i>
              </div>
              <div class="rec-info">
                <span class="rec-desc">{{ tx.descripcion }}</span>
                <span class="rec-fecha text-muted">{{ tx.fecha }}</span>
              </div>
              <span class="rec-monto" :class="tx.tipo === 'ingreso' ? 'text-success' : 'text-danger'">
                {{ tx.tipo === 'ingreso' ? '+' : '-' }}{{ fmt(tx.monto) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Distribución por categoría (tabla) -->
        <div class="card">
          <div class="chart-header">
            <h3 class="chart-title">Top gastos</h3>
            <span class="text-muted" style="font-size:0.8rem">{{ mesNombre }}</span>
          </div>
          <div v-if="topGastos.length === 0" class="chart-empty">
            <i class="pi pi-list"></i>
            <p>Sin gastos este mes</p>
          </div>
          <div v-else class="top-lista">
            <div v-for="(item, i) in topGastos" :key="item.id" class="top-item">
              <span class="top-rank text-muted">{{ i + 1 }}</span>
              <div
                class="top-dot"
                :style="`background:${colorCat(item.id)}`"
              ></div>
              <span class="top-nombre">{{ nombreCat(item.id) }}</span>
              <div class="top-bar-wrap">
                <div
                  class="top-bar-fill"
                  :style="`width:${item.pct}%;background:${colorCat(item.id)}`"
                ></div>
              </div>
              <span class="top-monto text-danger">{{ fmt(item.monto) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import { TransaccionesDB } from '../db/repositorios'
import { useCategoriasStore } from '../stores/categorias'

const router   = useRouter()
const catStore = useCategoriasStore()
const cargando = ref(true)

// ── Mes activo ────────────────────────────────────────────
const now  = new Date()
const mes  = ref(now.getMonth() + 1)
const anio = ref(now.getFullYear())

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const mesNombre   = computed(() => MESES[mes.value - 1])
const esMesActual = computed(() =>
  mes.value === (new Date().getMonth() + 1) && anio.value === new Date().getFullYear()
)

function cambiarMes(delta) {
  let m = mes.value + delta, a = anio.value
  if (m > 12) { m = 1;  a++ }
  if (m < 1)  { m = 12; a-- }
  mes.value = m; anio.value = a
}

// ── Datos ─────────────────────────────────────────────────
const datos = ref({
  ingresos: 0, gastos: 0, balance: 0,
  porCategoria: {}, evolucion: [], recientes: [],
})

async function cargarDatos() {
  cargando.value = true
  try {
    await catStore.cargar()
    datos.value = await TransaccionesDB.resumen(mes.value, anio.value)
  } catch (e) {
    console.error('[Dashboard] Error:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
watch([mes, anio], cargarDatos)

// ── KPIs derivados ────────────────────────────────────────
const tasaAhorro = computed(() => {
  if (!datos.value.ingresos) return 0
  return Math.round((datos.value.balance / datos.value.ingresos) * 100)
})

// ── Lookups categorías ────────────────────────────────────
const catMap    = computed(() => Object.fromEntries(catStore.categorias.map(c => [c._id, c])))
const iconoCat  = (id) => catMap.value[id]?.icono  || 'pi-tag'
const colorCat  = (id) => catMap.value[id]?.color  || '#6366f1'
const nombreCat = (id) => catMap.value[id]?.nombre || 'Sin categoría'

// ── Top gastos ────────────────────────────────────────────
const topGastos = computed(() => {
  const entries = Object.entries(datos.value.porCategoria)
    .map(([id, monto]) => ({ id, monto }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 6)
  const max = entries[0]?.monto || 1
  return entries.map(e => ({ ...e, pct: Math.round((e.monto / max) * 100) }))
})

// ── Donut chart ───────────────────────────────────────────
const donutData = computed(() => {
  const top = topGastos.value
  if (!top.length) return null
  return {
    labels: top.map(e => nombreCat(e.id)),
    datasets: [{
      data: top.map(e => e.monto),
      backgroundColor: top.map(e => colorCat(e.id)),
      borderColor: '#1e293b',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }
})

const donutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'right',
      labels: { color: '#94a3b8', font: { size: 11 }, padding: 12, boxWidth: 10 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: S/ ${ctx.parsed.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
      },
    },
  },
}

// ── Bar chart ─────────────────────────────────────────────
const barData = computed(() => {
  const ev = datos.value.evolucion
  if (!ev.length) return null
  const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return {
    labels: ev.map(e => {
      const [y, m] = e.mes.split('-')
      return `${MESES_CORTO[parseInt(m) - 1]} ${y}`
    }),
    datasets: [
      {
        label: 'Ingresos',
        data: ev.map(e => e.ingresos),
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Gastos',
        data: ev.map(e => e.gastos),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }
})

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: S/ ${ctx.parsed.y.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#1e293b' } },
    y: {
      ticks: {
        color: '#94a3b8',
        font: { size: 11 },
        callback: (v) => `S/ ${v.toLocaleString('es-PE')}`,
      },
      grid: { color: 'rgba(51,65,85,0.5)' },
    },
  },
}

// ── Formatter ─────────────────────────────────────────────
const fmt = (n) =>
  n !== undefined && n !== null
    ? `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'S/ 0.00'
</script>

<style scoped>
/* ── KPIs ────────────────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px;
  height: 100%;
}

.kpi-balance::before  { background: var(--fc-primary); }
.kpi-ingresos::before { background: var(--fc-success); }
.kpi-gastos::before   { background: var(--fc-danger); }
.kpi-ahorro::before   { background: var(--fc-warning); }

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(99,102,241,0.15);
  color: var(--fc-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.kpi-icon--green  { background: rgba(16,185,129,0.15); color: var(--fc-success); }
.kpi-icon--red    { background: rgba(239,68,68,0.15);  color: var(--fc-danger); }
.kpi-icon--purple { background: rgba(245,158,11,0.15); color: var(--fc-warning); }

.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.kpi-label {
  font-size: 0.75rem;
  color: var(--fc-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.kpi-trend {
  font-size: 1.5rem;
  opacity: 0.3;
}

.trend-up   { color: var(--fc-success); opacity: 0.6; }
.trend-down { color: var(--fc-danger);  opacity: 0.6; }

/* ── Charts ──────────────────────────────────────────────── */
.charts-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-card { padding: 1.25rem; }
.chart-card--wide { grid-column: span 1; }

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.chart-wrap {
  height: 240px;
}

.chart-wrap--tall {
  height: 240px;
}

.chart-empty {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--fc-text-muted);
  font-size: 0.85rem;
}

.chart-empty i { font-size: 2rem; opacity: 0.4; }

/* ── Bottom grid ─────────────────────────────────────────── */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Recientes */
.recientes-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--fc-border);
}

.rec-item:last-child { border-bottom: none; }

.rec-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.rec-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rec-desc {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-fecha { font-size: 0.75rem; }
.rec-monto { font-size: 0.85rem; font-weight: 700; white-space: nowrap; }

/* Top gastos */
.top-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.top-rank {
  width: 18px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.top-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.top-nombre {
  font-size: 0.82rem;
  min-width: 90px;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-bar-wrap {
  flex: 1;
  height: 6px;
  background: var(--fc-surface-2);
  border-radius: 3px;
  overflow: hidden;
}

.top-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
  opacity: 0.8;
}

.top-monto {
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  min-width: 80px;
  text-align: right;
}

/* Mes navegación (header) */
.mes-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mes-label {
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 140px;
  text-align: center;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 6rem;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .kpi-value {
    font-size: 1.1rem;
  }
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .bottom-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .chart-wrap,
  .chart-wrap--tall {
    height: 200px;
  }
  .mes-nav {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

</style>
