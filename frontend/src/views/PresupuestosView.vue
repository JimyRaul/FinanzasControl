<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Presupuestos</h1>
        <p class="page-subtitle">Control de gastos por categoría · {{ mesNombre }} {{ anio }}</p>
      </div>
      <div class="header-actions">
        <div class="mes-nav">
          <Button icon="pi pi-chevron-left" text rounded @click="cambiarMes(-1)" />
          <span class="mes-label">{{ mesNombre }} {{ anio }}</span>
          <Button icon="pi pi-chevron-right" text rounded @click="cambiarMes(1)" :disabled="esMesActual" />
        </div>
        <Button label="Nuevo presupuesto" icon="pi pi-plus" @click="abrirDialog()" />
      </div>
    </div>

    <!-- Resumen KPI -->
    <div class="resumen-grid">
      <div class="card resumen-card">
        <span class="text-muted" style="font-size:0.75rem">Total presupuestado</span>
        <span class="resumen-value text-primary">{{ fmt(totalPresupuestado) }}</span>
      </div>
      <div class="card resumen-card">
        <span class="text-muted" style="font-size:0.75rem">Total gastado</span>
        <span class="resumen-value text-danger">{{ fmt(totalGastado) }}</span>
      </div>
      <div class="card resumen-card">
        <span class="text-muted" style="font-size:0.75rem">Disponible</span>
        <span class="resumen-value" :class="totalDisponible >= 0 ? 'text-success' : 'text-danger'">
          {{ fmt(totalDisponible) }}
        </span>
      </div>
      <div class="card resumen-card">
        <span class="text-muted" style="font-size:0.75rem">Categorías</span>
        <span class="resumen-value">{{ store.presupuestos.length }}</span>
      </div>
    </div>

    <ProgressSpinner v-if="store.cargando" />

    <!-- Lista de presupuestos -->
    <div v-if="!store.cargando && store.presupuestos.length === 0" class="empty-state card">
      <i class="pi pi-chart-bar" style="font-size:2.5rem;opacity:0.3;color:var(--fc-primary)"></i>
      <p>Sin presupuestos para este mes</p>
      <Button label="Crear el primero" icon="pi pi-plus" outlined @click="abrirDialog()" />
    </div>

    <div v-else class="presupuestos-lista">
      <div v-for="p in store.presupuestos" :key="p._id" class="card presupuesto-card">
        <!-- Header de categoría -->
        <div class="pres-header">
          <div class="pres-cat">
            <div
              class="cat-icon"
              :style="`background:${colorCat(p.categoria_id)}22;color:${colorCat(p.categoria_id)}`"
            >
              <i :class="['pi', iconoCat(p.categoria_id)]"></i>
            </div>
            <div>
              <span class="pres-nombre">{{ nombreCat(p.categoria_id) }}</span>
              <span class="pres-dates text-muted">{{ mesNombre }} {{ anio }}</span>
            </div>
          </div>
          <div class="pres-actions">
            <Button icon="pi pi-pencil" text rounded size="small" @click="abrirDialog(p)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmarEliminar(p)" />
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="pres-progress-wrap">
          <div class="pres-bar-bg">
            <div
              class="pres-bar-fill"
              :style="`width:${p.pct}%;background:${colorSemaforo(p.pct)}`"
            ></div>
          </div>
          <span class="pres-pct" :style="`color:${colorSemaforo(p.pct)}`">{{ p.pct }}%</span>
        </div>

        <!-- Montos -->
        <div class="pres-montos">
          <div class="pres-monto-item">
            <span class="text-muted">Gastado</span>
            <span class="text-danger" style="font-weight:700">{{ fmt(p.gastado) }}</span>
          </div>
          <div class="pres-monto-item pres-monto-center">
            <span class="text-muted">de</span>
          </div>
          <div class="pres-monto-item">
            <span class="text-muted">Límite</span>
            <span style="font-weight:700">{{ fmt(p.monto_limite) }}</span>
          </div>
          <div class="pres-monto-item">
            <span class="text-muted">Disponible</span>
            <span :class="(p.monto_limite - p.gastado) >= 0 ? 'text-success' : 'text-danger'" style="font-weight:700">
              {{ fmt(p.monto_limite - p.gastado) }}
            </span>
          </div>
        </div>

        <!-- Alerta -->
        <div v-if="p.pct >= 100" class="pres-alerta pres-alerta--danger">
          <i class="pi pi-exclamation-triangle"></i> Presupuesto superado
        </div>
        <div v-else-if="p.pct >= 80" class="pres-alerta pres-alerta--warn">
          <i class="pi pi-exclamation-circle"></i> Estás cerca del límite
        </div>
      </div>
    </div>

    <!-- Dialog crear/editar -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editando ? 'Editar presupuesto' : 'Nuevo presupuesto'"
      modal :closable="true" :style="{ width: '420px' }"
    >
      <div class="dialog-body">
        <div class="field">
          <label>Categoría de gasto *</label>
          <Select
            v-model="form.categoria_id"
            :options="catStore.gastoCats"
            optionValue="_id"
            placeholder="Selecciona una categoría"
            fluid
          >
            <template #option="{ option }">
              <div class="cat-opt">
                <span :style="`color:${option.color};margin-right:0.4rem`">
                  <i :class="['pi', option.icono]"></i>
                </span>
                {{ option.nombre }}
              </div>
            </template>
            <template #value="{ value }">
              <div v-if="value" class="cat-opt">
                <span :style="`color:${colorCat(value)};margin-right:0.4rem`">
                  <i :class="['pi', iconoCat(value)]"></i>
                </span>
                {{ nombreCat(value) }}
              </div>
              <span v-else class="text-muted">Selecciona una categoría</span>
            </template>
          </Select>
        </div>

        <div class="field">
          <label>Límite mensual (S/) *</label>
          <InputNumber
            v-model="form.monto_limite"
            :min="1"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            placeholder="0.00"
            fluid
          />
        </div>

        <div class="field-row">
          <div class="field">
            <label>Mes</label>
            <Select v-model="form.mes" :options="mesesOpts" optionLabel="label" optionValue="value" fluid />
          </div>
          <div class="field">
            <label>Año</label>
            <InputNumber v-model="form.anio" :min="2020" :max="2030" :useGrouping="false" fluid />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" text @click="dialogVisible = false" />
        <Button :label="editando ? 'Actualizar' : 'Guardar'" icon="pi pi-check" :loading="guardando" @click="guardar" />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { usePresupuestosStore } from '../stores/presupuestos'
