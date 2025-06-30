<template>
  <div class="dashboard">
    <div class="scanner-section">
      <div class="scanner-cards">
        <div class="scanner-card">
          <h3 class="card-title" style="text-align: center">Update</h3>
          <div class="scan-container">
            <button type="button" @click="toggleScanner('update')" :disabled="loading" class="scan-btn">
              📱 Scan QR Code
            </button>
          </div>
        </div>
        <div class="scanner-card">
          <h3 class="card-title" style="text-align: center">Lookup</h3>
          <div class="scan-container">
            <button type="button" @click="toggleScanner('lookup')" :disabled="loading" class="scan-btn">
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
            advanced: isMicroMode
              ? [{ contrast: 100 }, { brightness: 0 }, { sharpness: 100 }]
              : [],
          }" :track="paintBoundingBox" />
          <div class="scanner-overlay">
            <div class="scanner-frame" :class="{ 'micro-mode': isMicroMode }"></div>
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
          <div v-if="scanMode === 'update'" class="scanner-tips">
            <button type="button" @click="toggleMicroMode" class="change-mode-btn">
              {{ isMicroMode ? "Normal Mode" : "Micro Mode" }}
            </button>
            <button type="button" @click="resetScanState" class="reset-btn">
              Reset Scanner
            </button>
            <div v-if="operationLog" class="operation-log">
              <h2>{{ operationLog }}</h2>
            </div>
            <div class="mode-switcher">
              <button @click="prevMode" class="tray-btn">◀</button>
              <h2>
                You are using
                <span :class="['tray-mode', trayOperation]">{{ trayOperation }}</span>
                Mode
              </h2>
              <button @click="nextMode" class="tray-btn">▶</button>
            </div>
          </div>
          <div v-if="scanMode === 'lookup' && lookupResult" class="scanner-tips-lookup">
            <div v-if="lookupResult">
              <p>
                Product Order:
                <span class="highlight-product">{{ lookupResult[0].product_order }}</span>
              </p>
              <p>
                Material:
                <span class="highlight-material">{{ lookupResult[0].material }}</span>
              </p>
              <p>
                Name:
                <span class="highlight-name">{{ lookupResult[0].name_product }}</span>
              </p>
              <div class="lookup-bottom-section">
                <!-- รูป -->
                <img :src="`/images/${lookupResult[0].material}.jpg`" :alt="lookupResult[0].material"
                  class="lookup-image" />

                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th @click="sortBy('id')" class="sortable">
                          Tray ID
                          <span v-if="sortKey === 'id'">{{ sortAsc ? "▲" : "▼" }}</span>
                        </th>
                        <th @click="sortBy('location')" class="sortable">
                          Location
                          <span v-if="sortKey === 'location'">{{
                            sortAsc ? "▲" : "▼"
                          }}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          :style="{ color: scannedTrayIds.includes(trayMain) ? '#0066cc' : 'red', paddingRight: '1rem' }">
                          {{ trayMain }}
                        </td>
                        <td>
                          {{ trayMainLocation ?? "❌" }}
                        </td>
                      </tr>
                      <tr v-for="(tray, i) in sortedTrayDetails" :key="i">
                        <td :style="{ color: scannedTrayIds.includes(tray.id) ? '#0066cc' : 'inherit' }">
                          {{ tray.id || "-" }}
                        </td>
                        <td>{{ tray.location ?? "❌" }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="type-reference" v-if="scannedData.length > 0">
            <div class="type-list">
              <div v-for="(scan, index) in scannedData" :key="index"
                :class="['type-item', scan.type.toLowerCase().replace(' ', '-')]">
                <span class="type-label">{{ scan.type }}:</span>
                <span class="type-format">{{ scan.value }}</span>
                <div v-if="scan.type === 'Shelf Location'" class="shelf-location-controls">
                  <label class="checkbox-container">
                    <input type="checkbox" v-model="StatusForRemember" class="shelf-checkbox" />
                    <div class="custom-checkbox">
                      <span class="checkmark">✓</span>
                    </div>
                    <span class="checkbox-label">Remember</span>
                  </label>
                </div>
              </div>
            </div>
            <div v-if="waitingForMac" class="scan-instruction">
              Please scan MAC Address
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed, watch } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import axios from "axios";

