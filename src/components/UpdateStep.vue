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
            @click="toggleCamera"
            :disabled="loading"
            class="scan-btn"
          >
            📷 Capture QR
          </button>
        </div>
        <span v-if="macError" class="error-text">Please fill this field</span>
      </div>

      <!-- Enhanced Camera Capture Modal -->
      <div v-if="showCamera" class="camera-modal" @click="closeCamera">
        <div class="camera-container" @click.stop>
          <div class="camera-header">
            <h3>Capture QR Code</h3>
            <button type="button" @click="closeCamera" class="close-btn">✕</button>
          </div>
          
          <div class="camera-content">
            <!-- Camera Preview -->
            <div class="camera-preview-container">
              <video 
                ref="videoElement"
                class="camera-preview"
                autoplay
                playsinline
                muted
              ></video>
              
              <!-- Capture overlay -->
              <div class="capture-overlay">
                <div class="capture-frame" :class="{ 'capturing': isCapturing }">
                  <div class="frame-corners">
                    <div class="corner top-left"></div>
                    <div class="corner top-right"></div>
                    <div class="corner bottom-left"></div>
                    <div class="corner bottom-right"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Camera Controls -->
            <div class="camera-controls">
              <button 
                type="button" 
                @click="toggleFlashlight" 
                v-if="hasFlashlight"
                :class="['control-btn', { active: flashlightOn }]"
              >
                {{ flashlightOn ? '🔦' : '💡' }} Flash
              </button>
              
              <button 
                type="button" 
                @click="captureImage"
                :disabled="!cameraReady || isProcessing"
                class="capture-btn"
              >
                📸 {{ isProcessing ? 'Processing...' : 'Capture' }}
              </button>
              
              <button 
                type="button" 
                @click="switchCamera" 
                v-if="hasMultipleCameras" 
                class="control-btn"
              >
                🔄 Switch
              </button>
            </div>
          </div>
          
          <!-- Captured Image Preview -->
          <div v-if="capturedImage" class="captured-preview">
            <h4>Captured Image:</h4>
            <img :src="capturedImage" alt="Captured QR Code" class="preview-image" />
            <div class="preview-controls">
              <button 
                type="button" 
                @click="analyzeImage"
                :disabled="isProcessing"
                class="analyze-btn"
              >
                🔍 {{ isProcessing ? 'Analyzing...' : 'Analyze QR Code' }}
              </button>
              <button 
                type="button" 
                @click="retakePhoto"
                class="retake-btn"
              >
                🔄 Retake
              </button>
            </div>
          </div>
          
          <div class="camera-footer">
            <p v-if="cameraStatus" class="camera-status" :class="statusClass">{{ cameraStatus }}</p>
            <p v-if="cameraError" class="camera-error">{{ cameraError }}</p>
            
            <div class="camera-tips">
              <p class="camera-help">📱 For TTGO T-Display screens:</p>
              <ul class="tips-list">
                <li><strong>Hold steady</strong> - Keep device stable</li>
                <li><strong>Get close</strong> - 2-4 inches from screen</li>
                <li><strong>Use flash</strong> - Improves contrast</li>
                <li><strong>Avoid glare</strong> - Angle slightly</li>
                <li><strong>Max brightness</strong> - On TTGO display</li>
                <li><strong>Clear focus</strong> - Tap to focus if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="order">Product Order</label>
        <div class="input-with-scanner">
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import jsQR from 'jsqr' // You'll need to install this: npm install jsqr

const mac = ref('')
const order = ref('')
const loading = ref(false)
const error = ref(null)
const success = ref(false)

// Error flags for each field
const macError = ref(false)
const orderError = ref(false)

// Camera related
const showCamera = ref(false)
const videoElement = ref(null)
const cameraStream = ref(null)
const cameraError = ref('')
const cameraStatus = ref('')
const cameraReady = ref(false)
const hasMultipleCameras = ref(false)
const hasFlashlight = ref(false)
const currentCamera = ref('environment')
const flashlightOn = ref(false)
const isCapturing = ref(false)
const isProcessing = ref(false)