import { useCategoriasStore } from '../stores/categorias'
import { TransaccionesDB } from '../db/repositorios'

const store   = usePresupuestosStore()
const catStore = useCategoriasStore()
const confirm  = useConfirm()
const toast    = useToast()

// ── Mes activo ────────────────────────────────────────────
const now  = new Date()
const mes  = ref(now.getMonth() + 1)
const anio = ref(now.getFullYear())

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const mesNombre   = computed(() => MESES[mes.value - 1])
const esMesActual = computed(() => mes.value === (new Date().getMonth() + 1) && anio.value === new Date().getFullYear())
const mesesOpts   = MESES.map((label, i) => ({ label, value: i + 1 }))

function cambiarMes(delta) {
  let m = mes.value + delta, a = anio.value
  if (m > 12) { m = 1;  a++ }
  if (m < 1)  { m = 12; a-- }
  mes.value = m; anio.value = a
}

// ── Cargar datos ──────────────────────────────────────────
async function cargar() {
  await catStore.cargar()
  // Obtener gastos del mes para calcular porcentaje
  const todos = await TransaccionesDB.listar()
  const prefijo = `${anio.value}-${String(mes.value).padStart(2, '0')}`
  const delMes = todos.filter(t => t.fecha?.startsWith(prefijo))
  const porCat = {}
  for (const tx of delMes.filter(t => t.tipo === 'gasto')) {
    porCat[tx.categoria_id || 'sin'] = (porCat[tx.categoria_id || 'sin'] || 0) + (tx.monto || 0)
  }
  await store.cargar(mes.value, anio.value, porCat)
}

onMounted(cargar)
watch([mes, anio], cargar)

// ── KPIs de resumen ───────────────────────────────────────
const totalPresupuestado = computed(() => store.presupuestos.reduce((s, p) => s + (p.monto_limite || 0), 0))
const totalGastado       = computed(() => store.presupuestos.reduce((s, p) => s + (p.gastado || 0), 0))
const totalDisponible    = computed(() => totalPresupuestado.value - totalGastado.value)

