<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Cuentas</h1>
        <p class="page-subtitle">Administra tus cuentas de efectivo, débito y tarjetas de crédito</p>
      </div>
      <Button label="Nueva cuenta" icon="pi pi-plus" @click="abrirNueva" />
    </div>

    <!-- Loading -->
    <div v-if="store.cargando" class="loading-center">
      <ProgressSpinner strokeWidth="3" />
    </div>

    <!-- Empty state -->
    <div v-else-if="store.cuentasActivas.length === 0" class="empty-state card">
      <i class="pi pi-credit-card empty-icon"></i>
      <p class="empty-title">No tienes cuentas registradas</p>
      <p class="empty-sub">Agrega tu primera cuenta para empezar a registrar movimientos</p>
      <Button label="Agregar cuenta" icon="pi pi-plus" @click="abrirNueva" class="mt-4" />
    </div>

    <!-- Grid de cuentas -->
    <div v-else class="cuentas-grid">
      <div
        v-for="cuenta in store.cuentasActivas"
        :key="cuenta._id"
        class="cuenta-card card"
        :style="`--accent: ${colorTipo(cuenta.tipo)}`"
      >
        <div class="cuenta-top">
          <div class="cuenta-icon">
            <i :class="['pi', iconoTipo(cuenta.tipo)]"></i>
          </div>
          <div class="cuenta-acciones">
            <Button icon="pi pi-pencil" text rounded size="small" @click="abrirEditar(cuenta)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmarEliminar(cuenta)" />
          </div>
        </div>
        <div class="cuenta-nombre">{{ cuenta.nombre }}</div>
        <div class="cuenta-tipo">
          <Tag :value="etiquetaTipo(cuenta.tipo)" :severity="severidadTipo(cuenta.tipo)" />
        </div>
        <div v-if="cuenta.tipo === 'credito'" class="cuenta-limite">
          <span class="text-muted">Límite:</span>
          <span>{{ formatNum(cuenta.limite_credito) }}</span>
        </div>
        <div class="cuenta-moneda text-muted">{{ cuenta.moneda || 'COP' }}</div>
      </div>
    </div>

    <!-- Dialog crear / editar -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editando ? 'Editar cuenta' : 'Nueva cuenta'"
      :style="{ width: '440px' }"
      modal
      :draggable="false"
    >
      <form @submit.prevent="guardar" class="dialog-form">

        <div class="field">
          <label>Nombre *</label>
          <InputText v-model="form.nombre" placeholder="ej. Visa Gold, Cuenta Nómina" fluid />
          <small v-if="errors.nombre" class="error">{{ errors.nombre }}</small>
        </div>

        <div class="field">
          <label>Tipo *</label>
          <Select
            v-model="form.tipo"
            :options="tipoOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona el tipo"
            fluid
          />
        </div>

        <div class="field">
          <label>Moneda</label>
          <Select
            v-model="form.moneda"
            :options="['PEN','USD']"
            placeholder="PEN"
            fluid
          />
        </div>

        <template v-if="form.tipo === 'credito'">
          <div class="field">
            <label>Límite de crédito</label>
            <InputNumber
              v-model="form.limite_credito"
              mode="decimal"
              :min="0"
              :useGrouping="true"
              placeholder="5,000,000"
              fluid
            />
          </div>
          <div class="field-row">
            <div class="field">
              <label>Día de corte</label>
              <InputNumber v-model="form.dia_corte" :min="1" :max="31" fluid />
            </div>
            <div class="field">
              <label>Día de pago</label>
              <InputNumber v-model="form.dia_pago" :min="1" :max="31" fluid />
            </div>
          </div>
        </template>

        <div class="field">
          <label>Saldo inicial</label>
          <InputNumber
            v-model="form.saldo_inicial"
            mode="decimal"
            :useGrouping="true"
            placeholder="0"
            fluid
          />
        </div>

        <div class="dialog-footer">
          <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
          <Button
            :label="editando ? 'Guardar cambios' : 'Crear cuenta'"
            icon="pi pi-check"
            type="submit"
            :loading="guardando"
          />
        </div>
      </form>
    </Dialog>

    <!-- Confirm delete -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { useCuentasStore } from '../stores/cuentas'

