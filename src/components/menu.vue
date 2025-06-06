<template>
  <div class="dashboard">

    <div class="dashboard-header">
      <div class="dashboard-grid">
        <div class="dashboard-card" @click="navigateTo('/update-tray')">
          <div class="card-icon updatetray">
            <i class="fas fa-sync-alt"></i>
          </div>
          <h3 class="card-title">Update Tray</h3>
          <p class="card-description">Mapping Tray ID To Mac Address (TTGO)</p>
          <p style="color: red;">Use When Don't Have Product Order </p>
          <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="dashboard-card" @click="navigateTo('/update')">
          <div class="card-icon update">
            <i class="fas fa-sync-alt"></i>
          </div>
          <h3 class="card-title">Update Product Order</h3>
          <p class="card-description">Mapping Product Order To Mac Address (TTGO)</p>
          <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="dashboard-card" @click="navigateTo('/tray')">
          <div class="card-icon tray">
            <i class="fas fa-utensils"></i>
          </div>
          <h3 class="card-title">Update Tray</h3>
          <p class="card-description">Add / Delete Tray List When Have Product Order</p>
          <p style="color: red;">Use When Have Product Order </p>
          <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="dashboard-card" @click="navigateTo('/table')">
          <div class="card-icon edit">
            <i class="fas fa-edit"></i>
          </div>
          <h3 class="card-title">Edit Database</h3>
          <p class="card-description">Insert / Delete Product Order</p>
          <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="dashboard-card" @click="navigateTo('/showtable')">
          <div class="card-icon table">
            <i class="fas fa-table"></i>
          </div>
          <h3 class="card-title">Table</h3>
          <p class="card-description">Display Table of Product Order and Track</p>
          <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="dashboard-card" @click="navigateTo('/clear')">
          <div class="card-icon clear">
            <i class="fas fa-table"></i>
          </div>
          <h3 class="card-title">Clear</h3>
          <p class="card-description">Clear Tray Data</p>
          <p style="color: red;">Use When Finish All Process</p>
          <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="dashboard-card no-hover">
          <h2 class="card-title" style="text-align: center;">Update</h2>
          <div class="scan-container">
            <button type="button" @click="toggleScanner" :disabled="loading" class="scan-btn">
              📱 Scan QR Code
            </button>
          </div>


        </div>
      </div>
    </div>
    <!-- QR Scanner Modal -->
    <div v-if="showScanner" class="scanner-modal" @click="closeScanner">
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
          <p v-if="scannerSuccess" class="scanner-success">{{ scannerSuccess }}</p>
          <div class="scanner-tips">
            <button type="button" @click="toggleMicroMode" class="change-mode-btn">
              📱 Change Mode
            </button>
            <button type="button" @click="resetScanState" class="reset-btn">
              🔄 Reset Scanner
            </button>
          </div>
          <div class="type-reference" v-if="scannedData.length > 0">
            <div class="type-list">
              <div v-for="(scan, index) in scannedData" :key="index"
                :class="['type-item', scan.type.toLowerCase().replace(' ', '-')]">
                <span class="type-label">{{ scan.type }}:</span>
                <span class="type-format">{{ scan.value }}</span>
              </div>
            </div>
            <div v-if="waitingForMac" class="scan-instruction">
              Please scan MAC Address
            </div>
            <div v-if="scannedData.length === 2 && 
                      scannedData[0].type === 'Tray ID' && 
                      scannedData[1].type === 'Tray ID'" 
                 class="tray-buttons">
              <button @click="handleTrayOperation('add')" class="tray-btn add">
                <i class="fas fa-plus"></i> Add Tray
              </button>
              <button @click="handleTrayOperation('change')" class="tray-btn change">
                <i class="fas fa-exchange-alt"></i> Change Tray
              </button>
              <button @click="handleTrayOperation('delete')" class="tray-btn delete">
                <i class="fas fa-trash"></i> Delete Tray
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import axios from 'axios'

const router = useRouter()
const navigateTo = (path) => router.push(path)

const productOrder = ref('')
const loading = ref(false)
const error = ref(null)
const success = ref(false)
const qrData = ref('')

