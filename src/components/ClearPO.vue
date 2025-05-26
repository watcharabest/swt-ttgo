<template>
    <div class="form-page">
    <h1>Clear Display</h1
        >
    <form @submit.prevent="onDelete">
        <label for="deleteProductOrder">Clear Display</label>
        <div class="input-section">
            <input id="deleteProductOrder" v-model="deletePo" type="text" placeholder="Enter Product Order" :class="{ invalid: productOrderError }"/>
            <span v-if="productOrderError" class="error-text">Required</span>
        </div>
        <button type="submit" :disabled="loading" class="btn-clear">{{ loading ? 'Deleting…' : 'Clear' }}</button>
        <p v-if="deleteSuccess" class="success">Clear Success!</p>
        <p v-if="deleteError" class="error">{{ deleteError }}</p>
    </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const deletePo = ref('')
const loading = ref(false)
const deleteSuccess = ref(false)
const deleteError = ref('')
const productOrderError = ref(false)

const onDelete = async () => {
  if (!deletePo.value.trim()) {
    productOrderError.value = true
    return
  }
  productOrderError.value = false

  loading.value = true
  deleteSuccess.value = false
  deleteError.value = ''

  try {
    await axios.post('https://10.100.67.37:8000/clear-display', { product_order: deletePo.value })
    deleteSuccess.value = true
    deletePo.value = ''
  } catch (error) {
    deleteError.value = error.message || 'Failed to clear display'
  } finally {
    loading.value = false
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

/* “Lookup” mode button */
.btn-clear {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background: #FCCF61 ;
  color: #2c3e50;
  width: 100%;
  margin-top: 1rem;
}
.btn-clear:hover { color : #fff }

.success { color: #080 }
.error-text { color:#c00 }
</style>