// Captured image
const capturedImage = ref(null)
const canvas = ref(null)

const statusClass = computed(() => ({
  'status-success': cameraStatus.value.includes('Ready') || cameraStatus.value.includes('Success'),
  'status-warning': cameraStatus.value.includes('Initializing') || cameraStatus.value.includes('Processing'),
  'status-error': cameraStatus.value.includes('Error') || cameraStatus.value.includes('Failed')
}))

// Check camera capabilities
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

const toggleCamera = async () => {
  if (!showCamera.value) {
    const hasCamera = await checkCameraSupport()
    if (!hasCamera) {
      cameraError.value = 'No camera found on this device'
      return
    }
    await startCamera()
  } else {
    closeCamera()
  }
}

const startCamera = async () => {
  try {
    showCamera.value = true
    cameraError.value = ''
    cameraStatus.value = 'Initializing camera...'
    
    const constraints = {
      video: {
        facingMode: currentCamera.value,
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 },
        frameRate: { ideal: 30 }
      }
    }
    
    cameraStream.value = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (videoElement.value) {
      videoElement.value.srcObject = cameraStream.value
      
      videoElement.value.addEventListener('loadedmetadata', () => {
        cameraReady.value = true
        cameraStatus.value = 'Camera ready - Position over QR code and capture'
        
        // Check for flashlight support
        const track = cameraStream.value.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        hasFlashlight.value = 'torch' in capabilities
      })
    }
  } catch (err) {
    console.error('Camera start failed:', err)
    cameraError.value = `Camera error: ${err.message}`
    cameraStatus.value = ''
  }
}

const captureImage = async () => {
  if (!videoElement.value || !cameraReady.value) return
  
  try {
    isCapturing.value = true
    cameraStatus.value = 'Capturing image...'
    
    // Create canvas element
    if (!canvas.value) {
      canvas.value = document.createElement('canvas')
    }
    
    const video = videoElement.value
    const context = canvas.value.getContext('2d')
    
    // Set canvas dimensions to match video
    canvas.value.width = video.videoWidth
    canvas.value.height = video.videoHeight
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.value.width, canvas.value.height)
    
    // Convert to image data URL
    capturedImage.value = canvas.value.toDataURL('image/jpeg', 0.9)
    
    cameraStatus.value = 'Image captured! Click Analyze to detect QR code'
    
    // Add a brief flash effect
    setTimeout(() => {
      isCapturing.value = false
    }, 200)
    
  } catch (err) {
    console.error('Capture failed:', err)
    cameraError.value = `Capture error: ${err.message}`
    isCapturing.value = false
  }
}

const analyzeImage = async () => {
  if (!capturedImage.value || !canvas.value) return
  
  try {
    isProcessing.value = true
    cameraStatus.value = 'Analyzing image for QR code...'
    
    const context = canvas.value.getContext('2d')
    const imageData = context.getImageData(0, 0, canvas.value.width, canvas.value.height)
    
    // Use jsQR to decode the QR code from image data
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert"
    })
    
    if (qrCode && qrCode.data) {
      mac.value = qrCode.data
      cameraStatus.value = 'QR Code successfully decoded!'
      
      setTimeout(() => {
        closeCamera()
        success.value = true
        setTimeout(() => {
          success.value = false
        }, 3000)
      }, 1500)
    } else {
      // Try with different image processing techniques
      await tryEnhancedAnalysis(imageData)
    }
    
  } catch (err) {
    console.error('Analysis failed:', err)
    cameraError.value = `Analysis error: ${err.message}`
  } finally {
    isProcessing.value = false
  }
}