const router = useRouter();
const navigateTo = (path) => router.push(path);

const productOrder = ref("");
const loading = ref(false);
const error = ref(null);
const success = ref(false);
const qrData = ref("");
const lookupResult = ref(null);
const trayMain = ref("");
const trayMainLocation = ref("");
const childTrayIds = ref(Array(12).fill(""));
const trayIds = ref(Array(12).fill(""));
const childLocations = ref(Array(12).fill(null));
const operationLog = ref("");
const rememberShelfLocation = ref(false);
// Error states
const macError = ref(false);
const orderError = ref(false);

// New state variables for tracking scans
const scanCount = ref(0);
const scannedData = ref([]);
const waitingForMac = ref(false);

// QR Scanner related
const showScanner = ref(false);
const scannerError = ref("");
const scannerSuccess = ref("");
const hasMultipleCameras = ref(false);
const currentCamera = ref("environment");
const isMicroMode = ref(false);
const scanMode = ref(null);
const trayModes = ["change", "delete", "add"];
const currentModeIndex = ref(0);
const sortKey = ref("id");
const sortAsc = ref(true);

const StatusForRemember = ref(false);
// Add these refs for data classification
const dataType = ref("");

// Add new refs for tray management
const trayOperation = ref("Change"); // 'add', 'change', or 'delete'
const scannedTrayIds = ref([]); // Store scanned tray IDs

const resetScanState = () => {
  scanCount.value = 0;
  scannedData.value = [];
  productOrder.value = "";
  qrData.value = "";
  dataType.value = "";
  error.value = null;
  macError.value = false;
  orderError.value = false;
  waitingForMac.value = false;
  scannerSuccess.value = "";
  console.log("Scan state reset");
};

const handleApiCall = async (data) => {
  // Reset error states
  error.value = null;
  macError.value = false;
  orderError.value = false;

  try {
    loading.value = true;
    let endpoint = data.endpoint;
    let requestData = {};

    // Determine request data based on the endpoint
    if (endpoint === "/update_mac_product") {
      requestData = {
        mac_address: data.macAddress,
        product_order: data.productOrder,
      };
    } else if (endpoint === "/update_mac_tray") {
      requestData = {
        mac_address: data.macAddress,
        tray_id: data.trayId,
      };
    } else if (endpoint === "/update_mac_product-tray") {
      requestData = {
        product_order: data.productOrder,
        tray_id: data.trayId,
        mac_address: data.macAddress,
      };
    } else if (endpoint === "/change-tray-scan") {
      requestData = {
        first_tray_id: data.first_tray_id,
        second_tray_id: data.second_tray_id,
      };
    } else if (endpoint === "/add-tray-scan") {
      requestData = {
        first_tray_id: data.first_tray_id,
        second_tray_id: data.second_tray_id,
      };
    } else if (endpoint === "/delete-tray-scan") {
      requestData = {
        tray_id: data.tray_id,
      };
    } else if (endpoint === "/update-location") {
      requestData = {
        tray_id: data.trayId,
        shelf_location: data.shelf_location,
      };
    } else if (endpoint === "/update-rack-location") {
      requestData = {
        rack: data.rack,
        location: data.location,
      };
    }
    console.log("Request Data:", requestData);
    const response = await axios.post(
      `https://10.100.10.139:8000${endpoint}`,
      requestData
    );
    success.value = true;
    console.log("API Response:", response.data);
    resetScanState();
    return response.data;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.detail || "Error sending request";
    throw err;
  } finally {
    loading.value = false;
  }
};

