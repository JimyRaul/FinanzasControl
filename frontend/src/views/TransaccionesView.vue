<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Transacciones</h1>
        <p class="page-subtitle">
          {{ mesNombre }} {{ filtros.anio }} &mdash;
          <span class="text-success">+{{ formatNum(resumen.ingresos) }}</span>
          &nbsp;
          <span class="text-danger">-{{ formatNum(resumen.gastos) }}</span>
        </p>
      </div>
      <Button label="Registrar" icon="pi pi-plus" @click="abrirNueva" />
    </div>

    <!-- Barra de filtros -->
    <div class="filtros-bar card">
      <!-- Navegación mes -->
      <div class="mes-nav">
        <Button icon="pi pi-chevron-left" text rounded @click="cambiarMes(-1)" />
        <span class="mes-label">{{ mesNombre }} {{ filtros.anio }}</span>
        <Button icon="pi pi-chevron-right" text rounded @click="cambiarMes(1)" :disabled="esMesActual" />
      </div>

      <Divider layout="vertical" />

      <!-- Filtro tipo -->
      <SelectButton
        v-model="filtros.tipo"
        :options="tipoOpts"
        optionLabel="label"
        optionValue="value"
        @change="recargar"
      />

      <Divider layout="vertical" />

      <!-- Filtro cuenta -->
      <Select
        v-model="filtros.cuenta_id"
        :options="cuentasOpts"
        optionLabel="label"
        optionValue="value"
        placeholder="Todas las cuentas"
        showClear
        class="filtro-select"
        @change="recargar"
      />

      <!-- Filtro categoría -->
      <Select
        v-model="filtros.categoria_id"
        :options="categoriasOpts"
        optionLabel="label"
        optionValue="value"
        placeholder="Todas las categorías"
        showClear
        class="filtro-select"
        @change="recargar"
      />
    </div>

    <!-- KPI mini-cards -->
    <div class="kpi-row">
      <div class="kpi-card card">
        <span class="kpi-label">Ingresos</span>
        <span class="kpi-value text-success">{{ formatNum(resumen.ingresos) }}</span>
      </div>
      <div class="kpi-card card">
        <span class="kpi-label">Gastos</span>
        <span class="kpi-value text-danger">{{ formatNum(resumen.gastos) }}</span>
      </div>
      <div class="kpi-card card">
        <span class="kpi-label">Balance</span>
        <span class="kpi-value" :class="resumen.balance >= 0 ? 'text-success' : 'text-danger'">
          {{ formatNum(resumen.balance) }}
        </span>
      </div>
      <div class="kpi-card card">
        <span class="kpi-label">Transacciones</span>
        <span class="kpi-value">{{ store.transacciones.length }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.cargando" class="loading-center">
      <ProgressSpinner strokeWidth="3" />
    </div>

    <!-- Empty state -->
    <div v-else-if="store.transacciones.length === 0" class="empty-state card">
      <i class="pi pi-inbox empty-icon"></i>
      <p class="empty-title">Sin transacciones este mes</p>
      <p class="empty-sub">Registra un gasto o ingreso para empezar</p>
      <Button label="Registrar primera transacción" icon="pi pi-plus" @click="abrirNueva" class="mt-4" />
    </div>

    <!-- Listado agrupado por día -->
    <div v-else class="transacciones-lista">
      <div v-for="(grupo, fecha) in transaccionesPorFecha" :key="fecha" class="grupo-dia">
        <div class="grupo-fecha">
          <span>{{ formatFecha(fecha) }}</span>
          <span class="grupo-total" :class="totalGrupo(grupo) >= 0 ? 'text-success' : 'text-danger'">
            {{ totalGrupo(grupo) >= 0 ? '+' : '' }}{{ formatNum(totalGrupo(grupo)) }}
          </span>
        </div>

        <div class="tx-list">
          <div
            v-for="tx in grupo"
            :key="tx._id"
            class="tx-item card"
            :class="{ 'tx-cuota': tx.transaccion_padre_id }"
          >
            <!-- Ícono categoría -->
            <div
              class="tx-icon"
              :style="`background:${colorCat(tx.categoria_id)}22;color:${colorCat(tx.categoria_id)}`"
            >
              <i :class="['pi', iconoCat(tx.categoria_id)]"></i>
            </div>

            <!-- Info -->
            <div class="tx-info">
              <span class="tx-desc">{{ tx.descripcion }}</span>
              <span class="tx-meta text-muted">
                {{ nombreCat(tx.categoria_id) }}
                <span v-if="tx.cuenta_id">&middot; {{ nombreCuenta(tx.cuenta_id) }}</span>
                <span v-if="tx.cuotas > 1" class="tx-cuota-badge">
                  {{ tx.cuota_actual }}/{{ tx.cuotas }}
                </span>
                <span v-if="tx.es_tarjeta_credito && tx.cuotas === 1" class="tx-cuota-badge">TC</span>
              </span>
            </div>

            <!-- Monto -->
            <div class="tx-monto" :class="tx.tipo === 'ingreso' ? 'text-success' : 'text-danger'">
              {{ tx.tipo === 'ingreso' ? '+' : '-' }}{{ formatNum(tx.monto) }}
            </div>

            <!-- Acciones -->
            <div class="tx-acciones">
              <Button icon="pi pi-pencil" text rounded size="small" @click="abrirEditar(tx)" />
              <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmarEliminar(tx)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════ DIALOG ═══════════════════════════════════ -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editando ? 'Editar transacción' : 'Nueva transacción'"
      :style="{ width: '500px' }"
      modal
      :draggable="false"
    >
      <form @submit.prevent="guardar" class="dialog-form">

        <!-- Tipo (solo en creación) -->
        <div v-if="!editando" class="tipo-toggle">
          <button
            type="button"
            class="tipo-btn"
            :class="{ active: form.tipo === 'gasto', gasto: form.tipo === 'gasto' }"
            @click="form.tipo = 'gasto'; form.categoria_id = null"
          >
            <i class="pi pi-arrow-down-right"></i> Gasto
          </button>
          <button
            type="button"
            class="tipo-btn"
            :class="{ active: form.tipo === 'ingreso', ingreso: form.tipo === 'ingreso' }"
            @click="form.tipo = 'ingreso'; form.categoria_id = null"
          >
            <i class="pi pi-arrow-up-right"></i> Ingreso
          </button>
        </div>

        <!-- Descripción -->
        <div class="field">
          <label>Descripción *</label>
          <InputText v-model="form.descripcion" placeholder="ej. Almuerzo, Gasolina, Salario..." fluid />
          <small v-if="errors.descripcion" class="error">{{ errors.descripcion }}</small>
        </div>

        <!-- Monto -->
        <div class="field-row">
          <div class="field">
            <label>Monto *</label>
            <InputNumber
              v-model="form.monto"
              mode="decimal"
              :useGrouping="true"
              :min="0"
              placeholder="0"
              fluid
            />
            <small v-if="errors.monto" class="error">{{ errors.monto }}</small>
          </div>
          <div class="field">
            <label>Fecha *</label>
            <DatePicker v-model="form.fecha" dateFormat="yy-mm-dd" showIcon fluid />
          </div>
        </div>

        <!-- Categoría -->
        <div class="field">
          <label>Categoría</label>
          <Select
            v-model="form.categoria_id"
            :options="categoriasParaTipo"
            optionLabel="nombre"
            optionValue="_id"
            placeholder="Selecciona una categoría"
            showClear
            fluid
          >
            <template #option="{ option }">
              <div class="cat-opt">
                <span class="cat-opt-dot" :style="`background:${option.color}`"></span>
                <i :class="['pi', option.icono]" :style="`color:${option.color}`"></i>
                {{ option.nombre }}
              </div>
            </template>
          </Select>
        </div>

        <!-- Cuenta -->
        <div class="field">
          <label>Cuenta</label>
          <Select
            v-model="form.cuenta_id"
            :options="cuentasStore.cuentasActivas"
            optionLabel="nombre"
            optionValue="_id"
            placeholder="Selecciona una cuenta"
            showClear
            fluid
          >
            <template #option="{ option }">
              <div class="cat-opt">
                <i :class="['pi', iconoTipoCuenta(option.tipo)]"></i>
                {{ option.nombre }}
                <span class="text-muted" style="font-size:0.75rem;margin-left:auto">{{ option.tipo }}</span>
              </div>
            </template>
          </Select>
        </div>

        <!-- Opciones Tarjeta de Crédito -->
        <div v-if="cuentaSeleccionadaEsTC" class="tc-section">
          <div class="tc-header">
            <i class="pi pi-credit-card"></i>
            <span>Opciones de Tarjeta de Crédito</span>
          </div>

          <div class="field-row">
            <div class="field">
              <label>N° de cuotas</label>
              <InputNumber v-model="form.cuotas" :min="1" :max="48" fluid />
            </div>
            <div v-if="form.cuotas > 1" class="field">
              <label>Valor por cuota</label>
              <span class="cuota-preview">
                {{ form.monto && form.cuotas ? formatNum(Math.round(form.monto / form.cuotas)) : '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Nota -->
        <div class="field">
          <label>Nota (opcional)</label>
          <Textarea v-model="form.nota" rows="2" placeholder="Comentario adicional..." fluid />
        </div>

        <!-- Footer -->
        <div class="dialog-footer">
          <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
          <Button
            :label="editando ? 'Guardar' : (form.cuotas > 1 ? `Registrar ${form.cuotas} cuotas` : 'Registrar')"
            icon="pi pi-check"
            type="submit"
            :loading="guardando"
            :severity="form.tipo === 'gasto' ? 'danger' : 'success'"
          />
        </div>
      </form>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import DatePicker from 'primevue/datepicker'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { useTransaccionesStore } from '../stores/transacciones'
import { useCuentasStore } from '../stores/cuentas'
import { useCategoriasStore } from '../stores/categorias'

const store        = useTransaccionesStore()
const cuentasStore = useCuentasStore()
const catStore     = useCategoriasStore()
const confirm      = useConfirm()
const toast        = useToast()

// ── Filtros ──────────────────────────────────────────────
const now = new Date()
const filtros = reactive({
  mes: now.getMonth() + 1,
  anio: now.getFullYear(),
  tipo: null,
  cuenta_id: null,
  categoria_id: null,
})

const tipoOpts = [
  { label: 'Todos', value: null },
  { label: 'Gastos', value: 'gasto' },
  { label: 'Ingresos', value: 'ingreso' },
]

const esMesActual = computed(() =>
  filtros.mes === (new Date().getMonth() + 1) && filtros.anio === new Date().getFullYear()
)

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const mesNombre = computed(() => MESES[filtros.mes - 1])

function cambiarMes(delta) {
  let m = filtros.mes + delta
  let a = filtros.anio
  if (m > 12) { m = 1; a++ }
  if (m < 1)  { m = 12; a-- }
  filtros.mes = m
  filtros.anio = a
  recargar()
}

// ── Options para selects de filtro ───────────────────────
const cuentasOpts = computed(() =>
  cuentasStore.cuentasActivas.map(c => ({ label: c.nombre, value: c._id }))
)

const categoriasOpts = computed(() =>
  catStore.categorias.filter(c => c.activa !== false).map(c => ({ label: c.nombre, value: c._id }))
)

// ── Carga inicial ─────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    cuentasStore.cargar(),
    catStore.cargar(),
  ])
  recargar()
})