const store   = useCuentasStore()
const confirm = useConfirm()
const toast   = useToast()

const dialogVisible = ref(false)
const editando      = ref(false)
const guardando     = ref(false)
const cuentaActual  = ref(null)

const tipoOptions = [
  { label: 'Efectivo',         value: 'efectivo' },
  { label: 'Cuenta de Débito', value: 'debito'   },
  { label: 'Tarjeta de Crédito', value: 'credito' },
]

const formVacio = () => ({
  nombre: '', tipo: 'debito', moneda: 'PEN',
  limite_credito: 0, dia_corte: 15, dia_pago: 5, saldo_inicial: 0,
})

const form   = reactive(formVacio())
const errors = reactive({})

onMounted(() => store.cargar())

function abrirNueva() {
  editando.value = false
  cuentaActual.value = null
  Object.assign(form, formVacio())
  Object.assign(errors, {})
  dialogVisible.value = true
}

function abrirEditar(cuenta) {
  editando.value = true
  cuentaActual.value = cuenta
  Object.assign(form, {
    nombre: cuenta.nombre,
    tipo: cuenta.tipo,
    moneda: cuenta.moneda || 'COP',
    limite_credito: cuenta.limite_credito || 0,
    dia_corte: cuenta.dia_corte || 15,
    dia_pago: cuenta.dia_pago || 5,
    saldo_inicial: cuenta.saldo_inicial || 0,
  })
  Object.assign(errors, {})
  dialogVisible.value = true
}

function validar() {
  Object.assign(errors, {})
  if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
  return Object.keys(errors).length === 0
}

async function guardar() {
  if (!validar()) return
  guardando.value = true
  try {
    const datos = { ...form }
    if (form.tipo !== 'credito') {
      delete datos.limite_credito
      delete datos.dia_corte
      delete datos.dia_pago
    }
    if (editando.value) {
      await store.actualizar(cuentaActual.value._id, datos)
      toast.add({ severity: 'success', summary: 'Cuenta actualizada', life: 3000 })
    } else {
      await store.crear(datos)
      toast.add({ severity: 'success', summary: 'Cuenta creada', life: 3000 })
    }
    dialogVisible.value = false
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 5000 })
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(cuenta) {
  confirm.require({
    message: `¿Desactivar la cuenta "${cuenta.nombre}"?`,
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, desactivar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.eliminar(cuenta._id)
      toast.add({ severity: 'info', summary: 'Cuenta desactivada', life: 3000 })
    },
  })
}

// ── Helpers visuales ──────────────────────────────────────

const iconoTipo = (t) => ({ efectivo: 'pi-money-bill', debito: 'pi-building-columns', credito: 'pi-credit-card' }[t] || 'pi-wallet')
const colorTipo = (t) => ({ efectivo: '#10b981', debito: '#6366f1', credito: '#f59e0b' }[t] || '#94a3b8')
const etiquetaTipo = (t) => ({ efectivo: 'Efectivo', debito: 'Débito', credito: 'Crédito' }[t] || t)
const severidadTipo = (t) => ({ efectivo: 'success', debito: 'info', credito: 'warn' }[t] || 'secondary')
const formatNum = (n) => n ? new Intl.NumberFormat('es-CO').format(n) : '—'
</script>

<style scoped>
.loading-center {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--fc-primary);
  display: block;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-sub {
  color: var(--fc-text-muted);
  font-size: 0.9rem;
}

/* Grid */
.cuentas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.cuenta-card {
  border-left: 4px solid var(--accent, var(--fc-primary));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
}

.cuenta-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.cuenta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.cuenta-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--accent, var(--fc-primary));
}

.cuenta-acciones {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.cuenta-card:hover .cuenta-acciones {
  opacity: 1;
}

.cuenta-nombre {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cuenta-tipo {
  margin-bottom: 0.75rem;
}

.cuenta-limite {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

.cuenta-moneda {
  font-size: 0.8rem;
}

/* Dialog form */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fc-text-muted);
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error {
  color: var(--fc-danger);
  font-size: 0.8rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.mt-4 { margin-top: 1rem; }
</style>