const toggleScanner = async (mode) => {
  if (!showScanner.value) {
    scanMode.value = mode;

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

const startScanner = async () => {
  try {
    showScanner.value = true;
    scannerError.value = "";
  } catch (err) {
    console.error("Scanner start failed:", err);
    scannerError.value = `Camera error: ${err.message}`;
  }
};

// Add function to classify data
const classifyData = (data) => {
  if (/^92\d{7}$/.test(data)) {
    return "Product Order";
  } else if (/^RK\d{7}$/.test(data)) {
    return "Rack";
  } else if (/^RT\d{4}-\d{2}$/.test(data)) {
    return "Location";
  } else if (/^HR\d{4}-\d{4}$/.test(data)) {
    return "Location";
  } else if (/^WO\d{4}-\d{3}$/.test(data)) {
    return "Location";
  } else if (/^TL\d{4}-\d{3}$พำโำได/.test(data)) {
    return "Location";
  } else if (/^PLA\d{4}$/.test(data)) {
    return "Location";
  }
  // Tray ID pattern (starts with T and follows T##-######)
  else if (/^TW\d{5}$/.test(data)) {
    return "TrayWhite ID";
  } else if (/^TS\d{5}$/.test(data)) {
    return "TrayRed ID";
  } else if (/^TB\d{5}$/.test(data)) {
    return "TrayBlack ID";
  } else if (/^SH[4-6][1-9]\d{4}$/.test(data)) {
    return "Shelf Location";
  }


  // MAC Address pattern (6 pairs of hex digits)
  else if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(data)) {
    return "MAC Address";
  }
  return "Unknown";
};

// Add these helper functions before onDetect
const handleFirstScan = async (currentDataType, trimmedData) => {
  scannedTrayIds.value = [trimmedData];
  if (trayOperation.value.toLocaleLowerCase() === "delete") {
    if (!confirm(`You want to Delete Tray ID : "${scannedTrayIds.value}"?`)) return;
    handleTrayOperation("delete");
    resetScanState();
    scannerSuccess.value = "✅ Tray deleted successfully! Ready for next scan.";
    scannerError.value = "";
    setTimeout(() => {
      scannerSuccess.value = "";
    }, 2000);
    return false;
  } else if (StatusForRemember.value && ["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(currentDataType)) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await handleApiCall({
        shelf_location: rememberShelfLocation.value,
        trayId: trimmedData,
        endpoint: "/update-location",
      });
      scannedData.value.push({
        type: "Shelf Location",
        value: rememberShelfLocation.value,
      });
      scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
      scannerError.value = "";
      setTimeout(() => {
        scannerSuccess.value = "";
      }, 2000);
      return true;
    } catch (err) {
      scannerError.value = "❌ API call failed. Please try again.";
      scannerSuccess.value = "";
      return false;
    }
  }
  scanCount.value++;
  return true;
};

