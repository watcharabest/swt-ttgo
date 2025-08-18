<template>
  <div>
    <header>
      <div class="header-line">
        <label>Line</label>
        <select id="line" v-model="store.line" class="table-select">
          <optgroup label="SMT4">
            <option value="AUTO4">AUTO4</option>
            <option value="PRE4101">PRE4101</option>
            <option value="PRE4102">PRE4102</option>
            <option value="PRE4103">PRE4103</option>
            <option value="PRE4104">PRE4104</option>
            <option value="PRE4105">PRE4105</option>
            <option value="PRE4106">PRE4106</option>
            <option value="PRE4107">PRE4107</option>
            <option value="PRE4108">PRE4108</option>
            <option value="PRE4109">PRE4109</option>
            <option value="PRE4110">PRE4110</option>
            <option value="PRE4201">PRE4201</option>
            <option value="PRE4202">PRE4202</option>
            <option value="PRE4203">PRE4203</option>
            <option value="PRE4204">PRE4204</option>
            <option value="PRE4205">PRE4205</option>
            <option value="PRE4206">PRE4206</option>
            <option value="PRE4207">PRE4207</option>
            <option value="PRE4208">PRE4208</option>
            <option value="PRE4209">PRE4209</option>
            <option value="PRE4210">PRE4210</option>
            <option value="PRE4211">PRE4211</option>
            <option value="PRE4212">PRE4212</option>
            <option value="PRE4213">PRE4213</option>
          </optgroup>
          <optgroup label="SMT5">
            <option value="AUTO5">AUTO5</option>
            <option value="PRE5102">PRE5102</option>
            <option value="PRE5103">PRE5103</option>
            <option value="PRE5104">PRE5104</option>
            <option value="PRE5105">PRE5105</option>
            <option value="PRE5106">PRE5106</option>
            <option value="PRE5107">PRE5107</option>
            <option value="PRE5108">PRE5108</option>
            <option value="PRE5109">PRE5109</option>
            <option value="PRE5110">PRE5110</option>
            <option value="PRE5201">PRE5201</option>
            <option value="PRE5202">PRE5202</option>
            <option value="PRE5203">PRE5203</option>
            <option value="PRE5204">PRE5204</option>
            <option value="PRE5205">PRE5205</option>
            <option value="PRE5206">PRE5206</option>
            <option value="PRE5207">PRE5207</option>
            <option value="PRE5208">PRE5208</option>
            <option value="PRE5209">PRE5209</option>
            <option value="PRE5210">PRE5210</option>
            <option value="PRE5211">PRE5211</option>
            <option value="PRE5212">PRE5212</option>
            <option value="PRE5213">PRE5213</option>
          </optgroup>
        </select>
      </div>
    </header>

    <div class="group-scan">
      <div class="scan-container">
        <button type="button" @click="toggleScanner('Automate')" :disabled="loading" class="scan-btn">
          Click to Scan Check In/Out<br><span style="font-size: 1.5rem; color: #0066cc;"> Automate </span><span
            style="font-size: 1.5rem; color: #666 ;"> & </span><span style="font-size: 1.5rem; color: #00cc41 ;">
            Pre-Plate </span>
        </button>
      </div>
    </div>

    <div v-if="showScanner" class="scanner-modal" @click="closeScanner">
      <div class="scanner-container" @click.stop>
        <div class="scanner-header">
          <h3>Scan QR Code</h3>
          <button type="button" @click="closeScanner" class="close-btn">✕</button>
        </div>

        <div class="scanner-content">
          <QrcodeStream :key="scannerKey" @detect="onDetect" @error="onError" class="scanner-video" :constraints="{
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
              <i class="fa-solid fa-camera-rotate"></i>
            </button>
          </div>
        </div>
        <div class="scanner-footer">
          <button type="button" @click="toggleMicroMode" class="change-mode-btn">
            {{ isMicroMode ? "Normal Mode" : "Micro Mode" }}
          </button>
          <div class="type-reference" v-if="scannedData.length > 0">
            <div class="type-list">
              <div v-for="(scan, index) in scannedData" :key="index"
                :class="['type-item', scan.type.toLowerCase().replace(' ', '-')]">
                <span class="type-label">{{ scan.type }}:</span>
                <span class="type-format">{{ scan.value }}</span>
                <div v-if="scan.type === 'Location'" class="shelf-location-controls">
                  <label class="checkbox-container">
                    <input type="checkbox" v-model="StatusForRemember" class="shelf-checkbox" />
                    <span v-if="StatusForRemember" class="custom-checkbox">✓</span>
                    <span v-else class="custom-checkbox"></span>
                    <span class="checkbox-label">Remember</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import axios from "axios";
