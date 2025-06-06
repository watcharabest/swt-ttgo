L<template>
  <div class="form-page">
    <h1>Map Display</h1>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="form-group">
        <label for="order">Tray ID</label>
        <div class="input-with-scanner">
          <input id="tray" v-model="order" type="text" required placeholder="Enter Tray ID"
            :class="{ invalid: orderError }" />
          <button type="button" @click="toggleOrderScanner" :disabled="loading" class="scan-btn">
            📱 Scan QR
          </button>
        </div>
        <span v-if="orderError" class="error-text">Please fill this field</span>
      </div>

      <div class="form-group">
        <label for="mac" autocomplete="on">Display Mac Address</label>
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
    await axios.post('https://10.100.86.16:8000/update_tray_first', {
      mac_address: mac.value,
      tray_id: order.value
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

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.input-with-scanner {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

input {
  flex: 1;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
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

.scan-btn {
  background-color: #8DBAED;
  color: #fff;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(141, 186, 237, 0.2);
}

.scan-btn:hover {
  background-color: #6ba8e0;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(141, 186, 237, 0.3);
}

.scan-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
}

.btn-send {
  background-color: #C7E299;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #fff;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 2px 4px rgba(199, 226, 153, 0.2);
}

.btn-send:hover {
  background-color: #b3d486;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(199, 226, 153, 0.3);
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error {
  margin-top: 1rem;
  color: #ef4444;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  text-align: center;
}

.success {
  margin-top: 1rem;
  color: #059669;
  padding: 0.75rem;
  background: #ecfdf5;
  border-radius: 8px;
  text-align: center;
}

/* QR Scanner Modal Styles */
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.scanner-container {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
  width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.scanner-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #2c3e50;
}

.scanner-content {
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
}

.scanner-video {
  width: 100%;
  height: 350px;
  border-radius: 12px;
  background: #000;
  filter: contrast(1.2) brightness(1.1);
  object-fit: cover;
}

.scanner-video.micro-mode {
  filter: contrast(1.5) brightness(1.3) saturate(1.2);
  transform: scale(0.8);
  /* Add this line */
  transform-origin: center;
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
  width: 250px;
  height: 250px;
  border: 3px solid #00ff00;
  border-radius: 12px;
  background: transparent;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  animation: pulse 2s infinite;
  backdrop-filter: contrast(1.2) brightness(1.1);
  transition: all 0.3s ease;
}

.scanner-frame.micro-mode {
  border-color: #8DBAED;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(141, 186, 237, 0.3);
  backdrop-filter: contrast(1.5) brightness(1.3) saturate(1.2);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 0, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
  }
}

.scanner-frame.micro-mode {
  animation: pulseMicro 2s infinite;
}

@keyframes pulseMicro {
  0% {
    box-shadow: 0 0 0 0 rgba(141, 186, 237, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(141, 186, 237, 0), 0 0 0 9999px rgba(0, 0, 0, 0.7);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(141, 186, 237, 0), 0 0 0 9999px rgba(0, 0, 0, 0.7);
  }
}

.scanner-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 2px solid #f1f5f9;
}

.scanner-error {
  color: #ef4444;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
}

.scanner-help {
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.scanner-tips {
  text-align: left;
  margin-bottom: 1.5rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
}

.scanner-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.switch-camera-btn {
  display: none;
}

.micro-mode-btn {
  background-color: #8DBAED;
  color: #2c3e50;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(141, 186, 237, 0.2);
}

.micro-mode-btn:hover {
  background-color: #6ba8e0;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(141, 186, 237, 0.3);
}

.micro-mode-btn.active {
  background-color: #4CAF50;
  color: #fff;
}

/* Add floating camera button styles */
.floating-camera-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
}

.floating-camera-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.floating-camera-btn:active {
  transform: scale(0.95);
}

.change-mode-btn {
  background-color: #8DBAED;
  color: #fff;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(141, 186, 237, 0.2);
  width: 100%;
}

.change-mode-btn:hover {
  background-color: #6ba8e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(141, 186, 237, 0.3);
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-page {
    margin: 1rem;
    padding: 1.5rem;
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
    margin: 0.5rem;
    padding: 0.75rem;
  }

  .scanner-video {
    height: 240px;
  }

  .scanner-frame {
    width: 180px;
    height: 180px;
  }

  .floating-camera-btn {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
    top: 0.75rem;
    right: 0.75rem;
  }
}
</style>