const handleSecondScan = async (currentDataType, trimmedData) => {
  const firstScanType = scannedData.value[0].type;
  if (["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(firstScanType)) {
    if (currentDataType === "Product Order") {
      waitingForMac.value = true;
      scanCount.value++;
      return true;
    } else if (["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(currentDataType)) {
      scannedTrayIds.value = [scannedData.value[0].value, trimmedData];
      handleTrayOperation(trayOperation.value.toLowerCase());
      resetScanState();
      scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
      scannerError.value = "";
      setTimeout(() => {
        scannerSuccess.value = "";
      }, 2000);
      return false;
    } else if (currentDataType === "MAC Address") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          trayId: scannedData.value[0].value,
          macAddress: trimmedData,
          endpoint: "/update_mac_tray",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
        setTimeout(() => {
          scannerError.value = "";
        }, 2000);
        resetScanState();
        return false;
      }
    } else if (currentDataType === "Shelf Location") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          trayId: scannedData.value[0].value,
          shelf_location: trimmedData,
          endpoint: "/update-location",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
        setTimeout(() => {
          scannerError.value = "";
        }, 2000);
        resetScanState();
        return false;
      }
    }
  } else if (firstScanType === "Rack") {
    if (currentDataType === "Location") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          rack: scannedData.value[0].value,
          location: trimmedData,
          endpoint: "/update-rack-location",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
        setTimeout(() => {
          scannerError.value = "";
        }, 2000);
        resetScanState();
        return false;
      }
    } else if (currentDataType === "Rack") {
      scannedData.value.pop();
      resetScanState();
      scannerError.value = "Cannot scan Rack twice!";
      setTimeout(() => {
        scannerError.value = "";
      }, 2000);
      return false;
    }
  } else if (firstScanType === "Location") {
    if (currentDataType === "Rack") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          location: scannedData.value[0].value,
          rack: trimmedData,
          endpoint: "/update-rack-location",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
        setTimeout(() => {
          scannerError.value = "";
        }, 2000);
        resetScanState();
        return false;
      }
    } else if (currentDataType === "Location") {
      scannedData.value.pop();
      resetScanState();
      scannerError.value = "Cannot scan Location twice!";
      setTimeout(() => {
        scannerError.value = "";
      }, 2000);
      return false;
    }
  } else if (firstScanType === "Product Order") {
    // Original Product Order first flow
    if (currentDataType === "Product Order") {
      scannedData.value.pop();
      resetScanState();
      scannerError.value = "Cannot scan Product Order twice!";
      setTimeout(() => {
        scannerError.value = "";
      }, 2000);
      return false;
    } else if (currentDataType === "MAC Address") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          productOrder: scannedData.value[0].value,
          macAddress: trimmedData,
          endpoint: "/update_mac_product",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        resetScanState();
        scannerError.value = "❌ Product Order Have TTGO Already.";
        scannerSuccess.value = "";
        setTimeout(() => {
          scannerError.value = "";
        }, 2000);
        return false;
      }
    } else if (["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(currentDataType)) {
      waitingForMac.value = true;
      scanCount.value++;
      return true;
    }
  } else if (firstScanType === "MAC Address") {
    // MAC Address first flow
    if (currentDataType === "Product Order") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          macAddress: scannedData.value[0].value,
          productOrder: trimmedData,
          endpoint: "/update_mac_product",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        resetScanState();
        scannerError.value = "❌ Product Order Have TTGO Already.";
        scannerSuccess.value = "";
        setTimeout(() => {
          scannerError.value = "";
        }, 2000);
        return false;
      }
    } else if (["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(currentDataType)) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          macAddress: scannedData.value[0].value,
          trayId: trimmedData,
          endpoint: "/update_mac_tray",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
        return false;
      }
    } else if (currentDataType === "MAC Address") {
      scannedData.value.pop();
      resetScanState();
      scannerError.value = "Cannot scan MAC Address twice!";
      setTimeout(() => {
        scannerError.value = "";
      }, 2000);
      return false;
    }
  } else if (firstScanType === "Shelf Location") {
    if (StatusForRemember.value && ["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(currentDataType)) {
      rememberShelfLocation.value = scannedData.value[0].value;
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          shelf_location: scannedData.value[0].value,
          trayId: trimmedData,
          endpoint: "/update-location",
        });
        scannedData.value.push({
          type: "Shelf Location",
          value: rememberShelfLocation.value,
        });
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
        return false;
      }
    }
    // Original logic for when checkbox is not checked or first scan
    if (["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(currentDataType)) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleApiCall({
          shelf_location: scannedData.value[0].value,
          trayId: trimmedData,
          endpoint: "/update-location",
        });
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
        return true;
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
        return false;
      }
    }
  }
  return false; // Default return if no conditions match
};

const handleThirdScan = async (currentDataType, trimmedData) => {
  if (scanCount.value === 2 && waitingForMac.value) {
    if (currentDataType === "MAC Address") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Find the product order and tray ID from scanned data
        const productOrder = scannedData.value.find(
          (item) => item.type === "Product Order"
        )?.value;
        const trayId = scannedData.value.find((item) =>
          ["TrayBlack ID", "TrayRed ID", "TrayWhite ID"].includes(item.type)
        )?.value;

        await handleApiCall({
          productOrder: productOrder,
          trayId: trayId,
          macAddress: trimmedData,
          endpoint: "/update_mac_product-tray",
        });
        resetScanState();
        scannerSuccess.value = "✅ Scan successful! Ready for next scan.";
        scannerError.value = "";
        setTimeout(() => {
          scannerSuccess.value = "";
        }, 2000);
      } catch (err) {
        scannerError.value = "❌ API call failed. Please try again.";
        scannerSuccess.value = "";
      }
    } else {
      scannerError.value = "Please scan a MAC Address";
      scannedData.value.pop();
      return false;
    }
  }
  return true;
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

