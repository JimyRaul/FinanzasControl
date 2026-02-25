<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Categorías</h1>
        <p class="page-subtitle">Organiza tus gastos e ingresos por categoría</p>
      </div>
      <Button label="Nueva categoría" icon="pi pi-plus" @click="abrirNueva" />
    </div>

    <!-- Tabs gastos / ingresos -->
    <div class="tab-bar">
      <button :class="['tab-btn', { active: tabActivo === 'gasto' }]" @click="tabActivo = 'gasto'">
        <i class="pi pi-arrow-down-right"></i> Gastos
        <span class="tab-count">{{ store.gastoCats.length }}</span>
      </button>
      <button :class="['tab-btn', { active: tabActivo === 'ingreso' }]" @click="tabActivo = 'ingreso'">
        <i class="pi pi-arrow-up-right"></i> Ingresos
        <span class="tab-count">{{ store.ingresoCats.length }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.cargando" class="loading-center">
      <ProgressSpinner strokeWidth="3" />
    </div>

    <!-- Grid categorías -->
    <div v-else class="cats-grid">
      <div
        v-for="cat in catsFiltradas"
        :key="cat._id"
        class="cat-card card"
      >
        <div class="cat-icon" :style="`background: ${cat.color}22; color: ${cat.color}`">
          <i :class="['pi', cat.icono]"></i>
        </div>
        <div class="cat-info">
          <span class="cat-nombre">{{ cat.nombre }}</span>
          <span class="cat-tipo text-muted">{{ etiquetaTipo(cat.tipo_transaccion) }}</span>
        </div>
        <div class="cat-dot" :style="`background: ${cat.color}`"></div>
        <div class="cat-acciones">
          <Button icon="pi pi-pencil" text rounded size="small" @click="abrirEditar(cat)" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmarEliminar(cat)" />
        </div>
      </div>

      <!-- Empty para este tab -->
      <div v-if="catsFiltradas.length === 0" class="empty-tab card">
        <i class="pi pi-tag"></i>
        <p>Sin categorías de {{ tabActivo === 'gasto' ? 'gasto' : 'ingreso' }}</p>
      </div>
    </div>

    <!-- Dialog crear / editar -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editando ? 'Editar categoría' : 'Nueva categoría'"
      :style="{ width: '420px' }"
      modal
      :draggable="false"
    >
      <form @submit.prevent="guardar" class="dialog-form">

        <div class="field">
          <label>Nombre *</label>
          <InputText v-model="form.nombre" placeholder="ej. Alimentación, Salario" fluid />
          <small v-if="errors.nombre" class="error">{{ errors.nombre }}</small>
        </div>

        <div class="field">
          <label>Tipo *</label>
          <Select
            v-model="form.tipo_transaccion"
            :options="tipoOptions"
            optionLabel="label"
            optionValue="value"
            fluid
          />
        </div>

        <div class="field">
          <label>Color</label>
          <div class="color-picker-row">
            <div
              v-for="c in coloresPredefinidos"
              :key="c"
              class="color-dot"
              :class="{ selected: form.color === c }"
              :style="`background:${c}`"
              @click="form.color = c"
            ></div>
          </div>
        </div>

        <div class="field">
          <label>Ícono</label>
          <div class="iconos-grid">
            <div
              v-for="icono in iconosPredefinidos"
              :key="icono"
              class="icono-btn"
              :class="{ selected: form.icono === icono }"
              :style="form.icono === icono ? `border-color:${form.color};color:${form.color}` : ''"
              @click="form.icono = icono"
            >
              <i :class="['pi', icono]"></i>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="preview-row">
          <div class="cat-icon" :style="`background: ${form.color}22; color: ${form.color}`">
            <i :class="['pi', form.icono]"></i>
          </div>
          <span style="font-size:0.9rem;font-weight:600">{{ form.nombre || 'Sin nombre' }}</span>
        </div>

        <div class="dialog-footer">
          <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
          <Button
            :label="editando ? 'Guardar cambios' : 'Crear categoría'"
            icon="pi pi-check"
            type="submit"
            :loading="guardando"
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
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { useCategoriasStore } from '../stores/categorias'

const store   = useCategoriasStore()
const confirm = useConfirm()
const toast   = useToast()

const tabActivo     = ref('gasto')
const dialogVisible = ref(false)
const editando      = ref(false)
const guardando     = ref(false)
const catActual     = ref(null)

const tipoOptions = [
  { label: '💸 Gasto',   value: 'gasto'   },
  { label: '💰 Ingreso', value: 'ingreso' },
]

const coloresPredefinidos = [
  '#f59e0b','#ef4444','#10b981','#6366f1','#3b82f6',
  '#8b5cf6','#f97316','#06b6d4','#84cc16','#64748b',
]

const iconosPredefinidos = [
  'pi-shopping-cart','pi-car','pi-heart','pi-bolt','pi-book',
  'pi-shopping-bag','pi-home','pi-star','pi-wallet','pi-briefcase',
  'pi-music','pi-phone','pi-gift','pi-airplane','pi-graduation-cap',
  'pi-tag','pi-plus-circle','pi-building','pi-money-bill','pi-chart-bar',
]

const formVacio = () => ({
  nombre: '', tipo_transaccion: 'gasto', color: '#6366f1', icono: 'pi-tag',
})

const form   = reactive(formVacio())
const errors = reactive({})

// Filtrar por tab activo
const catsFiltradas = computed(() =>
  store.categorias.filter(c => c.activa !== false && c.tipo_transaccion === tabActivo.value)
)

onMounted(() => store.cargar())

function abrirNueva() {
  editando.value = false
  catActual.value = null
  Object.assign(form, { ...formVacio(), tipo_transaccion: tabActivo.value })
  Object.assign(errors, {})
  dialogVisible.value = true
}

function abrirEditar(cat) {
  editando.value = true
  catActual.value = cat
  Object.assign(form, {
    nombre: cat.nombre,
    tipo_transaccion: cat.tipo_transaccion,
    color: cat.color || '#6366f1',
    icono: cat.icono || 'pi-tag',
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
    if (editando.value) {
      await store.actualizar(catActual.value._id, { ...form })
      toast.add({ severity: 'success', summary: 'Categoría actualizada', life: 3000 })
    } else {
      await store.crear({ ...form })
      toast.add({ severity: 'success', summary: 'Categoría creada', life: 3000 })
    }
    dialogVisible.value = false
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 5000 })
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(cat) {
  confirm.require({
    message: `¿Desactivar la categoría "${cat.nombre}"?`,
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, desactivar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.eliminar(cat._id)
      toast.add({ severity: 'info', summary: 'Categoría desactivada', life: 3000 })
    },
  })
}

const etiquetaTipo = (t) => ({ gasto: 'Gasto', ingreso: 'Ingreso', ambos: 'Ambos' }[t] || t)
</script>

<style scoped>
.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--fc-border);
  border-radius: var(--fc-radius-sm);
  background: transparent;
  color: var(--fc-text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn:hover { background: var(--fc-surface-2); color: var(--fc-text); }
.tab-btn.active {
  background: rgba(99,102,241,0.15);
  color: var(--fc-primary-light);
  border-color: var(--fc-primary);
}

.tab-count {
  background: var(--fc-surface-2);
  border-radius: 999px;
  padding: 0 0.5rem;
  font-size: 0.75rem;
}

.loading-center { display:flex; justify-content:center; padding:4rem; }

.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.cat-card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.25rem;
  transition: background 0.2s;
}

