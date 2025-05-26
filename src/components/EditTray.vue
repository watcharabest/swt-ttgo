<template>
  <div class="form-page">
    <h1>Lookup & Edit Tray</h1>
    <!-- Product Order Input -->
    <label for="productOrder">Product Order</label>
    <div class="input-section">
      <input
        id="productOrder"
        v-model="productOrder"
        type="text"
        placeholder="Enter Product Order"
        :class="{ invalid: productOrderError }"
      />
      <span v-if="productOrderError" class="error-text">Required</span>
    </div>
    <!-- Initial Lookup Button -->
    <div v-if="!searched" class="lookup-button">
    <button @click="handleAction" :disabled="loading" class="btn-action">
        {{ actionLabel }}
      </button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Table Section -->
    <div v-if="searched">
      <div v-if="found">
        <h2 class="mt-6 "style="text-align: center;">Tray Management (12 slots)</h2>
        <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tray ID</th>
              <th v-if="editMode">New Tray ID</th>
              <th v-if="editMode">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr class="main-row">
              <td>Main Tray</td>
              <td>{{ trayMain }}</td>
              <td v-if="editMode"></td>
              <td v-if="editMode"></td>
            </tr>
            <tr v-for="(id, i) in childTrayIds.slice(0, 11)" :key="i">
              <td>{{ i + 2 }}</td>
              <td>{{ id || '-' }}</td>
              <td v-if="editMode">
                <input
                  v-model="newTrayInputs[i + 1]"
                  type="text"
                  placeholder="Enter Tray ID"
                  class="input-new"
                  @keyup.enter="acceptTray(i + 1)"
                />
              </td>
              <td v-if="editMode">
                <button
                  v-if="id"
                  class="btn-delete-row"
                  @click="deleteTray(i + 1)"
                >Delete</button>
                <button
                  v-else
                  class="btn-accept-row"
                  @click="acceptTray(i + 1)"
                  :disabled="!newTrayInputs[i + 1]"
                >Accept</button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <!-- Edit Controls on Right -->
        <div v-if="found" class="table-action">
          <button @click="handleAction" class="btn-action" :class="editMode ? 'btn-lookup' : 'btn-edit'"
          >
            {{ editMode ? 'Lookup' : 'Edit' }}
          </button>
        </div>
        <div class="action-controls" v-if="editMode">
          <button class="btn-clear" @click="clearTray">Clear All</button>
        </div>
        <button
          class="btn-submit-final"
          :disabled="submitting"
          @click="submitTrayInfo"
        >
          {{ submitting ? 'Submitting…' : 'Submit to Get Tray Info' }}
        </button>
        <p v-if="submitMessage" class="success">{{ submitMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const productOrder = ref('')
const trayMain = ref('')
const trayIds = ref(Array(12).fill(''))
const newTrayInputs = ref(Array(12).fill(''))
const loading = ref(false)
const errorMessage = ref('')
const searched = ref(false)
const found = ref(false)
const productOrderError = ref(false)
const editMode = ref(false)
const submitting = ref(false)
const submitMessage = ref('')
const childTrayIds = ref(Array(12).fill(''))

const actionLabel = computed(() => {
  return searched.value && !editMode.value ? 'Edit' : 'Lookup'
})

async function handleAction() {
  if (!searched.value || editMode.value) {
    await lookupTray()
  } else {
    editMode.value = true
  }
}

const lookupTray = async () => {
  productOrderError.value = !productOrder.value
  if (productOrderError.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.post(
      'https://10.100.67.37:8000/lookup-product-order',
      { product_order: productOrder.value }
    )
    trayMain.value = res.data.tray_id_main
    childTrayIds.value = res.data.tray_ids    // exactly what comes back
    trayIds.value       = [ trayMain.value, ...childTrayIds.value ]
    newTrayInputs.value = Array(12).fill('')
    found.value = true
  } catch (err) {
    found.value = false
    errorMessage.value = err.response?.data?.detail || 'Error fetching data'
  } finally {
    loading.value = false
    searched.value = true
    editMode.value = false
  }
}

const acceptTray = async (index) => {
  const newId = newTrayInputs.value[index]
  if (!newId || !editMode.value) return
  if (!confirm(`Add new tray ID "${newId}" at slot #${index + 1}?`)) return
  try {
    await axios.post(
      'https://10.100.67.37:8000/add-tray',
      { tray_id_main: trayMain.value, tray_id: newId }
    )
    await lookupTray()
  } catch {
    alert('Failed to add tray')
  }
}

const deleteTray = async (index) => {
  const idToDelete = trayIds.value[index]
  if (!editMode.value) return
  if (!confirm(`Delete tray ID "${idToDelete}" at slot #${index + 1}?`)) return
  try {
    await axios.post(
      'https://10.100.67.37:8000/delete-tray',
      { tray_id_main: trayMain.value, tray_id: idToDelete }
    )
    await lookupTray()
  } catch {
    alert('Failed to delete tray')
  }
}

const clearTray = async () => {
  if (!editMode.value) return
  if (!confirm(`Clear all trays for PO "${productOrder.value}"?`)) return
  try {
    await axios.post(
      'https://10.100.67.37:8000/clear-tray',
      { tray_id_main: trayMain.value }
    )
    await lookupTray()
  } catch {
    alert('Failed to clear trays')
  }
}

const submitTrayInfo = async () => {
  submitting.value = true
  submitMessage.value = ''
  try {
    // หา first non-empty tray_id
    const firstTray = trayIds.value.find(v => v) || ''
    await axios.post(
      'https://10.100.67.37:8000/get-tray-info',
      {
        tray_id_main: trayMain.value,  // ให้ตรงกับ Pydantic model Tray
        tray_id: firstTray             // ส่ง tray_id ที่เลือก
      }
    )
    submitMessage.value = 'Submitted successfully.'
  } catch (err) {
    submitMessage.value = err.response?.data?.detail || 'Submit failed.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-page {   
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.85);
}

.input-section {   
  display :flex;
  gap: 0.5rem;
  align-items: center; 
}


label { display:block; font-weight:bold; margin-bottom:0.5rem }
input {
  flex: 1;
  padding: 0.5rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background: #8DBAED;
  color: #2c3e50;
  margin-top: 1rem;
  width: 100%;
}

.btn-action:hover {
  color : #fff;
}
/* Specific styling when inside .table-action */
.btn-edit {
  background: #FCCF61;    /* green */
}

.btn-edit:hover {
  color : #fff
}

/* “Lookup” mode button */
.btn-lookup {
  background: #8DBAED;    /* blue */
}

.btn-lookup:hover {
  color : #fff
}


.table-action { text-align:right; margin:0.5rem 0 }
.btn-clear {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background: #FCCF61 ;
  color: #2c3e50;
  width: 100%;
}
.btn-clear:hover { color : #fff }
.btn-accept-row { 
  background-color: #C7E299;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
 }
 .btn-accept-row:hover {
  color: #fff
 }
.btn-delete-row { 
  background-color: #F8AAB6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
 }
.btn-delete-row:hover {
  color: #fff;
}

.btn-submit-final { 
  background-color: #77BB78;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
  margin-top : 1rem;
  width: 100%;
 }
.table-container {
  max-width: 100%;
  overflow-x: auto;
}
.btn-submit-final:hover { color: #fff;}
.main-row td:nth-child(1), .main-row td:nth-child(2) { color:#c00; font-weight:bold }
table {   width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;}
th, td { border:1px solid #ccc; padding:0.5rem; text-align:left ;}
th:nth-child(1), td:nth-child(1) {
  width: 40%;
}
th:nth-child(2), td:nth-child(2) {
  width: 40%;
}
th:nth-child(3), td:nth-child(3) {
  width: 60%;
}
th:nth-child(4), td:nth-child(4) {
  width: 60%;
}
.error { margin-top:1rem; color:#c00 }
.success { margin-top:1rem; color:#080 }

.error-text { color:#c00 }
</style>