// Main onDetect function
const onDetect = async (detectedCodes) => {
  if (detectedCodes.length > 0) {
    const detectedData = detectedCodes[0].rawValue;
    console.log("QR Code detected:", detectedData);

    if (detectedData && detectedData.trim()) {
      const trimmedData = detectedData.trim();
      const currentDataType = classifyData(trimmedData);
      console.log("QR Code detected:", currentDataType);
      if (scanMode.value === "lookup") {
        try {
          loading.value = true;
          await handleLookup(trimmedData); // ฟังก์ชันค้นหาข้อมูล
          scannerSuccess.value = "Lookup successful! Data found.";
          setTimeout(() => {
            scannerSuccess.value = "";
          }, 2000);
        } catch (err) {
          scannerError.value = "Lookup failed: " + err.message;
        } finally {
          loading.value = false;
        }
        return; // 🛑 หยุดตรงนี้ ไม่ให้ไป logic ข้างล่าง
      }
      // Update display for current scan
      updateScanDisplay(currentDataType, trimmedData);

      watch(StatusForRemember, (newVal, oldVal) => {
        if (oldVal && !newVal) {
          resetScanState();
        }
      });
      // Handle different scan sequences
      if (scanCount.value === 0) {
        if (!handleFirstScan(currentDataType, trimmedData)) return;
      } else if (scanCount.value === 1) {
        if (!(await handleSecondScan(currentDataType, trimmedData))) return;
      } else if (scanCount.value === 2) {
        if (!(await handleThirdScan(currentDataType, trimmedData))) return;
      }

      success.value = true;
      setTimeout(() => {
        success.value = false;
      }, 2000);
    } else {
      scannerError.value = "Invalid data format. Please scan again.";
      setTimeout(() => {
        scannerError.value = "";
      }, 3000);
    }
  }
};

const handleLookup = async (qrCode) => {
  console.log("[LOOKUP MODE] scanning:", qrCode);
  scannedTrayIds.value = [qrCode];

  try {
    const res = await axios.get(`https://10.100.10.139:8000/table01-lookup`, {
      params: { qr: qrCode },
    });

    const data = res.data;

    lookupResult.value = data;
    console.log("Lookup result:", lookupResult.value);
    const tray = await axios.post("https://10.100.10.139:8000/lookup-product-order", {
      product_order: lookupResult.value[0].product_order,
    });
    trayMain.value = tray.data.tray_id_main;
    trayMainLocation.value = tray.data.tray_main_location;
    childLocations.value = tray.data.tray_locations;
    childTrayIds.value = tray.data.tray_ids; // exactly what comes back
    trayIds.value = [trayMain.value, ...childTrayIds.value];
  } catch (err) {
    scannerError.value = "Lookup failed: " + (err.response?.data?.detail || err.message);
    setTimeout(() => {
      scannerError.value = "";
    }, 2000);
    throw err;
  }
};

const trayDetails = computed(() =>
  childTrayIds.value
    .map((id, i) => ({
      id,
      location: childLocations.value[i] ?? null,
    }))
    .filter((tray) => tray.id && tray.id.trim() !== "")
);

function sortBy(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
}

const sortedTrayDetails = computed(() => {
  return [...trayDetails.value].sort((a, b) => {
    const valA = a[sortKey.value] ?? "";
    const valB = b[sortKey.value] ?? "";

    if (typeof valA === "string") {
      return sortAsc.value ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc.value ? valA - valB : valB - valA;
  });
});

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
    ctx.fillText("QR Code Found!", x, y > 20 ? y - 10 : y + height + 25);
  }
};

const onError = (err) => {
  console.error("QR Scanner error:", err);
  scannerError.value = `Scanner error: ${err.message || "Camera access denied"}`;
};

const closeScanner = () => {
  showScanner.value = false;
  scannerError.value = "";
};

const switchCamera = () => {
  if (hasMultipleCameras.value) {
    currentCamera.value = currentCamera.value === "environment" ? "user" : "environment";
  }
};

const toggleMicroMode = () => {
  isMicroMode.value = !isMicroMode.value;
};

// Initialize camera check on mount
onMounted(() => {
  checkCameraSupport();
});

// Add handleSubmit function if it doesn't exist

// Check if device has multiple cameras
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

