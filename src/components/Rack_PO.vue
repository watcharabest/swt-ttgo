<template>
  <div>
    <div class="scan-container">
      <button type="button" @click="toggleScanner('update')" :disabled="loading" class="scan-btn">
        Click to Scan
      </button>
    </div>

    <div class="view-box">
      <h1 style="padding-top: 1rem;">Delivery Table </h1>
      <table v-if="pagedRows.length">
        <thead>
          <tr>
            <th @click="sortBy('product_order')" class="sortable">
              Production Order
              <span v-if="sortKey === 'product_order'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('location')" class="sortable">
              Location
              <span v-if="sortKey === 'location'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('timestamp')" class="sortable">
              Time
              <span v-if="sortKey === 'timestamp'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in pagedRows" :key="i">
            <td>{{ row.product_order || '-' }}</td>
            <td>{{ row.location || '-' }}</td>
            <td>{{ row.timestamp || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <div v-if="showScanner" class="scanner-modal" @click="closeScanner">
      <div class="scanner-container" @click.stop>
        <div class="scanner-header">
          <h2>Scan Tray QR Code</h2>
          <button type="button" @click="closeScanner" class="close-btn">✕</button>
        </div>
        <div class="scanner-content">
          <QrcodeStream :key="scannerKey" @detect="onDetect" @error="onError" class="scanner-video" :constraints="{
            facingMode: currentCamera,
            width: { ideal: 640 },
            height: { ideal: 480 },
            focusMode: 'continuous',
            pointsOfInterest: [{ x: 0.5, y: 0.5 }],
            advanced: [{ contrast: 100 }, { brightness: 0 }, { sharpness: 100 }],
          }" :track="paintBoundingBox" />
          <div class="scanner-overlay">
            <div class="scanner-frame"></div>
            <button v-if="hasMultipleCameras" @click="switchCamera" class="floating-camera-btn" :title="currentCamera === 'user'
              ? 'Switch to Back Camera'
              : 'Switch to Front Camera'
              ">
              {{ currentCamera === "user" ? "📷" : "📱" }}
            </button>
          </div>
        </div>
        <div class="scanner-footer">
          <p v-if="scannerError" class="scanner-error">{{ scannerError }}</p>
          <p v-if="scannerSuccess" class="scanner-success">{{ scannerSuccess }}</p>
          <div v-if="operationLog" class="operation-log">
            <p v-html="operationLog"></p>
          </div>
          <div class="type-reference" v-if="scannedData.length > 0">
            <div class="type-list">
              <div v-for="(scan, index) in scannedData" :key="index"
                :class="['type-item', scan.type.toLowerCase().replace(' ', '-')]">
                <span class="type-label">{{ scan.type }}:</span>
                <span class="type-format">{{ scan.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { QrcodeStream } from "vue-qrcode-reader";

// Form Value
const productOrder = ref('')

const loading = ref(false);
const error = ref(null);
const qrData = ref("");
const scannerKey = ref(0);
const operationLog = ref("");
const dataType = ref("");
const tray_id = ref("");

// New state variables for tracking scans
const scanCount = ref(0);
const scannedData = ref([]);

const bluetoothBuffer = ref("");
// QR Scanner related
const showScanner = ref(false);
const scannerError = ref("");
const scannerSuccess = ref("");
const hasMultipleCameras = ref(true);
const currentCamera = ref("environment");
const isMicroMode = ref(false);

const rows = ref([])
const currentPage = ref(1)
const pageSize = 7
const searchQuery = ref('')
const sortKey = ref('timestamp_rack_location')
const sortOrder = ref('asc')

const classifyData = (data) => {
  if (/^92/i.test(data)) {
    return "Product Order";
  }
  return "Unknown";
};

const checkCameraSupport = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    hasMultipleCameras.value = videoDevices.length > 1;
    return videoDevices.length > 0;
  } catch (err) {
    console.error("Camera check failed:", err);
    return false;
  }
};

const toggleScanner = async () => {
  if (!showScanner.value) {
    const hasCamera = await checkCameraSupport();
    if (!hasCamera) {
      scannerError.value = "No camera found on this device";
      return;
    }
    startScanner();
  } else {
    closeScanner();
  }
};

const switchCamera = () => {
  if (hasMultipleCameras.value) {
    currentCamera.value = currentCamera.value === "environment" ? "user" : "environment";
  }
};

const startScanner = async () => {
  try {
    showScanner.value = true;
    scannerError.value = "";
  } catch (err) {
    console.error("Scanner start failed:", err);
    scannerError.value = `Camera error: ${err.message}`;
  }
};

const closeScanner = () => {
  showScanner.value = false;
  scannerError.value = "";
};

const filteredAndSortedRows = computed(() => {
  let result = [...rows.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(query)
      )
    )
  }

  // Apply sorting
  if (sortKey.value) {
    result.sort((a, b) => {
      let aValue, bValue;

      // Handle timestamp fields (ISO format: 2025-06-24T13:53:57)
      if (sortKey.value === 'timestamp_rack_location') {
        aValue = a[sortKey.value] ? new Date(a[sortKey.value]).getTime() : 0;
        bValue = b[sortKey.value] ? new Date(b[sortKey.value]).getTime() : 0;
      }
      // Handle other fields
      else {
        aValue = a[sortKey.value];
        bValue = b[sortKey.value];
      }

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      // Compare values
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredAndSortedRows.value.length / pageSize))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAndSortedRows.value.slice(start, start + pageSize)
})

