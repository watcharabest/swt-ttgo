<template>
  <div class="form-page">
    <h1>Lookup & Edit Tray</h1>
    <!-- Product Order Input -->
    <label for="productOrder">Product Order</label>
    <div class="input-section">
      <input id="productOrder" v-model="productOrder" type="text" placeholder="Enter Product Order"
        :class="{ invalid: productOrderError }" @keyup.enter = "lookupTray"/>
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
        <h2 class="mt-6 " style="text-align: center;">Tray Management (12 slots)</h2>
        <div v-if="found" class="table-action">
          <button @click="handleAction" class="btn-action" :class="editMode ? 'btn-lookup' : 'btn-edit'">
            {{ editMode ? 'Lookup' : 'Edit' }}
          </button>
        </div>
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
              <!-- Main Tray -->
              <tr class="main-row">
                <td style="color: red;">Main Tray</td>
                <td style="color: red;">{{ trayMain }}</td>
                <td v-if="editMode">
                  <input v-model="newTrayInputs[0]" type="text" placeholder="Enter Main Tray ID" class="input-new"
                    @keyup.enter="acceptTray(0)" />
                </td>
                <td v-if="editMode">
                  <button class="btn-accept-row" @click="acceptTray(0)" :disabled="!newTrayInputs[0]">Accept</button>
                </td>
              </tr>

              <!-- Child Trays -->
              <tr v-for="(tray, i) in displayTrayList" :key="i">
                <td>{{ i + 2 }}</td>
                <td>{{ tray || '-' }}</td>
                <td v-if="editMode">
                  <input v-model="newTrayInputs[i + 1]" type="text" placeholder="Enter Tray ID" class="input-new"
                    @keyup.enter="acceptTray(i + 1)" />
                </td>
                <td v-if="editMode">
                  <div class="button-group">
                    <button v-if="tray" class="btn-delete-row" @click="deleteTray(i + 1)">Delete</button>
                    <button v-if="tray" class="btn-replace-row" @click="replaceTray(i + 1)"
                      :disabled="!newTrayInputs[i + 1]">Replace</button>
                    <button v-if="!tray" class="btn-accept-row" @click="acceptTray(i + 1)"
                      :disabled="!newTrayInputs[i + 1]">Accept</button>
                  </div>
                </td>
              </tr>
            </tbody>

          </table>
        </div>
        <!-- Edit Controls on Right -->

        <div class="action-controls" v-if="editMode">
          <button class="btn-clear" @click="clearTray">Clear All</button>
        </div>
        <button class="btn-submit-final" :disabled="submitting" @click="submitTrayInfo">
          {{ submitting ? 'Submitting…' : 'Submit to Get Tray Info' }}
        </button>
        <p v-if="submitMessage" class="success">{{ submitMessage }}</p>
      </div>
      <div v-else class="not-found-section">
        <button @click="resetSearch" class="btn-try-again">Try Again</button>
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

const displayTrayList = computed(() => {
  const traysWithValue = childTrayIds.value.filter(id => id); // กรองเฉพาะ tray ที่มีค่า
  if (editMode.value) {
    // เผื่อ 1 ช่องไว้เพิ่ม tray ใหม่
    return [...traysWithValue, ''];
  }
  return traysWithValue;
}
)

async function handleAction() {
  if (!searched.value || editMode.value) {
    await lookupTray()
  } else {
    editMode.value = true
  }
}

const lookupTray = async (preserveEditMode = false) => {
  productOrderError.value = !productOrder.value
  if (productOrderError.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.post(
      'https://10.100.10.139:8000/lookup-product-order',
      { product_order: productOrder.value }
    )
    trayMain.value = res.data.tray_id_main
    childTrayIds.value = res.data.tray_ids    // exactly what comes back
    trayIds.value = [trayMain.value, ...childTrayIds.value]
    newTrayInputs.value = Array(12).fill('')
    found.value = true
  } catch (err) {
    found.value = false
    errorMessage.value = 'Product order not found'
  } finally {
    loading.value = false
    searched.value = true
    if (!preserveEditMode) {
      editMode.value = false
    }
  }
}

const acceptTray = async (index) => {
  const newId = newTrayInputs.value[index]
  if (!newId || !editMode.value) return

  if (index === 0) {
    // Handle main tray ID update
    if (!confirm(`Update main tray ID to "${newId}"?`)) return
    try {
      await axios.post(
        'https://10.100.10.139:8000/update-main-tray-id',
        {
          old_tray_id: trayMain.value,
          new_tray_id: newId
        }
      )
      await lookupTray(true)
    } catch (err) {
      console.error('Error updating main tray:', err)
      alert('Failed to update main tray ID: ' + (err.response?.data?.detail || 'Unknown error'))
    }
  } else {
    // Only handle new tray additions
    if (!confirm(`Add new tray ID "${newId}" at slot #${index + 1}?`)) return
    try {
      await axios.post(
        'https://10.100.10.139:8000/add-tray',
        { tray_id_main: trayMain.value, tray_id: newId }
      )
      const firstTray = trayIds.value.find(v => v) || ''
      await axios.post(
        'https://10.100.10.139:8000/get-tray-info',
        {
          tray_id_main: trayMain.value,  // ให้ตรงกับ Pydantic model Tray
          tray_id: firstTray             // ส่ง tray_id ที่เลือก
        }
      )
      await lookupTray(true)
    } catch (err) {
      console.error('Error adding tray:', err)
      alert('Failed to add tray: ' + (err.response?.data?.detail || 'Unknown error'))
    }
  }
}

