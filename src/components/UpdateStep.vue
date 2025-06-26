L<template>
  <div class="form-page">
    <h1>Send Product Info</h1>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="form-group">
        <label for="order">Product Order</label>
        <div class="input-with-scanner">
          <input id="order" v-model="order" type="text" required placeholder="Enter Product Order"
            :class="{ invalid: orderError }" />
          <button type="button" @click="toggleOrderScanner" :disabled="loading" class="scan-btn">
            📱 Scan QR
          </button>
        </div>
        <span v-if="orderError" class="error-text">Please fill this field</span>
      </div>

      <div class="form-group">
        <label for="mac" autocomplete="on">MAC Address</label>
        <div class="input-with-scanner">
          <input id="mac" name="serial-number" v-model="mac" type="text" required placeholder="Enter MAC Address"
            :class="{ invalid: macError }" />
          <button type="button" @click="toggleScanner" :disabled="loading" class="scan-btn">
            📱 Scan QR
          </button>
        </div>
        <span v-if="macError" class="error-text">Please fill this field</span>
      </div>

      <!-- QR Scanner Modal -->
      <div v-if="showScanner || showOrderScanner" class="scanner-modal" @click="closeScanner">
        <div class="scanner-container" @click.stop>
          <div class="scanner-header">
            <h3>Scan QR Code</h3>
            <button type="button" @click="closeScanner" class="close-btn">✕</button>
          </div>

          <div class="scanner-content">
            <QrcodeStream @detect="onDetect" @error="onError" class="scanner-video" :constraints="{
              facingMode: currentCamera,
              width: { ideal: isMicroMode ? 640 : 480 },
              height: { ideal: isMicroMode ? 480 : 360 },
              zoom: isMicroMode ? 4 : 1,
              focusMode: 'continuous',
              pointsOfInterest: [{ x: 0.5, y: 0.5 }],
              advanced: isMicroMode ? [
                { contrast: 100 },
                { brightness: 0 },
                { sharpness: 100 }
              ] : []
            }" :track="paintBoundingBox" />
            <div class="scanner-overlay">
              <div class="scanner-frame" :class="{ 'micro-mode': isMicroMode }"></div>
              <button v-if="hasMultipleCameras" @click="switchCamera" class="floating-camera-btn"
                :title="currentCamera === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'">
                {{ currentCamera === 'user' ? '📷' : '📱' }}
              </button>
            </div>
          </div>
          <div class="scanner-footer">
            <p v-if="scannerError" class="scanner-error">{{ scannerError }}</p>
            <div class="scanner-tips">
              <button type="button" @click="toggleMicroMode" class="change-mode-btn">
                📱 Change Mode
              </button>
            </div>
          </div>
        </div>
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
const showOrderScanner = ref(false)
const scannerError = ref('')
const hasMultipleCameras = ref(false)
const currentCamera = ref('environment') // Changed from 'environment' to 'user' for front camera
const isMicroMode = ref(false)

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

    if (showOrderScanner.value) {
      // For product order, accept any non-empty string
      if (qrData && qrData.trim()) {
        order.value = qrData.trim()
        closeScanner()

        // Show success notification
        success.value = true
        setTimeout(() => {
          success.value = false
        }, 2000)
      } else {
        scannerError.value = 'Invalid product order. Please scan again.'
        setTimeout(() => {
          scannerError.value = ''
        }, 3000)
      }
    } else {
      // Existing MAC address validation
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
      if (qrData && macRegex.test(qrData)) {
        mac.value = qrData
        closeScanner()

        // Show success notification
        success.value = true
        setTimeout(() => {
          success.value = false
        }, 2000)
      } else {
        scannerError.value = 'Invalid MAC address format. Please scan again.'
        setTimeout(() => {
          scannerError.value = ''
        }, 3000)
      }
    }
  }
}

const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const { boundingBox: { x, y, width, height } } = detectedCode

    // Draw enhanced bounding box
    ctx.lineWidth = 4
    ctx.strokeStyle = isMicroMode.value ? '#8DBAED' : '#00ff00'
    ctx.strokeRect(x, y, width, height)

    // Add corner markers for better visual feedback
    const cornerSize = 20
    ctx.beginPath()
    // Top-left corner
    ctx.moveTo(x, y + cornerSize)
    ctx.lineTo(x, y)
    ctx.lineTo(x + cornerSize, y)
    // Top-right corner
    ctx.moveTo(x + width - cornerSize, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + cornerSize)
    // Bottom-right corner
    ctx.moveTo(x + width, y + height - cornerSize)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x + width - cornerSize, y + height)
    // Bottom-left corner
    ctx.moveTo(x + cornerSize, y + height)
    ctx.lineTo(x, y + height)
    ctx.lineTo(x, y + height - cornerSize)
    ctx.stroke()

    // Add status text
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = isMicroMode.value ? '#8DBAED' : '#00ff00'
    ctx.fillText('QR Code Found!', x, y > 20 ? y - 10 : y + height + 25)
  }
}

const onError = (err) => {
  console.error('QR Scanner error:', err)
  scannerError.value = `Scanner error: ${err.message || 'Camera access denied'}`
}

const closeScanner = () => {
  showScanner.value = false
  showOrderScanner.value = false
  scannerError.value = ''
}

const switchCamera = () => {
  if (hasMultipleCameras.value) {
    currentCamera.value = currentCamera.value === 'environment' ? 'user' : 'environment'
  }
}

const toggleMicroMode = () => {
  isMicroMode.value = !isMicroMode.value
}

const toggleOrderScanner = async () => {
  if (!showOrderScanner.value) {
    const hasCamera = await checkCameraSupport()
    if (!hasCamera) {
      scannerError.value = 'No camera found on this device'
      return
    }
    startOrderScanner()
  } else {
    closeScanner()
  }
}

const startOrderScanner = async () => {
  try {
    showOrderScanner.value = true
    scannerError.value = ''
  } catch (err) {
    console.error('Scanner start failed:', err)
    scannerError.value = `Camera error: ${err.message}`
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
    await axios.post('https://10.100.107.164:8000/update_mac_product', {
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


<style src="../assets/map.css"></style>