async function recargar() {
  store.filtros.mes     = filtros.mes
  store.filtros.anio    = filtros.anio
  store.filtros.tipo    = filtros.tipo
  store.filtros.cuenta_id    = filtros.cuenta_id
  store.filtros.categoria_id = filtros.categoria_id
  await store.cargar()
}

// ── Agrupación por fecha ──────────────────────────────────
const transaccionesPorFecha = computed(() => {
  const grupos = {}
  for (const tx of store.transacciones) {
    const f = tx.fecha || 'sin-fecha'
    if (!grupos[f]) grupos[f] = []
    grupos[f].push(tx)
  }
  // Ordenar fechas desc
  return Object.fromEntries(
    Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a))
  )
})

const resumen = computed(() => {
  const txs = store.transacciones
  const ingresos = txs.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + (t.monto || 0), 0)
  const gastos   = txs.filter(t => t.tipo === 'gasto').reduce((s, t) => s + (t.monto || 0), 0)
  return { ingresos, gastos, balance: ingresos - gastos }
})

function totalGrupo(grupo) {
  return grupo.reduce((s, t) => s + (t.tipo === 'ingreso' ? t.monto : -t.monto), 0)
}

// ── Lookups rápidos ────────────────────────────────────────
const catMap  = computed(() => Object.fromEntries(catStore.categorias.map(c => [c._id, c])))
const iconoCat  = (id) => catMap.value[id]?.icono || 'pi-tag'
const colorCat  = (id) => catMap.value[id]?.color || '#94a3b8'
const nombreCat = (id) => catMap.value[id]?.nombre || 'Sin categoría'