.cat-card:hover { background: var(--fc-surface-2); }

.cat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.cat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cat-nombre {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-tipo { font-size: 0.75rem; }

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cat-acciones {
  display: flex;
  gap: 0.15rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.cat-card:hover .cat-acciones { opacity: 1; }

.empty-tab {
  grid-column: 1/-1;
  text-align: center;
  padding: 2rem;
  color: var(--fc-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Dialog */
.dialog-form { display:flex; flex-direction:column; gap:1rem; padding-top:0.5rem; }
.field { display:flex; flex-direction:column; gap:0.4rem; }
.field label { font-size:0.85rem; font-weight:600; color:var(--fc-text-muted); }
.error { color:var(--fc-danger); font-size:0.8rem; }

.color-picker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
}

.color-dot:hover { transform: scale(1.15); }
.color-dot.selected { border-color: white; transform: scale(1.2); }

.iconos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.icono-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--fc-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--fc-text-muted);
  transition: all 0.15s;
  font-size: 0.9rem;
}

.icono-btn:hover { background: var(--fc-surface-2); color: var(--fc-text); }
.icono-btn.selected { background: rgba(99,102,241,0.1); }

.preview-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--fc-surface-2);
  border-radius: var(--fc-radius-sm);
}

.dialog-footer { display:flex; justify-content:flex-end; gap:0.75rem; padding-top:0.5rem; }
</style>