const tryEnhancedAnalysis = async (originalImageData) => {
  try {
    cameraStatus.value = 'Trying enhanced analysis...'
    
    // Create a new canvas for image processing
    const processCanvas = document.createElement('canvas')
    const processContext = processCanvas.getContext('2d')
    processCanvas.width = originalImageData.width
    processCanvas.height = originalImageData.height
    
    // Try different image enhancements
    const techniques = [
      { name: 'High Contrast', func: enhanceContrast },
      { name: 'Grayscale + Threshold', func: applyThreshold },
      { name: 'Inverted', func: invertColors },
      { name: 'Brightness Boost', func: increaseBrightness }
    ]
    
    for (const technique of techniques) {
      cameraStatus.value = `Trying ${technique.name}...`
      
      const enhancedData = technique.func(originalImageData)
      processContext.putImageData(enhancedData, 0, 0)
      
      const qrCode = jsQR(enhancedData.data, enhancedData.width, enhancedData.height, {
        inversionAttempts: "attemptBoth"
      })
      
      if (qrCode && qrCode.data) {
        mac.value = qrCode.data
        cameraStatus.value = `QR Code decoded using ${technique.name}!`
        return
      }
    }
    
    cameraError.value = 'No QR code found. Try capturing again with better lighting or positioning.'
    cameraStatus.value = ''
  } catch (err) {
    console.error('Enhanced analysis failed:', err)
    cameraError.value = 'Analysis failed. Please try again.'
  }
}

// Image enhancement functions
const enhanceContrast = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data)
  const factor = 2.5 // Contrast factor
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))     // Red
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)) // Green
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)) // Blue
  }
  
  return new ImageData(data, imageData.width, imageData.height)
}

const applyThreshold = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data)
  const threshold = 128
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const value = gray > threshold ? 255 : 0
    data[i] = data[i + 1] = data[i + 2] = value
  }
  
  return new ImageData(data, imageData.width, imageData.height)
}

const invertColors = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data)
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]         // Red
    data[i + 1] = 255 - data[i + 1] // Green
    data[i + 2] = 255 - data[i + 2] // Blue
  }
  
  return new ImageData(data, imageData.width, imageData.height)
}

const increaseBrightness = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data)
  const brightness = 50
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] + brightness)         // Red
    data[i + 1] = Math.min(255, data[i + 1] + brightness) // Green
    data[i + 2] = Math.min(255, data[i + 2] + brightness) // Blue
  }
  
  return new ImageData(data, imageData.width, imageData.height)
}

const retakePhoto = () => {
  capturedImage.value = null
  cameraStatus.value = 'Position over QR code and capture again'
  cameraError.value = ''
}

const switchCamera = async () => {
  if (hasMultipleCameras.value && cameraStream.value) {
    // Stop current stream
    cameraStream.value.getTracks().forEach(track => track.stop())
    
    // Switch camera
    currentCamera.value = currentCamera.value === 'environment' ? 'user' : 'environment'
    
    // Restart with new camera
    await startCamera()
  }
}

const toggleFlashlight = async () => {
  if (!cameraStream.value) return
  
  try {
    const track = cameraStream.value.getVideoTracks()[0]
    
    if (track.getCapabilities().torch) {
      await track.applyConstraints({
        advanced: [{ torch: !flashlightOn.value }]
      })
      flashlightOn.value = !flashlightOn.value
      cameraStatus.value = flashlightOn.value ? 
        'Flash ON - Better for display scanning' : 
        'Flash OFF'
    }
  } catch (err) {
    console.error('Flashlight toggle failed:', err)
    cameraError.value = 'Flashlight not available'
  }
}

const closeCamera = () => {
  showCamera.value = false
  cameraReady.value = false
  capturedImage.value = null
  cameraError.value = ''
  cameraStatus.value = ''
  
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
    cameraStream.value = null
  }
  
  if (flashlightOn.value) {
    flashlightOn.value = false
  }
}

const onSubmit = async () => {
  console.log("onSubmit fired")
  error.value = null
  success.value = false
  macError.value = false
  orderError.value = false

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
    
    success.value = true
    mac.value = ''
    order.value = ''
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.detail || 'Error sending request'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkCameraSupport()
})