// Add new function to handle tray operations
const handleTrayOperation = async (mode) => {
  try {
    const endpoint =
      mode === "add"
        ? "/add-tray-scan"
        : mode === "change"
          ? "/change-tray-scan"
          : "/delete-tray-scan";

    const payload =
      mode === "delete"
        ? { tray_id: scannedTrayIds.value[0] } // delete needs only one tray_id
        : {
          first_tray_id: scannedTrayIds.value[0], // update needs both
          second_tray_id: scannedTrayIds.value[1],
        };
    if (mode === "add") {
      operationLog.value = `🟢 Added Tray = ${scannedTrayIds.value[1]} → Tray = ${scannedTrayIds.value[0]}`;
    } else if (mode === "change") {
      operationLog.value = `🟡 Changed tray: ${scannedTrayIds.value[0]} → ${scannedTrayIds.value[1]}`;
    } else if (mode === "delete") {
      operationLog.value = `🔴 Deleted tray: ${scannedTrayIds.value[0]}`;
    }
    console.log("Payload for tray operation:", payload);
    await handleApiCall({
      endpoint: endpoint,
      ...payload,
    });
    resetScanState();
    scannedTrayIds.value = [];
    scannerSuccess.value = "✅ Tray operation successful! Ready for next scan.";
    scannerError.value = "";
    setTimeout(() => {
      scannerSuccess.value = "";
    }, 2000);
  } catch (err) {
    resetScanState();
    scannerError.value = "❌ Tray operation failed. Please try again.";
    scannerSuccess.value = "";
    setTimeout(() => {
      scannerError.value = "";
    }, 2000);
  }
};

const handleMode = (mode) => {
  if (mode === "add") {
    trayOperation.value = "Add";
  } else if (mode === "change") {
    trayOperation.value = "Change";
  } else if (mode === "delete") {
    trayOperation.value = "Delete";
  }
};

watch(currentModeIndex, (newVal) => {
  handleMode(trayModes[newVal]);
});

function nextMode() {
  currentModeIndex.value = (currentModeIndex.value + 1) % trayModes.length;
}

