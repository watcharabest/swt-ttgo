<template>
  <div class="form-page">
    <h1>Send Product Info</h1>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="form-group">
        <label for="mac" autocomplete="on">MAC Address</label>
        <input
          id="mac" 
          name="serial-number"
          v-model="mac"
          type="text"
          required
          placeholder="Enter MAC Address"
          :class="{ invalid: macError }"
        />
        <span v-if="macError" class="error-text">Please fill this field</span>
      </div>

      <div class="form-group">
        <label for="order">Product Order</label>
        <input
          id="order"
          v-model="order"
          type="text"
          required
          placeholder="Enter Product Order"
          :class="{ invalid: orderError }"
        />
        <span v-if="orderError" class="error-text">Please fill this field</span>
      </div>

      <button type="submit" :disabled="loading" class = "btn-send">
        {{ loading ? 'Sending…' : 'Send' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Request sent!</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api';

const mac     = ref('')
const order   = ref('')
const loading = ref(false)
const error   = ref(null)
const success = ref(false)

// error flags for each field
const macError   = ref(false)
const orderError = ref(false)

const onSubmit = async () => {
  // reset state
  error.value   = null
  success.value = false
  macError.value   = false
  orderError.value = false

  // simple validation
  if (!mac.value)   macError.value = true
  if (!order.value) orderError.value = true
  if (macError.value || orderError.value) {
    return
  }

  loading.value = true
  try {
    await api.post('/get-product-info', {
      mac_address: mac.value,
      product_order: order.value
    })
    success.value = true
    // clear form
    mac.value   = ''
    order.value = ''
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.detail || 'Error sending request'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.85);
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
input.invalid {
  border-color: #c00;
}
.error-text {
  color: #c00;
  font-size: 0.85rem;
}
button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  margin-top: 1rem;
  color: #c00;
}
.success {
  margin-top: 1rem;
  color: #080;
}

.btn-send {
  background-color: #C7E299;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #2c3e50;
}
.btn-send:hover{
  color: #fff;
}

</style>
  