// ── Lookups categorías ────────────────────────────────────
const catMap   = computed(() => Object.fromEntries(catStore.categorias.map(c => [c._id, c])))
const iconoCat  = id => catMap.value[id]?.icono  || 'pi-tag'
const colorCat  = id => catMap.value[id]?.color  || '#6366f1'
const nombreCat = id => catMap.value[id]?.nombre || 'Sin categoría'

// Semáforo de progreso
const colorSemaforo = pct =>
  pct >= 100 ? 'var(--fc-danger)' :
  pct >= 80  ? 'var(--fc-warning)' :
               'var(--fc-success)'

// ── Dialog ────────────────────────────────────────────────
const dialogVisible = ref(false)
const editando      = ref(null)
const guardando     = ref(false)
const form = reactive({ categoria_id: null, monto_limite: null, mes: mes.value, anio: anio.value })

function abrirDialog(p = null) {
  editando.value = p?._id || null
  Object.assign(form, {
    categoria_id: p?.categoria_id || null,
    monto_limite: p?.monto_limite || null,
    mes: p?.mes || mes.value,
    anio: p?.anio || anio.value,
  })
  dialogVisible.value = true
}

async function guardar() {
  if (!form.categoria_id || !form.monto_limite) {
    toast.add({ severity: 'warn', summary: 'Campos requeridos', life: 3000 })
    return
  }
  guardando.value = true
  try {
    if (editando.value) {
      await store.actualizar(editando.value, { monto_limite: form.monto_limite })
      toast.add({ severity: 'success', summary: 'Presupuesto actualizado', life: 3000 })
    } else {
      await store.crear({ categoria_id: form.categoria_id, monto_limite: form.monto_limite, mes: form.mes, anio: form.anio })
      toast.add({ severity: 'success', summary: 'Presupuesto creado', life: 3000 })
    }
    dialogVisible.value = false
    await cargar()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 4000 })
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(p) {
  confirm.require({
    message: `¿Eliminar el presupuesto de "${nombreCat(p.categoria_id)}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-trash',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.eliminar(p._id)
      toast.add({ severity: 'success', summary: 'Eliminado', life: 3000 })
    },
  })
}

const fmt = n => n !== undefined
  ? `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : 'S/ 0.00'
</script>

<style scoped>
.header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.mes-nav { display: flex; align-items: center; gap: 0.4rem; }
.mes-label { font-weight: 600; font-size: 0.9rem; min-width: 140px; text-align: center; }

/* Resumen KPIs */
.resumen-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.resumen-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.25rem;
}
.resumen-value { font-size: 1.3rem; font-weight: 700; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
  color: var(--fc-text-muted);
}

/* Lista */
.presupuestos-lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}
.presupuesto-card { padding: 1.25rem; }

.pres-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.pres-cat { display: flex; align-items: center; gap: 0.75rem; }
.cat-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 1rem;
}
.pres-nombre { font-weight: 700; display: block; }
.pres-dates { font-size: 0.75rem; }
.pres-actions { display: flex; gap: 0.25rem; }

/* Barra de progreso */
.pres-progress-wrap { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.pres-bar-bg {
  flex: 1; height: 10px; border-radius: 5px;
  background: var(--fc-surface-2); overflow: hidden;
}
.pres-bar-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; }
.pres-pct { font-size: 0.8rem; font-weight: 700; min-width: 36px; text-align: right; }

/* Montos */
.pres-montos { display: grid; grid-template-columns: 1fr auto 1fr 1fr; gap: 0.5rem; align-items: center; }
.pres-monto-item { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.8rem; }
.pres-monto-center { text-align: center; font-size: 0.7rem; }

/* Alertas */
.pres-alerta {
  margin-top: 0.75rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--fc-radius-sm);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.pres-alerta--danger { background: rgba(239,68,68,0.1);   color: var(--fc-danger); }
.pres-alerta--warn   { background: rgba(245,158,11,0.1); color: var(--fc-warning); }

/* Dialog */
.dialog-body { display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0; }
.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: var(--fc-text-muted); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.cat-opt { display: flex; align-items: center; }

/* Responsive */
@media (max-width: 768px) {
  .resumen-grid { grid-template-columns: 1fr 1fr; }
  .presupuestos-lista { grid-template-columns: 1fr; }
  .pres-montos { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .pres-monto-center { display: none; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