async function loadTable() {
  try {
    const res = await axios.get(`${__API_BASE_URL__}/product_order_rack_table`)
    rows.value = Array.isArray(res.data) ? res.data : [res.data]
    console.log('Loaded data:', { rows: rows.value })
    currentPage.value = 1
  } catch (err) {
    console.error('Error loading table data:', err)
    rows.value = []
    currentPage.value = 1
  }
}

onMounted(loadTable)

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Sort function
function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const resetScanState = () => {
  scanCount.value = 0;
  scannedData.value = [];
  productOrder.value = "";
  qrData.value = "";
  dataType.value = "";
  error.value = null;
  scannerSuccess.value = "";
  scannerKey.value++;
};

const updateScanDisplay = (currentDataType, trimmedData) => {
  qrData.value = trimmedData;
  dataType.value = currentDataType;
  productOrder.value = trimmedData;
  scannedData.value.push({
    type: currentDataType,
    value: trimmedData,
  });
};

const onDetect = async (detectedCodes) => {
  if (detectedCodes.length > 0) {
    const detectedData = detectedCodes[0].rawValue;
    console.log("QR Code detected:", detectedData);

    if (detectedData && detectedData.trim()) {
      const trimmedData = detectedData.trim();
      const currentDataType = classifyData(trimmedData);
      console.log("QR Code detected:", currentDataType);

      console.log("Data : ", scannedData.value)

      updateScanDisplay(currentDataType, trimmedData);

      const currentStage = scanCount.value;
      let stageSuccess = false;
      if (currentStage === 0) {
        stageSuccess = await handleFirstScan(currentDataType, trimmedData);
      } else if (currentStage === 1) {
        stageSuccess = await handleSecondScan(currentDataType, trimmedData);
      } else {
        resetScanState();
        return;
      }
      if (!stageSuccess) return;

      console.log(scannedData.value)

    } else {
      scannerError.value = "Invalid data format. Please scan again.";
      setTimeout(() => {
        scannerError.value = "";
      }, 3000);
    }
  }
};

const handleFirstScan = async (currentDataType, trimmedData) => {
  if (currentDataType === "Product Order") {
    tray_id.value = trimmedData
    try {
      resetScanState()
      await axios.post(`${__API_BASE_URL__}/product_order_timestamp`, {
        product_order: trimmedData,
      });
      await Swal.fire({
            icon: "success",
            title: "Timestamp Success",
            html: `
            <div style="text-align: left;">
                <p><strong>Product Order:</strong> ${trimmedData}</p>
            </div>`,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
      await loadTable()
      return true
    } catch (err) {
      scannerError.value = "Timestamp failed: " + (err.response?.data?.detail || err.message);
      setTimeout(() => {
        scannerError.value = "";
      }, 2000);
      throw err;
    }
  }
}
const onError = (err) => {
  console.error("QR Scanner error:", err);
  scannerError.value = `Scanner error: ${err.message || "Camera access denied"}`;
};

const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: { x, y, width, height },
    } = detectedCode;

    // Draw enhanced bounding box
    ctx.lineWidth = 4;
    ctx.strokeStyle = isMicroMode.value ? "#8DBAED" : "#00ff00";
    ctx.strokeRect(x, y, width, height);

    // Add corner markers
    const cornerSize = 20;
    ctx.beginPath();
    // Top-left corner
    ctx.moveTo(x, y + cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerSize, y);
    // Top-right corner
    ctx.moveTo(x + width - cornerSize, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + cornerSize);
    // Bottom-right corner
    ctx.moveTo(x + width, y + height - cornerSize);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width - cornerSize, y + height);
    // Bottom-left corner
    ctx.moveTo(x + cornerSize, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + height - cornerSize);
    ctx.stroke();

    // Add status text
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = isMicroMode.value ? "#8DBAED" : "#00ff00";
  }
};