const deleteTray = async (index) => {
  const idToDelete = trayIds.value[index]
  if (!editMode.value) return
  if (!confirm(`Delete tray ID "${idToDelete}" at slot #${index + 1}?`)) return
  try {
    await axios.post(
      'https://10.100.10.139:8000/delete-tray',
      { tray_id_main: trayMain.value, tray_id: idToDelete }
    )
    const firstTray = trayIds.value.find(v => v) || ''
    await axios.post(
      'https://10.100.10.139:8000/get-tray-info',
      {
        tray_id_main: trayMain.value,  // ให้ตรงกับ Pydantic model Tray
        tray_id: firstTray             // ส่ง tray_id ที่เลือก
      }
    )
    await lookupTray(true)
  } catch {
    alert('Failed to delete tray')
  }
}

const clearTray = async () => {
  if (!editMode.value) return
  if (!confirm(`Clear all trays for PO "${productOrder.value}"?`)) return
  try {
    await axios.post(
      'https://10.100.10.139:8000/clear-tray',
      { tray_id_main: trayMain.value }
    )
    const firstTray = trayIds.value.find(v => v) || ''
    await axios.post(
      'https://10.100.10.139:8000/get-tray-info',
      {
        tray_id_main: trayMain.value,  // ให้ตรงกับ Pydantic model Tray
        tray_id: firstTray             // ส่ง tray_id ที่เลือก
      }
    )
    await lookupTray(true)
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
      'https://10.100.10.139:8000/get-tray-info',
      {
        tray_id_main: trayMain.value,  // ให้ตรงกับ Pydantic model Tray
        tray_id: firstTray             // ส่ง tray_id ที่เลือก
      }
    )
    submitMessage.value = 'Submitted successfully.'
    setTimeout(() => {
      submitMessage.value = ''
    }, 1000)
  } catch (err) {
    submitMessage.value = err.response?.data?.detail || 'Submit failed.'
  } finally {
    submitting.value = false
  }
}

const resetSearch = async () => {
  searched.value = false
  found.value = false
  errorMessage.value = ''
  productOrderError.value = false
  await lookupTray()
}

const replaceTray = async (index) => {
  const newId = newTrayInputs.value[index]
  const existingId = childTrayIds.value[index - 1]
  if (!newId || !editMode.value || !existingId) return

  if (!confirm(`Replace tray ID "${existingId}" with "${newId}"?`)) return
  try {
    await axios.post(
      'https://10.100.10.139:8000/update-tray-id',
      {
        old_tray_id: existingId,
        new_tray_id: newId
      }
    )
    await lookupTray(true)
  } catch (err) {
    console.error('Error replacing tray:', err)
    alert('Failed to replace tray ID: ' + (err.response?.data?.detail || 'Unknown error'))
  }
}
</script>

<style scoped>
.form-page {
  max-width: 750px;
  margin: 2rem auto;
  padding: 2rem;
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

h2 {
  color: #2c3e50;
  margin: 2rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 0.95rem;
}

input {
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 12px;
  box-shadow: 0px 2px 2px 2px rgba(0, 0, 0, 0.088);
  font-size: 1rem;
  transition: all 0.3s ease-in-out;
  background: #f8fafc;
}

input:focus {
  outline: none;
  border-color: #8DBAED;
  box-shadow: 0 0 0 3px rgba(141, 186, 237, 0.2);
}

input.invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.table-container {
  margin: 2rem 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background: #f8fafc;
  color: #2c3e50;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
}



td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: #f8fafc;
}

.main-row {
  background: #f1f5f9;
  font-weight: 600;
}

.input-new {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
}

.btn-action,
.btn-lookup,
.btn-edit,
.btn-clear,
.btn-submit-final {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action {
  background: #8DBAED;
  color: white;
  width: 100%;
  margin-top: 1rem;
  box-shadow: 0 2px 4px rgba(141, 186, 237, 0.2);
}

.btn-action:hover:not(:disabled) {
  background: #6ba8e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(141, 186, 237, 0.3);
}

.btn-lookup {
  background: #8DBAED;
  color: white;
}

.btn-edit {
  background: #FFE495;
  color: #2c3e50;
  transition: all 0.3s ease;
}

/* Make the edit button hover style more specific */
button.btn-action.btn-edit:hover {
  background: #FCCF61;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(252, 207, 97, 0.3);
}

.btn-clear {
  background: #FFE495;
  color: white;
  margin-top: 1rem;
  width: 100%;
}

.btn-clear:hover {
  background: #FCCF61;
}


.btn-submit-final {
  background: #C7E299;
  color: white;
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
}

.btn-submit-final:hover:not(:disabled) {
  background: #b3d486;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);
}

.btn-delete-row,
.btn-accept-row {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete-row {
  background: #ef4444;
  color: white;
}

.btn-accept-row {
  background: #C7E299;
  color: white;
}

.btn-delete-row:hover:not(:disabled) {
  background: #dc2626;
  /* Darker red */
  transform: translateY(-1px);
}

.btn-accept-row:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.1);
  background: #b3d486;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.error {
  color: #ef4444;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.success {
  color: #059669;
  padding: 0.75rem;
  background: #ecfdf5;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.table-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.action-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.not-found-section {
  text-align: center;
  ;
}

.btn-try-again {
  background: #FCCF61;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-try-again:hover {
  background: #6ba8e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(141, 186, 237, 0.3);
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.btn-replace-row {
  background: #8DBAED;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-replace-row:hover:not(:disabled) {
  background: #6ba8e0;
  transform: translateY(-1px);
  filter: brightness(1.1);
}

@media (max-width: 768px) {
  .form-page {
    margin: 1rem;
    padding: 1.5rem;
  }

  .table-container {
    margin: 1rem 0;
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }

  .btn-action,
  .btn-lookup,
  .btn-edit,
  .btn-clear,
  .btn-submit-final {
    width: 100%;
  }

  .table-action,
  .action-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