import Swal from "sweetalert2";
import { useMyVar } from "@/myVar";

const store = useMyVar()
const loading = ref(false);
const error = ref(null);
const qrData = ref("");
const scannerKey = ref(0);
const dataType = ref("");
const locationcheckin = ref("");
// New state variables for tracking scans
const scanCount = ref(0);
const scannedData = ref([]);
const checkTaskForm = ref("");
// QR Scanner related
const showScanner = ref(false);
const scannerError = ref("");
const scannerSuccess = ref("");
const hasMultipleCameras = ref(true);
const currentCamera = ref("environment");
const isMicroMode = ref(false);

const locationAuto = ref("");
const rememberlocataionAutomate = ref(false);
const locationPreplate = ref("");
const rememberlocataionPreplate = ref(false);

const bluetoothBuffer = ref("");

const taskDetail = ref(null)

const loadingTaskDetail = ref(false)

const classifyData = (data) => {
  if (/^tg/i.test(data)) {
    return "TAG";
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

const resetScanState = () => {
  scanCount.value = 0;
  scannedData.value = [];
  qrData.value = "";
  dataType.value = "";
  error.value = null;
  scannerSuccess.value = "";
  scannerKey.value++;
};

const updateScanDisplay = (currentDataType, trimmedData) => {
  qrData.value = trimmedData;
  dataType.value = currentDataType;
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
  if (currentDataType === "TAG") {
    try {
      const res = await axios.get(`${__API_BASE_URL__}/check_task_form`, {
        params: { tray_id: trimmedData },
      });
      checkTaskForm.value = res.data?.task_id || '';
      resetScanState()

      if (checkTaskForm.value) {
        if (/^AUTO/i.test(store.line)) {
          axios.post(`${__API_BASE_URL__}/check_in_auto`, {
            tray_id: trimmedData,
            location: store.line,
          });
          const res = await axios.get(`${__API_BASE_URL__}/check_task_form_forAuto`, {
            params: { tray_id: trimmedData },
          });
          checkTaskForm.value = res.data?.pre_task_id || ''
          console.log(checkTaskForm.value)
          await showTaskDetail(checkTaskForm.value);

          resetScanState();

          // Build HTML with actual task details
          let taskDetailHtml = `
            <div style="text-align: left;">
              <p><strong>Tray:</strong> ${trimmedData}</p>`;

          if (taskDetail.value) {
            if (taskDetail.value.line) {
              taskDetailHtml += `<p><strong>Task Line:</strong> ${taskDetail.value.line}</p>`;
            }
            if (taskDetail.value.images && taskDetail.value.images.length > 0) {
              taskDetailHtml += `<div class="form-group">
                <p><strong>Images:</strong></p>
                <div class="image-gallery" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">`;

              taskDetail.value.images.forEach((imageUrl) => {
                taskDetailHtml += `<div class="image-item">
                  <img src="${imageUrl}" alt="Product Image" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;" />
                </div>`;
              });

              taskDetailHtml += `</div></div>`;
            }
          } else {
            taskDetailHtml += `<p><em>No additional task details available</em></p>`;
          }

          taskDetailHtml += `</div>`;

          await Swal.fire({
            icon: "success",
            title: "Check Out Tray Success",
            html: taskDetailHtml,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          return true;

        } else if (/^PRE/i.test(store.line)) {
          axios.post(`${__API_BASE_URL__}/check_in_pre`, {
            tray_id: trimmedData,
            location: store.line,
          });
          resetScanState()
          await Swal.fire({
            icon: "success",
            title: "Check In Tray Success",
            html: `
            <div style="text-align: left;">
                <p><strong>Tray:</strong> ${trimmedData}</p>
                <p><strong>Location:</strong> ${store.line}</p>
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
          return true
        }
      } else {
        await Swal.fire({
          icon: "error",
          title: "Check In Tray Failed",
          text: "Tray : " + trimmedData + " Don't have Task",
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
        return false;
      }
    } catch (err) {
      scannerError.value = "Check in tray failed: " + (err.response?.data?.detail || err.message);
      setTimeout(() => {
        scannerError.value = "";
      }, 2000);
      throw err;
    }
  }
}

async function showTaskDetail(row) {
  loadingTaskDetail.value = true
  taskDetail.value = null

  try {
    // Fetch task details using task_id
    const taskRes = await axios.post(`${__API_BASE_URL__}/product_task_order_lookup`, {
      task_id: row,
    })
    console.log("taskRes.data", taskRes.data)

    // Handle response - could be array or single object
    if (taskRes.data) {
      // If it's an array, take the first item. If it's an object, use it directly.
      taskDetail.value = Array.isArray(taskRes.data) ? taskRes.data[0] : taskRes.data

      console.log("taskDetail.value", taskDetail.value)


    }
  } catch (err) {
    console.error('Error fetching task details:', err)
  } finally {
    loadingTaskDetail.value = false
  }
}

// const changeLocation = async () => {
//   console.log(locationcheckin.value)
//   closeScanner();
//   if (locationcheckin.value === "Automate") {
//     const { value: formValues } = await Swal.fire({
//       title: "Select Location",
//       html: `
//         <div style="text-align: left;">
//           <label for="location-select">Select a Location:</label>
//           <select id="location-select" class="swal2-select" style="width: 80%;">
//             <option value="">Select a Location</option>
//             <optgroup label="SMT4">
//               <option value="AUTO4">AUTO4</option>
//             </optgroup>
//             <optgroup label="SMT5">
//               <option value="AUTO5">AUTO5</option>
//             </optgroup>
//           </select>

//           <div style="margin-top: 15px;">
//             <input type="checkbox" id="remember-location" style="margin-right: 8px;">
//             <label for="remember-location">Remember this selection</label>
//           </div>
//         </div>
//       `,
//       focusConfirm: false,
//       showCancelButton: true,
//       preConfirm: () => {
//         const location = document.getElementById('location-select').value;
//         const remember = document.getElementById('remember-location').checked;
//         if (!location) {
//           Swal.showValidationMessage('Please select a location');
//           return false;
//         }
//         return {
//           location: location,
//           remember: remember
//         };
//       }
//     });
//     locationAuto.value = formValues.location;
//     rememberlocataionAutomate.value = formValues.remember;
//     if (!showScanner.value) {
//       const hasCamera = await checkCameraSupport();
//       if (!hasCamera) {
//         scannerError.value = "No camera found on this device";
//         return;
//       }
//       startScanner();
//     } else {
//       closeScanner();
//     }
//   } else if (locationcheckin.value === "Pre-Plate") {
//     const { value: formValues } = await Swal.fire({
//       title: "Select Location",
//       html: `
//         <div style="text-align: left;">
//           <label for="location-select">Select a Location:</label>
//           <select id="location-select" class="swal2-select" style="width: 80%;">
//             <option value="">Select a Location</option>
//             <optgroup label="SMT4">
//               <option value="PRE4101">PRE4101</option>
//               <option value="PRE4102">PRE4102</option>
//               <option value="PRE4103">PRE4103</option>
//               <option value="PRE4104">PRE4104</option>
//               <option value="PRE4105">PRE4105</option>
//               <option value="PRE4106">PRE4106</option>
//               <option value="PRE4107">PRE4107</option>
//               <option value="PRE4108">PRE4108</option>
//               <option value="PRE4109">PRE4109</option>
//               <option value="PRE4110">PRE4110</option>
//               <option value="PRE4111">PRE4111</option>
//               <option value="PRE4112">PRE4112</option>
//               <option value="PRE4113">PRE4113</option>
//             </optgroup>
//             <optgroup label="SMT5">
//               <option value="PRE5101">PRE5101</option>
//               <option value="PRE5102">PRE5102</option>
//               <option value="PRE5103">PRE5103</option>
//               <option value="PRE5104">PRE5104</option>
//               <option value="PRE5105">PRE5105</option>
//               <option value="PRE5106">PRE5106</option>
//               <option value="PRE5107">PRE5107</option>
//               <option value="PRE5108">PRE5108</option>
//               <option value="PRE5109">PRE5109</option>
//               <option value="PRE5110">PRE5110</option>
//               <option value="PRE5111">PRE5111</option>
//               <option value="PRE5112">PRE5112</option>
//               <option value="PRE5113">PRE5113</option>
//               <option value="PRE5114">PRE5114</option>
//               <option value="PRE5115">PRE5115</option>
//             </optgroup>
//           </select>

//           <div style="margin-top: 15px;">
//             <input type="checkbox" id="remember-location" style="margin-right: 8px;">
//             <label for="remember-location">Remember this selection</label>
//           </div>
//         </div>
//       `,
//       focusConfirm: false,
//       showCancelButton: true,
//       preConfirm: () => {
//         const location = document.getElementById('location-select').value;
//         const remember = document.getElementById('remember-location').checked;
//         if (!location) {
//           Swal.showValidationMessage('Please select a location');
//           return false;
//         }
//         return {
//           location: location,
//           remember: remember
//         };
//       }
//     });
//     locationPreplate.value = formValues.location;
//     rememberlocataionPreplate.value = formValues.remember;
//     if (!showScanner.value) {
//       const hasCamera = await checkCameraSupport();
//       if (!hasCamera) {
//         scannerError.value = "No camera found on this device";
//         return;
//       }
//       startScanner();
//     } else {
//       closeScanner();
//     }
//   }
// }



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

const toggleMicroMode = () => {
  isMicroMode.value = !isMicroMode.value;
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
    closeScanner()


  } catch (err) {
    console.error("Error processing Bluetooth scan:", err);
  }
};

</script>

<style scoped>
header {
  max-width: 420px;
  margin: 1rem auto;
  padding: 2rem;
  background: #eeeeee;
  border-radius: 2rem;
  box-shadow: 10px 10px 30px #c2c8d0, -10px -10px 30px #ffffff;
  color: #666;
  margin-bottom: 5rem;
}

.table-select {
  font-size: 1rem;
  width: 70%;
  margin: 10px 0;
  padding: 12px;
  padding-top: 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #eeeeee;
  box-shadow: inset 4px 4px 6px #dcdee0, inset -4px -4px 6px #f0f5fa;
}

.table-select.invalid {
  box-shadow: inset 1px 1px 4px #ff0000, inset -1px -1px 6px #ff0000;
}

h2 {
  color: #666;
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.header-line label {
  font-size: 3rem;
  margin-right: 1rem;
}

.group-scan {
  display: flex;
}

@media (max-width: 768px) {
  .group-scan {
    display: flex;
    flex-direction: column;
  }
}

.scan-container {
  display: flex;
  justify-content: center;

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
  width: 100%;
  height: 350px !important;
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

.change-mode-btn {
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

.change-btn {
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
  background-color: #fccf61;
}

.product-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