onMounted(() => {
  checkCameraSupport();
  window.addEventListener("keypress", handleBluetoothKeypress);
});

// Clean up when component is unmounted
onUnmounted(() => {
  window.removeEventListener("keypress", handleBluetoothKeypress);
});

const handleBluetoothKeypress = async (event) => {
  // Most hardware scanners act like keyboards and send characters followed by Enter
  if (event.key === "Enter") {
    // Prevent the default action (such as triggering a focused button click)
    // which can inadvertently close the scanner modal.
    event.preventDefault();
    event.stopPropagation();
    const dataToProcess = bluetoothBuffer.value;
    bluetoothBuffer.value = ""; // reset buffer
    await processScannedData(dataToProcess);
  } else {
    // Ignore non-printable characters
    if (event.key.length === 1) {
      bluetoothBuffer.value += event.key;
    }
  }
};

const processScannedData = async (scannedText) => {
  const trimmedData = scannedText.trim();
  if (!trimmedData) return;

  const currentDataType = classifyData(trimmedData);
  console.log("Bluetooth scan detected:", trimmedData, "as", currentDataType);

  // Update UI display
  updateScanDisplay(currentDataType, trimmedData);

  try {
    // Determine stage by current scanCount BEFORE increment
    const currentStage = scanCount.value;
    let stageSuccess = false;
    if (currentStage === 0) {
      stageSuccess = await handleFirstScan(currentDataType, trimmedData);
    } else if (currentStage === 1) {
      stageSuccess = await handleSecondScan(currentDataType, trimmedData);
    } else {
      resetScanState()
      return;
    }
    if (!stageSuccess) return;

  } catch (err) {
    console.error("Error processing Bluetooth scan:", err);
  }
};
</script>

<style scoped>
h1 {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.scan-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.scan-btn {
  font: inherit;
  background-color: #f0f0f0;
  border: 0;
  color: #242424;
  border-radius: 0.5em;
  font-size: 2rem;
  padding: 5rem;
  font-weight: 600;
  text-shadow: 0 0.0625em 0 #fff;
  box-shadow: inset 0 0.0625em 0 0 #f4f4f4, 0 0.0625em 0 0 #efefef,
    0 0.125em 0 0 #ececec, 0 0.25em 0 0 #e0e0e0, 0 0.3125em 0 0 #dedede,
    0 0.375em 0 0 #dcdcdc, 0 0.425em 0 0 #cacaca, 0 0.425em 0.5em 0 #cecece;
  transition: 0.15s ease;
  cursor: pointer;
  margin-bottom: 1rem;
}

.scan-btn:active {
  translate: 0 0.225em;
  box-shadow: inset 0 0.03em 0 0 #f4f4f4, 0 0.03em 0 0 #efefef,
    0 0.0625em 0 0 #ececec, 0 0.125em 0 0 #e0e0e0, 0 0.125em 0 0 #dedede,
    0 0.2em 0 0 #dcdcdc, 0 0.225em 0 0 #cacaca, 0 0.225em 0.375em 0 #cecece;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  padding: 1rem;
}

th {
  background: #f8fafc;
  color: #2c3e50;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.95rem;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background: #edf2f7;
}

.sort-icon {
  margin-left: 0.5rem;
  color: #8DBAED;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  font-size: 0.9rem;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: #f8fafc;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.pagination button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #C7E299;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(199, 226, 153, 0.2);
}

.pagination button:hover:not(:disabled) {
  background: #b3d486;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(199, 226, 153, 0.3);
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination span {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

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
  overflow: auto;
}

.scanner-content {
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scanner-video {
  width: 100% !important;
  height: 350px !important;
  transform: scaleX(-1);
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

.scanner-footer {
  display: flex;
  justify-content: center;
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

</style>