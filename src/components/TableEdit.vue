<template>
  <div class="box-wrapper">
    <h1>Manage Product</h1>

    <div class="toggle-buttons">
      <button :class="{ active: mode === 'insert' }" @click="mode = 'insert'">Insert</button>
      <button :class="{ active: mode === 'delete' }" @click="mode = 'delete'">Delete</button>
    </div>

    <!-- Insert Form -->
    <div v-if="mode === 'insert'" class="box">
      <h2>Insert Product & Upload Image</h2>
      <form @submit.prevent="submit" novalidate>
        <!-- Select Table -->
        <div class="form-group">
          <label for="editTableSelect">Select Table to Edit</label>
          <select id="editTableSelect" v-model="editTable" class="table-select">
            <option value="table01">Table 01</option>
            <option value="table02">Table 02</option>
          </select>
        </div>

        <!-- Product Order -->
        <div class="form-group">
          <label for="productOrder">Product Order</label>
          <input
            id="productOrder"
            v-model="form.product_order"
            type="text"
            placeholder="Enter Product Order"
            :class="{ invalid: errors.product_order }"
          />
          <span v-if="errors.product_order" class="error-text">Required</span>
        </div>

        <!-- Fields table01 -->
        <div v-if="editTable === 'table01'">
          <div class="form-group">
            <label for="material">Material</label>
            <input
              id="material"
              v-model="form.material"
              type="text"
              placeholder="Enter Material"
              :class="{ invalid: errors.material }"
            />
            <span v-if="errors.material" class="error-text">Required</span>
          </div>
          <div class="form-group">
            <label for="nameProduct">Product Name</label>
            <input
              id="nameProduct"
              v-model="form.name_product"
              type="text"
              placeholder="Enter Name Product"
              :class="{ invalid: errors.name_product }"
            />
            <span v-if="errors.name_product" class="error-text">Required</span>
          </div>
          <div class="form-group">
            <label for="imageFileInput">Select Image</label>
            <input
              id="imageFileInput"
              type="file"
              accept="image/png, image/jpeg"
              @change="handleFileChange"
            />
          </div>
        </div>

        <!-- Fields table02 -->
        <div v-else>
          <div class="form-group">
            <label for="trayId">Tray ID</label>
            <input
              id="trayId"
              v-model="form.tray_id"
              type="text"
              placeholder="Enter Tray ID"
              :class="{ invalid: errors.tray_id }"
            />
            <span v-if="errors.tray_id" class="error-text">Required</span>
          </div>
          <div class="form-group">
            <label for="macAddress">MAC Address</label>
            <input
              id="macAddress"
              v-model="form.mac_address"
              type="text"
              placeholder="Enter MAC Address"
              :class="{ invalid: errors.mac_address }"
            />
            <span v-if="errors.mac_address" class="error-text">Required</span>
          </div>
        </div>
        <div v-if="editTable === 'table01'">
          <h2>Image Preview & Upload</h2>
          <div class="preview" v-if="previewUrl">
            <img :src="previewUrl" alt="Preview" />F
          </div>
          <p v-else class="error-img">No image selected</p>
        </div>
        <button type="submit" :disabled="loading" class="btn-submit">{{ loading ? 'Processing…' : 'Submit' }}</button>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">Success!</p>
      </form>
    </div>

    <!-- Delete Form -->
    <div v-if="mode === 'delete'" class="box">
      <h2>Delete Product</h2>
      <form @submit.prevent="onDelete">
        <div class="form-group">
          <label for="deleteProductOrder">Product Order</label>
          <input
            id="deleteProductOrder"
            v-model="deletePo"
            type="text"
            placeholder="Enter Product Order to Delete"
          />
        </div>
        <button type="submit" :disabled="loading" class="btn-delete">{{ loading ? 'Deleting…' : 'Delete' }}</button>
        <p v-if="deleteSuccess" class="success">Deleted!</p>
        <p v-if="deleteError" class="error">{{ deleteError }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const mode = ref('insert')
const editTable = ref('table01')
const form = reactive({ product_order: '', material: '', name_product: '', tray_id: '', mac_address: '' })
const errors = reactive({ product_order: false, material: false, name_product: false, tray_id: false, mac_address: false })
const loading = ref(false)
const error = ref(null)
const success = ref(false)

const selectedFile = ref(null)
const previewUrl = ref('')
const loadingImage = ref(false)
const imageError = ref(null)
const imageSuccess = ref(false)

const deletePo = ref('')
const deleteSuccess = ref(false)
const deleteError = ref(null)

function handleFileChange(e) {
  const file = e.target.files[0]
  selectedFile.value = file || null
  previewUrl.value = file ? URL.createObjectURL(file) : ''
}

const submit = async () => {
  // รีเซ็ตสถานะ
  imageError.value = null
  imageSuccess.value = false
  error.value = null
  success.value = false
  loading.value = true

  // ตรวจสอบฟิลด์พื้นฐาน
  if (!form.product_order) {
    error.value = 'Product Order is required'
    loading.value = false
    return
  }

  // ตรวจสอบฟิลด์ตาม table ที่เลือก
  if (editTable.value === 'table01') {
    if (!form.material || !form.name_product) {
      error.value = 'Material and Name Product are required'
      loading.value = false
      return
    }
  } else {
    if (!form.tray_id || !form.mac_address) {
      error.value = 'Tray ID and MAC Address are required'
      loading.value = false
      return
    }
  }

  // สร้าง FormData เดียว
  const data = new FormData()
  data.append('product_order', form.product_order)
  data.append('table', editTable.value)           // ระบุว่าจะเก็บลง table ไหน
  if (selectedFile.value) {
    data.append('image', selectedFile.value)      // ถ้ามีรูป ก็ใส่เข้าไป
  }
  if (editTable.value === 'table01') {
    data.append('material', form.material)
    data.append('name_product', form.name_product)
  } else {
    data.append('tray_id', form.tray_id)
    data.append('mac_address', form.mac_address)
  }

  try {
    // เรียก endpoint เดียว
    await axios.post('https://10.100.107.164:8000/submit-product-info', data)
    success.value = true
    imageSuccess.value = !!selectedFile.value
    // เคลียร์ฟอร์ม
    Object.assign(form, {
      product_order: '',
      material: '',
      name_product: '',
      tray_id: '',
      mac_address: ''
    })
    selectedFile.value = null
  } catch (err) {
    // แยก error ของรูปกับข้อมูล text ออกได้ถ้าต้องการ
    const msg = err.response?.data?.detail || err.message
    if (msg.includes('image')) imageError.value = msg
    else error.value = msg
  } finally {
    loading.value = false
  }
}


async function onDelete() {
  deleteSuccess.value = false
  deleteError.value = null
  if (!deletePo.value) {
    deleteError.value = 'Product Order is required'
    return
  }
  loading.value = true
  try {
    await axios.delete(`https://10.100.107.164:8000/delete-product/${deletePo.value}`)
    deleteSuccess.value = true
    deletePo.value = ''
  } catch (err) {
    deleteError.value = err.response?.data?.detail || err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.box-wrapper {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
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
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.toggle-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  background: #f8fafc;
  padding: 0.35rem;
  border-radius: 10px;
}

.toggle-buttons button {
  flex: 1;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-buttons button.active {
  background: #8DBAED;
  color: white;
  box-shadow: 0 2px 4px rgba(141, 186, 237, 0.2);
}

.toggle-buttons button:hover:not(.active) {
  background: #e2e8f0;
  color: #2c3e50;
}

.box {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
}

input[type="text"],
select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: #f8fafc;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
select:focus {
  outline: none;
  border-color: #8DBAED;
  box-shadow: 0 0 0 3px rgba(141, 186, 237, 0.2);
}

input[type="text"].invalid,
select.invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

input[type="file"] {
  width: 100%;
  padding: 0.6rem;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

input[type="file"]:hover {
  border-color: #8DBAED;
  background: #f1f5f9;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
}

.preview {
  margin: 1rem 0;
  text-align: center;
}

.preview img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-submit,
.btn-delete {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-submit {
  background: #C7E299;
  color: white;
  box-shadow: 0 2px 4px rgba(199, 226, 153, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #b3d486;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(199, 226, 153, 0.3);
}

.btn-delete {
  background: #ef4444;
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-delete:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.btn-submit:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.success {
  color: #059669;
  padding: 0.6rem;
  background: #ecfdf5;
  border-radius: 8px;
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.error {
  color: #ef4444;
  padding: 0.6rem;
  background: #fef2f2;
  border-radius: 8px;
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .box-wrapper {
    margin: 1rem;
    padding: 1.5rem;
  }

  .box {
    padding: 1.5rem;
  }

  input[type="text"],
  select,
  input[type="file"] {
    font-size: 16px; /* Prevent zoom on mobile */
  }

  .btn-submit,
  .btn-delete {
    padding: 0.875rem;
  }
}
</style>