// Error states
const macError = ref(false)
const orderError = ref(false)

// New state variables for tracking scans
const scanCount = ref(0)
const scannedData = ref([])
const waitingForMac = ref(false)

// QR Scanner related
const showScanner = ref(false)
const scannerError = ref('')
const scannerSuccess = ref('')
const hasMultipleCameras = ref(false)
const currentCamera = ref('environment')
const isMicroMode = ref(false)

// Add these refs for data classification
const dataType = ref('')
const isValidData = ref(true)

// Add new refs for tray management
const showTrayOptions = ref(false)
const trayOperation = ref('') // 'add', 'change', or 'delete'
const scannedTrayIds = ref([]) // Store scanned tray IDs

const resetScanState = () => {
  scanCount.value = 0
  scannedData.value = []
  productOrder.value = ''
  qrData.value = ''
  dataType.value = ''
  error.value = null
  macError.value = false
  orderError.value = false
  waitingForMac.value = false
  scannerSuccess.value = ''
}

const handleApiCall = async (data) => {
  // Reset error states
  error.value = null
  macError.value = false
  orderError.value = false

  try {
    loading.value = true
    let endpoint = '/get-product-info'
    let requestData = {}

    // Determine endpoint and request data based on the scan sequence
    if (data.endpoint) {
      // If endpoint is explicitly provided (for MAC first scenarios)
      endpoint = data.endpoint
      if (endpoint === '/get-product-info') {
        requestData = {
          mac_address: data.macAddress,
          product_order: data.productOrder
        }
      } else if (endpoint === '/update_tray_first') {
        requestData = {
          mac_address: data.macAddress,
          tray_id: data.trayId
        }
      }
    } else {
      // Handle original scan sequences
      if (data.trayId) {
        endpoint = '/get-product-info-tray'
        requestData = {
          product_order: data.productOrder,
          mac_address: data.macAddress,
          tray_id: data.trayId
        }
      } else {
        requestData = {
          product_order: data.productOrder,
          mac_address: data.macAddress
        }
      }
    }

    const response = await axios.post(`https://10.100.86.16:8000${endpoint}`, requestData)
    success.value = true
    console.log('API Response:', response.data)
    resetScanState()
    return response.data
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.detail || 'Error sending request'
    throw err
  } finally {
    loading.value = false
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

// Add function to classify data
const classifyData = (data) => {
  // Product Order pattern (starts with 92 and has 9 digits)
  if (/^92\d{7}$/.test(data)) {
    return 'Product Order'
  }
  // Tray ID pattern (starts with T and follows T##-######)
  else if (/^T\d{2}-\d{6}$/.test(data)) {
    return 'Tray ID'
  }
  // MAC Address pattern (6 pairs of hex digits)
  else if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(data)) {
    return 'MAC Address'
  }
  return 'Unknown'
}

// Add these helper functions before onDetect
const handleFirstScan = (currentDataType, trimmedData) => {
  // Allow any type for first scan now
  scanCount.value++
  return true
}

const handleSecondScan = async (currentDataType, trimmedData) => {
  const firstScanType = scannedData.value[0].type

  if (firstScanType === 'Tray ID') {
    if (currentDataType === 'Product Order') {
      waitingForMac.value = true
      scanCount.value++
    } else if (currentDataType === 'Tray ID') {
      // Store both tray IDs
      scannedTrayIds.value = [scannedData.value[0].value, trimmedData]
      showTrayOptions.value = true
      return false
    } else if (currentDataType === 'MAC Address') {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await handleApiCall({
          trayId: scannedData.value[0].value,
          macAddress: trimmedData,
          endpoint: '/update_tray_first'
        })
        resetScanState()
        scannerSuccess.value = '✅ Scan successful! Ready for next scan.'
        scannerError.value = ''
        setTimeout(() => {
          scannerSuccess.value = ''
        }, 2000)
      } catch (err) {
        scannerError.value = '❌ API call failed. Please try again.'
        scannerSuccess.value = ''
      }
    }
  } else if (firstScanType === 'Product Order') {
    // Original Product Order first flow
    if (currentDataType === 'Product Order') {
      scannerError.value = 'Cannot scan Product Order twice!'
      scannedData.value.pop()
      return false
    } else if (currentDataType === 'MAC Address') {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await handleApiCall({
          productOrder: scannedData.value[0].value,
          macAddress: trimmedData
        })
        resetScanState()
        scannerSuccess.value = '✅ Scan successful! Ready for next scan.'
        scannerError.value = ''
        setTimeout(() => {
          scannerSuccess.value = ''
        }, 2000)
      } catch (err) {
        scannerError.value = '❌ API call failed. Please try again.'
        scannerSuccess.value = ''
      }
    } else if (currentDataType === 'Tray ID') {
      waitingForMac.value = true
      scanCount.value++
    }
  } else if (firstScanType === 'MAC Address') {
    // MAC Address first flow
    if (currentDataType === 'Product Order') {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await handleApiCall({
          macAddress: scannedData.value[0].value,
          productOrder: trimmedData,
          endpoint: '/get-product-info'
        })
        resetScanState()
        scannerSuccess.value = '✅ Scan successful! Ready for next scan.'
        scannerError.value = ''
        setTimeout(() => {
          scannerSuccess.value = ''
        }, 2000)
      } catch (err) {
        scannerError.value = '❌ API call failed. Please try again.'
        scannerSuccess.value = ''
      }
    } else if (currentDataType === 'Tray ID') {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await handleApiCall({
          macAddress: scannedData.value[0].value,
          trayId: trimmedData,
          endpoint: '/update_tray_first'
        })
        resetScanState()
        scannerSuccess.value = '✅ Scan successful! Ready for next scan.'
        scannerError.value = ''
        setTimeout(() => {
          scannerSuccess.value = ''
        }, 2000)
      } catch (err) {
        scannerError.value = '❌ API call failed. Please try again.'
        scannerSuccess.value = ''
      }
    } else if (currentDataType === 'MAC Address') {
      scannerError.value = 'Cannot scan MAC Address twice!'
      scannedData.value.pop()
      return false
    }
  }
  return true
}

