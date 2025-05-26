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
            <img :src="previewUrl" alt="Preview" />
          </div>
          <p v-else>No image selected</p>
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
    await axios.post('https://10.100.67.37:8000/submit-product-info', data)
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
    await axios.delete(`https://10.100.67.37:8000/delete-product/${deletePo.value}`)
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
  margin: auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.toggle-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.toggle-buttons button {
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #ADCFF1;
  color: #2c3e50;
  font-weight: bold;
  transition: background 0.3s;
  cursor: pointer;
}
.toggle-buttons .active {
  background-color: #8DBAED;
  color: #fff;
}
.box {
  margin-top: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
input.invalid, select.invalid {
  border-color: #c00;
}
.error-text {
  color: #c00;
  font-size: 0.85rem;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.preview img {
  width: 100%;
  border-radius: 4px;
}

.btn-insert {
  background-color: #C7E299;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
}

.btn-submit {
  background-color: #C7E299;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
  width : 100%;
  margin-top: 1rem;
}

.btn-submit:hover {
  color: #fff;
}

.btn-upload {
  background-color: #C7E299;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
}

.btn-upload:hover {
  color: #fff;
}


.btn-delete {
  background-color: #F8AAB6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
}

.btn-delete:hover {
  color: #fff;
}

.success {
  color: #080;
  margin-top: 0.5rem;
}
.error {
  color: #c00;
  margin-top: 0.5rem;
}


</style>