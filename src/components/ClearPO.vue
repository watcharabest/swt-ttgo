<template>
    <div class="form-page">
    <h1>Clear Tray ID</h1
        >
    <form @submit.prevent="onDelete">
        <label for="deleteProductOrder">Product Order</label>
        <div class="input-section">
            <input id="deleteProductOrder" v-model="deletePo" type="text" placeholder="Enter Product Order" :class="{ invalid: productOrderError }"/>
            <span v-if="productOrderError" class="error">Required</span>
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
    await axios.post(`${__API_BASE_URL__}/clear-display`, { product_order: deletePo.value });
    deleteSuccess.value = true
    deletePo.value = ''
  } catch (error) {
    deleteError.value = error.response?.data?.detail || error.message || 'Failed to clear display'
}
 finally {
    loading.value = false   
  }
}
</script>



<style scoped>
.form-page {   
  max-width: 500px;
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
  width: 100%;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: #f8fafc;
  transition: all 0.3s ease;
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

.btn-clear {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  background: #ef4444;
  color: white;
  width: 100%;
  margin-top: 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-clear:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.btn-clear:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.success { 
  color: #059669;
  padding: 0.75rem;
  background: #ecfdf5;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.error { 
  color: #ef4444;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

@media (max-width: 480px) {
  .form-page {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .btn-clear {
    padding: 0.75rem;
  }
}
</style>