const handleThirdScan = async (currentDataType, trimmedData) => {
  if (scanCount.value === 2 && waitingForMac.value) {
    if (currentDataType === 'MAC Address') {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await handleApiCall({
          productOrder: scannedData.value[1].value,
          trayId: scannedData.value[0].value,
          macAddress: trimmedData,
          endpoint: '/get-product-info-tray'
        })
        resetScanState()
        scannerSuccess.value = '✅ Scan successful! Ready for next scan.'
        scannerError.value = ''
        setTimeout(() => {
          scannerSuccess.value = ''
        }, 2000)
      } catch (err) {
        scannerError.value = '❌ API call failed. Please try again.'
        scannerSuccess.value = ''
      }
    } else {
      scannerError.value = 'Please scan a MAC Address'
      scannedData.value.pop()
      return false
    }
  }
  return true
}

const updateScanDisplay = (currentDataType, trimmedData) => {
  qrData.value = trimmedData
  dataType.value = currentDataType
  productOrder.value = trimmedData
  scannedData.value.push({
    type: currentDataType,
    value: trimmedData
  })
}

// Main onDetect function
const onDetect = async (detectedCodes) => {
  if (detectedCodes.length > 0) {
    const detectedData = detectedCodes[0].rawValue
    console.log('QR Code detected:', detectedData)

    if (detectedData && detectedData.trim()) {
      const trimmedData = detectedData.trim()
      const currentDataType = classifyData(trimmedData)

      // Update display for current scan
      updateScanDisplay(currentDataType, trimmedData)

      // Handle different scan sequences
      if (scanCount.value === 0) {
        if (!handleFirstScan(currentDataType, trimmedData)) return
      } else if (scanCount.value === 1) {
        if (!await handleSecondScan(currentDataType, trimmedData)) return
      } else if (scanCount.value === 2) {
        if (!await handleThirdScan(currentDataType, trimmedData)) return
      }

      success.value = true
      setTimeout(() => {
        success.value = false
      }, 2000)
    } else {
      scannerError.value = 'Invalid data format. Please scan again.'
      setTimeout(() => {
        scannerError.value = ''
      }, 3000)
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

    // Add corner markers
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

// Initialize camera check on mount
onMounted(() => {
  checkCameraSupport()
})

// Add handleSubmit function if it doesn't exist

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

// Add new function to handle tray operations
const handleTrayOperation = async (operation) => {
  try {
    const endpoint = operation === 'add' ? '/add-tray-scan' :
                    operation === 'change' ? '/change-tray-scan' :
                    '/delete-tray-scan'
    
    await handleApiCall({
      trayId: scannedTrayIds.value[0], // First tray ID
      newTrayId: scannedTrayIds.value[1], // Second tray ID
      endpoint: endpoint
    })
    
    resetScanState()
    showTrayOptions.value = false
    scannedTrayIds.value = []
    scannerSuccess.value = '✅ Tray operation successful! Ready for next scan.'
    scannerError.value = ''
    setTimeout(() => {
      scannerSuccess.value = ''
    }, 2000)
  } catch (err) {
    scannerError.value = '❌ Tray operation failed. Please try again.'
    scannerSuccess.value = ''
  }
}
</script>

<style scoped>
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --text: #0f172a;
  --text-muted: #64748b;
  --bg: #ffffff;
  --bg-secondary: #f8fafc;
  --border: #e2e8f0;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --radius: 8px;
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  font-family: 'Century', 'Century Gothic', 'Georgia', serif;
  color: var(--text);
  background:
    linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
    url('C:\Users\wiroj\OneDrive\Desktop\swt\project_IoT_TTGOdisplay\frontend\image\bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

/* Dashboard Styles */
.dashboard {
  padding: 2rem 0;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

/* Add styles for the Update card */
.dashboard-grid .no-hover {
  grid-column: 2;
  /* Center in the grid */
  width: 120%;
  /* Make it wider */
  height: auto;
  /* Allow height to adjust based on content */
  margin-left: -10%;
  /* Offset the extra width to keep it centered */
  padding: 2rem;
  /* More padding */
  background: rgba(255, 255, 255, 0.9);
  /* Slightly more opaque */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.3s ease-out both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.dashboard-card:hover::before {
  transform: scaleX(1);
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(37, 99, 235, 0.2);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: white;
  transition: var(--transition);
}

.card-icon.updatetray {
  background: linear-gradient(135deg, #faadf8, #cb32bb);
}


.card-icon.update {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card-icon.edit {
  background: linear-gradient(135deg, #FCCF61, #FFE495);
}

.card-icon.tray {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.card-icon.table {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.card-icon.clear {
  background: linear-gradient(135deg, #ec1b03, #822011);
}

.dashboard-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.card-arrow {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: var(--transition);
}

.dashboard-card:hover .card-arrow {
  background: var(--primary);
  color: white;
  transform: translateX(4px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem 0;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 1rem;
  }

  .dashboard-grid .no-hover {
    grid-column: auto;
    width: 100%;
    margin-left: 0;
    padding: 2rem;
  }

  .dashboard-card {
    padding: 1.25rem;
    margin: 0 0.25rem;
    border-radius: 12px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .card-description {
    font-size: 0.8125rem;
    margin-bottom: 0.75rem;
  }

  .card-arrow {
    width: 28px;
    height: 28px;
    bottom: 1.25rem;
    right: 1.25rem;
  }

  .dashboard-card:hover {
    transform: translateY(-4px);
  }
}

@media (max-width: 480px) {
  .dashboard-card {
    padding: 1rem;
    margin: 0;
  }

  .card-icon {
    width: 45px;
    height: 45px;
    font-size: 1.125rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-description {
    font-size: 0.75rem;
  }

  .card-arrow {
    width: 24px;
    height: 24px;
    bottom: 1rem;
    right: 1rem;
  }
}

/* Clean Focus States */
.dashboard-card:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Smooth Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.no-hover {
  cursor: default !important;
}

.no-hover:hover {
  transform: none !important;
  box-shadow: var(--shadow) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.no-hover::before {
  display: none !important;
}

.update-form {
  margin-top: 0.5rem;
  width: 100%;
}

.form-group {
  margin-bottom: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.input-with-scanner {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
  margin-top: 0.5rem;
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

.form-group input {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.scan-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.scan-btn {
  background-color: #8DBAED;
  color: #fff;
  border: none;
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(141, 186, 237, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.scan-btn:hover {
  background-color: #7aa8db;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(141, 186, 237, 0.3);
}

.scan-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Remove unused styles */
.update-form,
.form-group,
.input-with-scanner,
.error-message,
.data-type-indicator {
  display: none;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.success-message {
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #ecfdf5;
  border-radius: 4px;
  border: 1px solid #a7f3d0;
}

.form-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

/* QR Scanner Modal Styles */
.scanner-modal {
  position: fixed;
  top: 0px;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* Changed from center to flex-start */
  padding-top: 1rem;
  /* Added padding at top */
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.scanner-container {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 100vh;
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
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 0, 0), 0 0 0 9999px rgba(0, 0, 0, 0.7);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0), 0 0 0 9999px rgba(0, 0, 0, 0.7);
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

.scanner-success {
  color: #059669;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #ecfdf5;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
  text-align: center;
  font-weight: 600;
}

.scanner-tips {
  text-align: left;
  margin-bottom: 1.5rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.change-mode-btn,
.reset-btn {
  background-color: #8DBAED;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(141, 186, 237, 0.2);
  flex: 1;
  min-width: 150px;
}

.reset-btn {
  background-color: #FCCF61;
}

.reset-btn:hover {
  background-color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.change-mode-btn:hover {
  background-color: #6ba8e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(141, 186, 237, 0.3);
}

@media (max-width: 480px) {
  .scanner-tips {
    flex-direction: column;
  }

  .change-mode-btn,
  .reset-btn {
    width: 100%;
  }
}

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
  pointer-events: auto;
}

.floating-camera-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.floating-camera-btn:active {
  transform: scale(0.95);
}

.data-type-indicator {
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.data-type-indicator.product-order {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #7dd3fc;
}

.data-type-indicator.tray-id {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #86efac;
}

.data-type-indicator.mac-address {
  background-color: #f5f0e6;
  color: #8b4513;
  border: 1px solid #deb887;
}

.data-type-indicator.unknown {
  background-color: #f4f4f5;
  color: #71717a;
  border: 1px solid #d4d4d8;
}

input.product-order {
  border-color: #7dd3fc;
  background-color: #f0f9ff;
}

input.tray-id {
  border-color: #86efac;
  background-color: #f0fdf4;
}

input.mac-address {
  border-color: #deb887;
  background-color: #fdf5e6;
}

input.invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.type-reference {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.type-reference h4 {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.type-item.product-order {
  background-color: #f0f9ff;
  border: 1px solid #e0f2fe;
}

.type-item.tray-id {
  background-color: #f0fdf4;
  border: 1px solid #dcfce7;
}

.type-item.mac-address {
  background-color: #fdf5e6;
  border: 1px solid #f5e6d3;
}

.type-label {
  font-weight: 600;
  min-width: 110px;
}

.type-format {
  font-family: monospace;
  padding: 0.2rem 0.4rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}


@media (max-width: 480px) {
  .type-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .type-label {
    min-width: auto;
  }
}

.scan-instruction {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #e0f2fe;
  color: #0369a1;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

.tray-options {
  margin-top: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.tray-options h4 {
  margin-bottom: 1rem;
  color: #1e293b;
  font-size: 1.1rem;
  text-align: center;
  font-weight: 600;
}

.scanned-trays {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.tray-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.tray-info:last-child {
  border-bottom: none;
}

.tray-label {
  font-weight: 600;
  color: #64748b;
}

.tray-value {
  font-family: monospace;
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  border-radius: 4px;
  color: #0f172a;
}

.tray-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.tray-btn {
  flex: 1;
  min-width: 100px;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.tray-btn i {
  font-size: 0.9rem;
}

.tray-btn.add {
  background-color: #77BB78;
  color: white;
}

.tray-btn.change {
  background-color: #8DBAED;
  color: white;
}

.tray-btn.delete {
  background-color: #F8AAB6;
  color: white;
}

.tray-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tray-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .tray-buttons {
    flex-direction: column;
  }
  
  .tray-btn {
    width: 100%;
  }
}
</style>