const cuentaMap  = computed(() => Object.fromEntries(cuentasStore.cuentasActivas.map(c => [c._id, c])))
const nombreCuenta = (id) => cuentaMap.value[id]?.nombre || ''
const iconoTipoCuenta = (t) => ({ efectivo: 'pi-money-bill', debito: 'pi-building-columns', credito: 'pi-credit-card' }[t] || 'pi-wallet')

// ── Dialog ─────────────────────────────────────────────────
const dialogVisible = ref(false)
const editando      = ref(false)
const guardando     = ref(false)
const txActual      = ref(null)

const formVacio = () => ({
  tipo: 'gasto',
  descripcion: '',
  monto: null,
  fecha: new Date().toISOString().slice(0, 10),
  categoria_id: null,
  cuenta_id: null,
  cuotas: 1,
  es_tarjeta_credito: false,
  nota: '',
})

const form   = reactive(formVacio())
const errors = reactive({})

const cuentaSeleccionadaEsTC = computed(() => {
  const c = cuentaMap.value[form.cuenta_id]
  return c?.tipo === 'credito'
})

// Actualizar es_tarjeta_credito automáticamente
const categoriasParaTipo = computed(() =>
  catStore.categorias.filter(c =>
    c.activa !== false &&
    (c.tipo_transaccion === form.tipo || c.tipo_transaccion === 'ambos')
  )
)

