<template>
  <div class="form-page">
    <h1>Send Product Info</h1>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="form-group">
        <label for="mac" autocomplete="on">MAC Address</label>
        <div class="input-with-scanner">
          <input
            id="mac" 
            name="serial-number"
            v-model="mac"
            type="text"
            required
            placeholder="Enter MAC Address"
            :class="{ invalid: macError }"
          />
          <button 
            type="button" 
            @click="toggleScanner"
            :disabled="loading"
            class="scan-btn"
          >
            📱 Scan QR
          </button>
        </div>
        <span v-if="macError" class="error-text">Please fill this field</span>
      </div>

      <!-- QR Scanner Modal -->
      <div v-if="showScanner" class="scanner-modal" @click="closeScanner">
        <div class="scanner-container" @click.stop>
          <div class="scanner-header">
            <h3>Scan QR Code</h3>
            <button type="button" @click="closeScanner" class="close-btn">✕</button>
          </div>
          
          <div class="scanner-content">
            <QrcodeStream 
              @detect="onDetect"
              @error="onError"
              class="scanner-video"
              :constraints="{
                facingMode: currentCamera,
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }"
              :track="paintBoundingBox"
            />
            <div class="scanner-overlay">
              <div class="scanner-frame"></div>
            </div>
          </div>
          
          <div class="scanner-footer">
            <p v-if="scannerError" class="scanner-error">{{ scannerError }}</p>
            <div class="scanner-tips">
              <p class="scanner-help">📱 Point your camera at the QR code</p>
              <ul class="tips-list">
                <li>Hold device steady</li>
                <li>Ensure good lighting</li>
                <li>Keep QR code within the green frame</li>
                <li>Move closer for small QR codes</li>
              </ul>
            </div>
            <button 
              type="button" 
              @click="switchCamera" 
              v-if="hasMultipleCameras" 
              class="switch-camera-btn"
            >
              🔄 Switch Camera
            </button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="order">Product Order</label>
        <div class = "input-with-scanner">
        <input
          id="order"
          v-model="order"
          type="text"
          required
          placeholder="Enter Product Order"
          :class="{ invalid: orderError }"
        />
        </div>
        <span v-if="orderError" class="error-text">Please fill this field</span>
      </div>

      <button type="submit" :disabled="loading" class="btn-send">
        {{ loading ? 'Sending…' : 'Send' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Request sent!</p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import axios from 'axios'

const mac = ref('')
const order = ref('')
const loading = ref(false)
const error = ref(null)
const success = ref(false)

// Error flags for each field
const macError = ref(false)
const orderError = ref(false)

// QR Scanner related
const showScanner = ref(false)
const scannerError = ref('')
const hasMultipleCameras = ref(false)
const currentCamera = ref('environment') // 'environment' for back camera, 'user' for front

// Check if device has multiple cameras
const checkCameraSupport = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    hasMultipleCameras.value = videoDevices.length > 1
    return videoDevices.length > 0
  } catch (err) {
    console.error('Camera check failed:', err)
    return false
  }
}

const toggleScanner = async () => {
  if (!showScanner.value) {
    const hasCamera = await checkCameraSupport()
    if (!hasCamera) {
      scannerError.value = 'No camera found on this device'
      return
    }
    startScanner()
  } else {
    closeScanner()
  }
}

const startScanner = async () => {
  try {
    showScanner.value = true
    scannerError.value = ''
  } catch (err) {
    console.error('Scanner start failed:', err)
    scannerError.value = `Camera error: ${err.message}`
  }
}

const onDetect = (detectedCodes) => {
  if (detectedCodes.length > 0) {
    const qrData = detectedCodes[0].rawValue
    console.log('QR Code detected:', qrData)
    
    if (qrData && qrData !== mac.value) {
      mac.value = qrData
      closeScanner()
      
      // แสดงการแจ้งเตือนสั้นๆ
      success.value = true
      setTimeout(() => {
        success.value = false
      }, 2000)
    }
  }
}

const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const { boundingBox: { x, y, width, height } } = detectedCode
    
    // วาดกรอบรอบ QR code ที่พบ
    ctx.lineWidth = 4
    ctx.strokeStyle = '#00ff00'
    ctx.strokeRect(x, y, width, height)
    
    // เพิ่มข้อความแสดงสถานะ
    ctx.font = '18px Arial'
    ctx.fillStyle = '#00ff00'
    ctx.fillText('QR Code Found!', x, y > 20 ? y - 10 : y + height + 25)
  }
}

const onError = (err) => {
  console.error('QR Scanner error:', err)
  scannerError.value = `Scanner error: ${err.message || 'Camera access denied'}`
}

const closeScanner = () => {
  showScanner.value = false
  scannerError.value = ''
}

const switchCamera = () => {
  if (hasMultipleCameras.value) {
    currentCamera.value = currentCamera.value === 'environment' ? 'user' : 'environment'
  }
}

const onSubmit = async () => {
  // Reset state
  console.log("onSubmit fired")
  error.value = null
  success.value = false
  macError.value = false
  orderError.value = false

  // Simple validation
  if (!mac.value) macError.value = true
  if (!order.value) orderError.value = true
  if (macError.value || orderError.value) {
    return
  }

  loading.value = true
  try {
    await axios.post('https://10.100.67.37:8000/get-product-info', {
      mac_address: mac.value,
      product_order: order.value
    })
    
    // Simulate API call for demo
    
    success.value = true
    // Clear form
    mac.value = ''
    order.value = ''
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.detail || 'Error sending request'
  } finally {
    loading.value = false
  }
}

// Initialize camera check on mount
onMounted(() => {
  checkCameraSupport()
})
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

.input-with-scanner {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

input {
  flex: 1;
  padding: 0.5rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input.invalid {
  border-color: #c00;
}

.scan-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.scan-btn:hover {
  background-color: #0056b3;
}

.scan-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  width: 100%;
}

.btn-send:hover {
  color: #fff;
}

/* QR Scanner Modal Styles */
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.scanner-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  max-width: 90vw;
  max-height: 90vh;
  width: 400px;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scanner-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
}

.scanner-content {
  position: relative;
  margin-bottom: 1rem;
}

.scanner-video {
  width: 100%;
  height: 300px;
  border-radius: 4px;
  background: #000;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.scanner-frame {
  width: 200px;
  height: 200px;
  border: 2px solid #00ff00;
  border-radius: 4px;
  background: transparent;
}

.scanner-footer {
  text-align: center;
}

.scanner-error {
  color: #c00;
  margin-bottom: 0.5rem;
}

.scanner-help {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.scanner-tips {
  text-align: left;
  margin-bottom: 1rem;
}

.tips-list {
  font-size: 0.8rem;
  color: #777;
  margin: 0.5rem 0;
  padding-left: 1.2rem;
}

.tips-list li {
  margin-bottom: 0.25rem;
}

.switch-camera-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.switch-camera-btn:hover {
  background-color: #545b62;
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-page {
    margin: 1rem;
    padding: 0.75rem;
  }
  
  .input-with-scanner {
    flex-direction: column;
    align-items: stretch;
  }
  
  .scan-btn {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .scanner-container {
    margin: 1rem;
    padding: 0.75rem;
  }
  
  .scanner-video {
    height: 250px;
  }
  
  .scanner-frame {
    width: 150px;
    height: 150px;
  }
}
</style>