onUnmounted(() => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.form-page {
  max-width: 450px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
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
  box-shadow: 0 2px 4px rgba(0,123,255,0.3);
}

.scan-btn:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0,123,255,0.4);
}

.scan-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #c00;
  font-size: 0.85rem;
}

.btn-send {
  background-color: #C7E299;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #2c3e50;
  width: 100%;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(199,226,153,0.4);
}

.btn-send:hover {
  background-color: #b8d684;
  color: #fff;
  box-shadow: 0 4px 8px rgba(199,226,153,0.5);
}

.error {
  margin-top: 1rem;
  color: #c00;
  font-weight: 500;
}

.success {
  margin-top: 1rem;
  color: #080;
  font-weight: 500;
}

/* Camera Modal Styles */
.camera-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.camera-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 95vw;
  max-height: 95vh;
  width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  overflow-y: auto;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.camera-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #ff3742;
}

.camera-content {
  margin-bottom: 1rem;
}

.camera-preview-container {
  position: relative;
  margin-bottom: 1rem;
}

.camera-preview {
  width: 100%;
  height: 360px;
  border-radius: 8px;
  background: #000;
  border: 3px solid #007bff;
  object-fit: cover;
}

.capture-overlay {
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

.capture-frame {
  width: 250px;
  height: 250px;
  border: 3px solid rgba(0, 255, 0, 0.7);
  background: transparent;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.capture-frame.capturing {
  border-color: #fff;
  box-shadow: 0 0 30px rgba(255,255,255,0.8);
  animation: capture-flash 0.2s ease-in-out;
}

@keyframes capture-flash {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

.frame-corners {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #00ff00;
}

.corner.top-left {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.corner.top-right {
  top: -3px;
  right: -3px;
  border-left: none;
  border-bottom: none;
}

.corner.bottom-left {
  bottom: -3px;
  left: -3px;
  border-right: none;
  border-top: none;
}

.corner.bottom-right {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.camera-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.control-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.control-btn.active {
  background: #ffc107;
  color: #000;
}

.capture-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(40,167,69,0.3);
  transition: all 0.2s ease;
}

.capture-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(40,167,69,0.4);
}

.capture-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.captured-preview {
  margin-top: 1rem;
  text-align: center;
}

.captured-preview h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.preview-image {
  max-width: 100%;
  height: 200px;
  object-fit: contain;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.preview-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.analyze-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.analyze-btn:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-1px);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.retake-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retake-btn:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.camera-footer {
  text-align: center;
}

.camera-status {
  font-weight: bold;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.status-success {
  color: #155724;
  background-color: #d4edda;
}

.status-warning {
  color: #856404;
  background-color: #fff3cd;
}

.status-error {
  color: #721c24;
  background-color: #f8d7da;
}

.camera-error {
  color: #c00;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.camera-help {
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.camera-tips {
  text-align: left;
  margin-top: 1rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.tips-list {
  font-size: 0.85rem;
  color: #555;
  margin: 0.5rem 0;
  padding-left: 1.2rem;
}

.tips-list li {
  margin-bottom: 0.4rem;
  line-height: 1.4;
}

.tips-list strong {
  color: #007bff;
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-page {
    margin: 0.5rem;
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
  
  .camera-container {
    margin: 0.5rem;
    padding: 1rem;
    width: calc(100vw - 1rem);
  }
  
  .camera-preview {
    height: 300px;
  }
  
  .capture-frame {
    width: 200px;
    height: 200px;
  }
  
  .control-btn {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
  }
  
  .capture-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .tips-list {
    font-size: 0.8rem;
  }
  
  .preview-controls {
    flex-direction: column;
  }
  
  .analyze-btn, .retake-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .camera-tips {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .camera-help {
    color: #e2e8f0;
  }
  
  .tips-list {
    color: #cbd5e0;
  }
}
</style>