function abrirNueva() {
  editando.value = false
  txActual.value = null
  Object.assign(form, formVacio())
  Object.assign(errors, {})
  dialogVisible.value = true
}

function abrirEditar(tx) {
  editando.value = true
  txActual.value = tx
  Object.assign(form, {
    tipo: tx.tipo,
    descripcion: tx.descripcion,
    monto: tx.monto,
    fecha: tx.fecha,
    categoria_id: tx.categoria_id || null,
    cuenta_id: tx.cuenta_id || null,
    cuotas: tx.cuotas || 1,
    es_tarjeta_credito: tx.es_tarjeta_credito || false,
    nota: tx.nota || '',
  })
  Object.assign(errors, {})
  dialogVisible.value = true
}

function validar() {
  Object.assign(errors, {})
  if (!form.descripcion.trim()) errors.descripcion = 'La descripción es requerida'
  if (!form.monto || form.monto <= 0) errors.monto = 'Ingresa un monto válido'
  return Object.keys(errors).length === 0
}

async function guardar() {
  if (!validar()) return
  guardando.value = true
  try {
    // Asegurar fecha es string YYYY-MM-DD
    const fecha = form.fecha instanceof Date
      ? form.fecha.toISOString().slice(0, 10)
      : form.fecha

    // Detectar TC automáticamente
    const esCuenta = cuentaMap.value[form.cuenta_id]
    const esTC = esCuenta?.tipo === 'credito'

    const datos = {
      ...form,
      fecha,
      monto: Number(form.monto),
      es_tarjeta_credito: esTC,
      cuotas: esTC ? (form.cuotas || 1) : 1,
    }

    if (editando.value) {
      await store.actualizar(txActual.value._id, datos)
      toast.add({ severity: 'success', summary: 'Transacción actualizada', life: 3000 })
    } else {
      await store.crear(datos)
      const msg = datos.cuotas > 1
        ? `Registradas ${datos.cuotas} cuotas de ${formatNum(Math.round(datos.monto / datos.cuotas))}`
        : 'Transacción registrada'
      toast.add({ severity: 'success', summary: msg, life: 4000 })
    }
    dialogVisible.value = false
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 5000 })
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(tx) {
  confirm.require({
    message: `¿Eliminar "${tx.descripcion}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.eliminar(tx._id)
      toast.add({ severity: 'info', summary: 'Transacción eliminada', life: 3000 })
    },
  })
}

// ── Formatters ─────────────────────────────────────────────
const formatNum = (n) =>
  n !== undefined && n !== null
    ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(n)
    : '—'

const formatFecha = (f) => {
  if (!f || f === 'sin-fecha') return 'Sin fecha'
  const [y, m, d] = f.split('-')
  return `${d} de ${MESES[parseInt(m) - 1]} ${y}`
}
</script>

<style scoped>
/* ── Filtros ───────────────────────────────────────────── */
.filtros-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.mes-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mes-label {
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 130px;
  text-align: center;
}

.filtro-select { min-width: 160px; }

/* ── KPIs ─────────────────────────────────────────────── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.25rem;
}

.kpi-label {
  font-size: 0.78rem;
  color: var(--fc-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 1.2rem;
  font-weight: 700;
}

/* ── Lista ────────────────────────────────────────────── */
.loading-center { display:flex; justify-content:center; padding:4rem; }
.empty-state { text-align:center; padding:4rem 2rem; }
.empty-icon { font-size:3rem; color:var(--fc-primary); display:block; margin-bottom:1rem; }
.empty-title { font-size:1.1rem; font-weight:600; margin-bottom:0.5rem; }
.empty-sub { color:var(--fc-text-muted); font-size:0.9rem; }
.mt-4 { margin-top:1rem; }

.transacciones-lista { display:flex; flex-direction:column; gap:1.25rem; }

.grupo-fecha {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 0.25rem 0.5rem;
  border-bottom: 1px solid var(--fc-border);
  margin-bottom: 0.5rem;
}

.tx-list { display:flex; flex-direction:column; gap:0.4rem; }

.tx-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.75rem 1rem;
  transition: background 0.15s;
}

.tx-item:hover { background: var(--fc-surface-2); }
.tx-cuota { opacity: 0.85; border-left: 2px solid var(--fc-warning); }

.tx-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tx-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tx-desc {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-meta { font-size: 0.78rem; display:flex; align-items:center; gap:0.3rem; flex-wrap:wrap; }

.tx-cuota-badge {
  background: rgba(245,158,11,0.15);
  color: var(--fc-warning);
  border-radius: 999px;
  padding: 0 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.tx-monto { font-weight: 700; font-size: 0.95rem; white-space: nowrap; }

.tx-acciones {
  display: flex;
  gap: 0.15rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.tx-item:hover .tx-acciones { opacity: 1; }

/* ── Dialog ────────────────────────────────────────────── */
.dialog-form { display:flex; flex-direction:column; gap:1rem; padding-top:0.5rem; }
.field { display:flex; flex-direction:column; gap:0.4rem; }
.field label { font-size:0.85rem; font-weight:600; color:var(--fc-text-muted); }
.field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.error { color:var(--fc-danger); font-size:0.8rem; }
.dialog-footer { display:flex; justify-content:flex-end; gap:0.75rem; padding-top:0.5rem; }

/* Toggle tipo */
.tipo-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.tipo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border: 2px solid var(--fc-border);
  border-radius: var(--fc-radius-sm);
  background: transparent;
  color: var(--fc-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tipo-btn.active.gasto {
  border-color: var(--fc-danger);
  color: var(--fc-danger);
  background: rgba(239,68,68,0.1);
}

.tipo-btn.active.ingreso {
  border-color: var(--fc-success);
  color: var(--fc-success);
  background: rgba(16,185,129,0.1);
}

/* TC section */
.tc-section {
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: var(--fc-radius-sm);
  padding: 1rem;
}

.tc-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--fc-warning);
  margin-bottom: 0.75rem;
}

.cuota-preview {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--fc-primary-light);
  padding: 0.5rem 0;
  display: block;
}

/* Cat option in select */
.cat-opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cat-opt-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