function prevMode() {
  currentModeIndex.value =
    (currentModeIndex.value - 1 + trayModes.length) % trayModes.length;
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
  font-family: "Century", "Century Gothic", "Georgia", serif;
  color: var(--text);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

/* Dashboard Styles */

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

/* Add styles for the Update card */
.dashboard-grid .no-hover {
  display: grid;
  grid-template-columns: repeat(2, minmax(1fr));
  /* Center in the grid */
  width: 80%;
  /* Make it wider */
  height: auto;
  /* Allow height to adjust based on content */
  margin-left: 60%;
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
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.scanner-card:hover::before {
  transform: scaleX(1);
}

.scanner-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(37, 99, 235, 0.2);
}

.card-title {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.scanner-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  min-height: 400px;

}

.scanner-cards {
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
}

.scanner-card {
  background: white;
  border-radius: 20px;
  padding: 4rem;
  width: 300px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}


/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem 0;
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

  .card-arrow {
    width: 28px;
    height: 28px;
    bottom: 1.25rem;
    right: 1.25rem;
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
  border-color: #8dbaed;
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
  background-color: #8dbaed;
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
  box-shadow: 0px 8px 10px #1b4778, 0px 2px 2px #1b4778;
}

.scan-btn:hover {
  background-color: #7aa8db;
  transform: translateY(-1px);
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

.shelf-location-controls {
  background: rgb(243, 239, 239);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: block;
  margin-left: 3rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
  user-select: none;
}

.shelf-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  background: white;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark {
  color: white;
  font-weight: bold;
  font-size: 12px;
  opacity: 0;
  transform: scale(0) rotate(-12deg);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.shelf-checkbox:checked+.custom-checkbox {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-color: #4CAF50;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.shelf-checkbox:checked+.custom-checkbox .checkmark {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.checkbox-container:hover .custom-checkbox {
  border-color: #4CAF50;
  transform: scale(1.02);
}

.checkbox-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  transition: color 0.2s ease;
}

.shelf-checkbox:checked~.checkbox-label {
  color: #4CAF50;
}

.checkbox-container::before {
  content: '';
  position: absolute;
  left: -5px;
  top: -5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.1);
  transform: scale(0);
  transition: transform 0.2s ease;
}

.checkbox-container:active::before {
  transform: scale(1);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.shelf-checkbox:checked+.custom-checkbox {
  animation: pulse 0.4s ease;
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.scanner-container {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  width: 450px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.scanner-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.scanner-tips h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  text-align: center;
}

.scanner-tips-lookup p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #ffffff;
}

.scanner-tips-lookup span.highlight-product {
  font-weight: bold;
  color: #fdfd45;
}

.scanner-tips-lookup span.highlight-material {
  font-weight: bold;
  color: #ffffff;
}

.scanner-tips-lookup span.highlight-name {
  font-weight: bold;
  font-size: medium;
  color: #3c3cff;
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
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.scanner-video {
  width: 100%;
  height: 300px;
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
  width: 220px;
  height: 220px;
  border: 3px solid #00ff00;
  border-radius: 12px;
  background: transparent;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  animation: pulse 2s infinite;
  backdrop-filter: contrast(1.2) brightness(1.1);
  transition: all 0.3s ease;
}

.scanner-frame.micro-mode {
  border-color: #8dbaed;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(141, 186, 237, 0.3);
  backdrop-filter: contrast(1.5) brightness(1.3) saturate(1.2);
}

.sortable {
  cursor: pointer;
  user-select: none;
}

@media (max-width: 480px) {
  .scanner-modal {
    padding-top: 0;
    align-items: flex-start;
  }

  .scanner-container {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    padding: 0.75rem;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }

  .scanner-header {
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
  }

  .scanner-content {
    flex: 1;
    min-height: 0;
    margin-bottom: 0.5rem;
  }

  .scanner-video {
    height: 200px;
    width: 100%;
  }

  .scanner-frame {
    width: 180px;
    height: 180px;
  }

  .scanner-footer {
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
  }

  .change-mode-btn,
  .reset-btn {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .type-reference {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }

  .type-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .tray-buttons {
    padding: 0.5rem;
    margin-top: 0.5rem;
  }

  .tray-btn {
    padding: 0.4rem;
    font-size: 0.8rem;
    display: flex;
  }
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
  padding-top: 0.5rem;
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
  margin-bottom: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.scanner-tips-lookup {
  text-align: left;
  margin-bottom: 1rem;
  background: #a8a6a6;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  margin-left: auto !important;
  margin-right: auto !important;
}

.lookup-bottom-section {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.table-container {
  padding: 0.5rem;
  background: rgb(243, 242, 242);
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-width: 190px;
  min-height: 150px;
  /* ประมาณ 10 แถว */
  transition: all 0.3s ease-in-out;
}

.change-mode-btn,
.reset-btn {
  background-color: #8dbaed;
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
  background-color: #fccf61;
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

.scanner-tips-lookup img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  display: block !important;
  margin-left: 0.5rem !important;
}

img:hover {
  transform: scale(1.05);
}

.type-reference {
  margin-top: 1rem;
  padding-top: 1rem;
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
  background-color: #36d4cd;
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

.type-item.rack-streel {
  background-color: #8990f1;
  border: 1px solid #f5e6d3;
}

.type-item.rack-pom {
  background-color: #a16f5b;
  border: 1px solid #f5e6d3;
}

.type-item.traywhite-id {
  background-color: #e2ddda;
  border: 1px solid #f5e6d3;
}

.type-item.trayred-id {
  background-color: #f72e2e;
  border: 1px solid #f5e6d3;
}

.type-item.trayblack-id {
  background-color: #686463;
  border: 1px solid #f5e6d3;
}

.type-item.shelf-location {
  background-color: #db6547;
  border: 1px solid #f5e6d3;
}

.type-item.location {
  background-color: #7f9666;
  border: 1px solid #f5e6d3;
}

.type-item.rack {
  background-color: #ccd90c;
  border: 1px solid #f5e6d3;
}

.type-item.unknown {
  background-color: #ffffff;
  border: 1px solid #ff0000;
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

.mode-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  /* ระยะห่างระหว่างปุ่มกับข้อความ */
  flex-wrap: nowrap;
  margin: 0 auto;
}

.mode-switcher h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

.tray-mode.Add {
  color: green;
}

.tray-mode.Change {
  color: goldenrod;
}

.tray-mode.Delete {
  color: red;
}

.operation-log {
  margin: 0 auto;
}

.tray-btn {
  flex: 1;
  min-width: 30px;
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

.tray-btn.add {
  background-color: #77bb78;
  color: white;
}

.tray-btn.change {
  background-color: #8dbaed;
  color: white;
}

.tray-btn.delete {
  background-color: #f8aab6;
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