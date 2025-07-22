<template>
  <div>
    <header>
      <div class="header-line">
        <label>Line</label>
        <select id="line" v-model="store.line" class="table-select" :class="{ invalid: errors.line }">
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

    <div class="scan-container">
      <button type="button" @click="toggleScanner('update')" :disabled="loading" class="scan-btn">
        Click to Scan
      </button>
    </div>
    <div class="box-wrapper" v-if="checkTaskForm">
      <div v-if="tray_id">
        <h1>Tray : {{ tray_id }} </h1>
      </div>
      <div v-else>
        <h1 style="color: red;"> No Tray detected</h1>
      </div>
      <form @submit.prevent="submit" novalidate>
        <div class="group-product">
          <span>Product Order</span>
          <p>{{ form.product_order }}</p>
        </div>

        <div class="form-group">
          <span>Material</span>
          <p>{{ form.material_no }}</p>
        </div>

        <div class="form-group">
          <span>Material Description</span>
          <p>{{ form.material_des }}</p>
        </div>

        <div class="form-group">
          <span>Amount</span>
          <p>{{ form.amount }}</p>
        </div>

        <div class="form-group">
          <div class="group-radio-type">
            <div class="form-radio">
              <div class="radio-option-lock">
                <label>ทองแดง</label>
                <input id="surface" v-model="form.surface" type="radio" value="ทองแดง"
                  :disabled="form.surface !== null && form.surface !== 'ทองแดง'" :class="{ invalid: errors.surface }" />
                <label>ออกผิว</label>
                <input id="surface" v-model="form.surface" type="radio" value="ออกผิว"
                  :disabled="form.surface !== null && form.surface !== 'ออกผิว'" :class="{ invalid: errors.surface }" />
                <label>เปิดผิว</label>
                <input id="surface" v-model="form.surface" type="radio" value="เปิดผิว"
                  :disabled="form.surface !== null && form.surface !== 'เปิดผิว'"
                  :class="{ invalid: errors.surface }" />
              </div>
            </div>
            <div class="form-radio">
              <div class="radio-option" style="gap: 0px;">
                <label>Big Barrel</label>
                <input type="text" v-model="inputs.BIG"
                  :disabled="!!selectedType?.value && selectedType.value !== 'BIG'" @focus="setType('BIG')"
                  :class="{ invalid: errors.type || hasMultipleInputs }" />
                <label>TT</label>
                <input type="text" v-model="inputs.TT" :disabled="!!selectedType?.value && selectedType.value !== 'TT'"
                  @focus="setType('TT')" :class="{ invalid: errors.type || hasMultipleInputs }" />
                <label>OTEC</label>
                <input type="text" v-model="inputs.OTEC"
                  :disabled="!!selectedType?.value && selectedType.value !== 'OTEC'" @focus="setType('OTEC')"
                  :class="{ invalid: errors.type || hasMultipleInputs }" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <span>Image</span>
          <input id="imageFileInput" type="file" accept="image/png, image/jpeg" @change="handleFileChange"
            class="img-input" />
          <label for="imageFileInput" class="img-input">
            <i class="fa-solid fa-image"></i>Click to select image
          </label>
          <p v-if="errors.image" class="error-text">Required</p>
        </div>
        <div class="preview" v-if="previewUrl">
          <img :src="previewUrl" alt="Preview" />
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">{{ loading ? 'Processing…' : 'Submit' }}</button>
        <p v-if="errors.tray_id" class="error-text">Please scan tray QR code</p>
      </form>
    </div>

    <div v-else class="box-wrapper">
      <!-- Insert Form -->
      <div v-if="tray_id">
        <h1>Tray : {{ tray_id }} </h1>
      </div>
      <div v-else>
        <h1 style="color: red;">No Tray detected</h1>
      </div>
      <form @submit.prevent="submit" novalidate>
        <div class="group-product">
          <span>Product Order</span>
          <input id="productname" v-model="form.product_order" type="text" placeholder="Enter Product Name"
            :class="{ invalid: errors.product_name }" />
          <p v-if="errors.product_name" class="error-text">Required</p>
        </div>

        <div class="form-group">
          <span>Material</span>
          <input id="material" v-model="form.material_no" type="text" placeholder="Enter Material"
            :class="{ invalid: errors.material_no }" />
          <p v-if="errors.material_no" class="error-text">Required</p>
        </div>

        <div class="form-group">
          <span>Material Description</span>
          <input id="material" v-model="form.material_des" type="text" placeholder="Enter Material"
            :class="{ invalid: errors.material_des }" />
          <p v-if="errors.material_des" class="error-text">Required</p>
        </div>

        <div class="form-group">
          <span>Amount</span>
          <input id="amount" v-model="form.amount" type="text" placeholder="Enter Amount"
            :class="{ invalid: errors.amount }" />
          <p v-if="errors.amount" class="error-text">Required</p>
        </div>

        <div class="form-group">
          <div class="group-radio-type">
            <div class="form-radio">
              <div class="radio-option">
                <label>ทองแดง</label>
                <input id="surface" v-model="form.surface" type="radio" value="ทองแดง" @click="toggleRadio('ทองแดง')"
                  style="cursor: pointer;" :class="{ invalid: errors.surface }" />
                <label>ออกผิว</label>
                <input id="surface" v-model="form.surface" type="radio" value="ออกผิว" @click="toggleRadio('ออกผิว')"
                  style="cursor: pointer;" :class="{ invalid: errors.surface }" />
                <label>เปิดผิว</label>
                <input id="surface" v-model="form.surface" type="radio" value="เปิดผิว" @click="toggleRadio('เปิดผิว')"
                  style="cursor: pointer;" :class="{ invalid: errors.surface }" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <span>Image</span>
          <input id="imageFileInput" type="file" accept="image/png, image/jpeg" @change="handleFileChange"
            class="img-input" />
          <label for="imageFileInput" class="img-input">
            <i class="fa-solid fa-image"></i>Click to select image
          </label>
          <p v-if="errors.image" class="error-text">Required</p>
        </div>
        <div class="preview" v-if="previewUrl">
          <img :src="previewUrl" alt="Preview" />
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">{{ loading ? 'Processing…' : 'Submit' }}</button>
        <p v-if="errors.tray_id" class="error-text">Please scan tray QR code</p>
      </form>
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
import { ref, reactive, computed ,watch} from 'vue'
import { useMyVar } from '../myVar'
import axios from 'axios'
import Swal from 'sweetalert2'
import { QrcodeStream } from "vue-qrcode-reader";

const form = reactive({
  product_order: '',
  material_no: '',
  material_des: '',
  amount: '',
  surface: '',
  image: ''
})

const errors = reactive({
  line: false,
  product_name: false,
  material_no: false,
  material_des: false,
  amount: false,
  type: false,
  surface: false,
  image: false
})

// Form Value
const store = useMyVar()
const productOrder = ref('')
const selectedType = ref(null)

const inputs = ref({
  BIG: '',
  TT: '',
  OTEC: ''
})

const selectedFile = ref(null)
const previewUrl = ref('')
const imageError = ref(null)
const imageSuccess = ref(false)

const loading = ref(false);
const error = ref(null);
const qrData = ref("");
const scannerKey = ref(0);
const operationLog = ref("");
const dataType = ref("");
const checkTaskForm = ref("");
const tray_id = ref("");

// New state variables for tracking scans
const scanCount = ref(0);
const scannedData = ref([]);

// QR Scanner related
const showScanner = ref(false);
const scannerError = ref("");
const scannerSuccess = ref("");
const hasMultipleCameras = ref(true);
const currentCamera = ref("environment");
const isMicroMode = ref(false);

const setType = (type) => {
  if (!selectedType.value) {
    selectedType.value = type
  }
}

const hasMultipleInputs = computed(() => {
  const filled = [inputs.value.BIG, inputs.value.TT, inputs.value.OTEC]
    .filter(v => v && v.trim() !== '')
  return filled.length > 1
})

watch(inputs, () => {
  if (!hasMultipleInputs.value) errors.type = false
}, { deep: true })

function handleFileChange(e) {
  const file = e.target.files[0]
  selectedFile.value = file || null
  previewUrl.value = file ? URL.createObjectURL(file) : ''
}

function toggleRadio(value) {
  if (form.type === value) {
    form.type = null;
  }
  if (form.surface === value) {
    form.surface = null;
  }
}

const submit = async () => {
  imageError.value = null
  imageSuccess.value = false
  error.value = null
  loading.value = true
  console.log(form)
  if (!tray_id.value) {
    errors.tray_id = true
    loading.value = false
    return
  } else {
    errors.tray_id = false
  }
  if (!store.line) {
    errors.line = true
    loading.value = false
    window.scrollTo(0, 0);
    return
  } else {
    errors.line = false
  }
  if (!form.product_order) {
    errors.product_order = true
    loading.value = false
    return
  } else {
    errors.product_order = false
  }
  if (!form.material_no) {
    errors.material_no = true
    loading.value = false
    return
  } else {
    errors.material_no = false
  }
  if (!form.material_des) {
    errors.material_des = true
    loading.value = false
    return
  } else {
    errors.material_des = false
  }
  if (!form.amount) {
    errors.amount = true
    loading.value = false
    return
  } else {
    errors.amount = false
  }
  if (!form.surface) {
    errors.surface = true
    loading.value = false
    return
  } else {
    errors.surface = false
  }
  if (checkTaskForm.value) {
    if (!selectedType.value || hasMultipleInputs.value) {
      errors.type = true
      loading.value = false
      return
    }
    errors.type = false
  }
  const data = new FormData()
  {
    data.append('product_order', form.product_order)
    data.append('material_no', form.material_no)
    data.append('material_des', form.material_des)
    data.append('amount', form.amount)
    data.append('image', selectedFile.value)
    data.append('line', store.line)
    if (checkTaskForm.value) {
      data.append('type', selectedType.value)
      data.append('rpm', inputs.value[selectedType.value])
    }
    data.append('surface', form.surface)
    data.append('tray_id', tray_id.value)
  }

  try {
    await axios.post(`${__API_BASE_URL__}/submit-task`, data)
    imageSuccess.value = !!selectedFile.value
    checkTaskForm.value = ""
    Object.assign(form, {
      product_order: '',
      material_no: '',
      material_des: '',
      surface: '',
      amount: '',
    })
    selectedType.value = null
    inputs.value = { BIG: '', TT: '', OTEC: '' }
    tray_id.value = ''
    selectedFile.value = null
    Swal.fire({
      icon: "success",
      title: "Add Task Information Success",
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
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    if (msg.includes('image')) imageError.value = msg
    else error.value = msg
  } finally {
    loading.value = false
  }
}

const classifyData = (data) => {
  if (/^tw/i.test(data)) {
    return "Tray";
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
  closeScanner()
};

const handleFirstScan = async (currentDataType, trimmedData) => {
  if (currentDataType === "Tray") {
    tray_id.value = trimmedData
    try {
      const res = await axios.get(`${__API_BASE_URL__}/check_task_form`, {
        params: { tray_id: trimmedData },
      });
      console.log("Task ID : ", res.data)
      checkTaskForm.value = res.data?.task_id?.[0] || '';
      console.log("checkTaskForm.value : ", checkTaskForm.value)
      resetScanState()
      if (checkTaskForm.value) {
        const taskRes = await axios.post(`${__API_BASE_URL__}/product_task_order`, {
          tray_id: trimmedData,
        });
        form.product_order = taskRes.data.product_order;
        form.material_no = taskRes.data.material_no;
        form.material_des = taskRes.data.material_des;
        form.amount = taskRes.data.amount;
        form.surface = taskRes.data.surface;
        tray_id.value = trimmedData;
      }
      return true
    } catch (err) {
      scannerError.value = "Lookup failed: " + (err.response?.data?.detail || err.message);
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

</script>

<style scoped>
header {
  max-width: 100vw;
  margin: 1rem auto;
  padding: 2rem;
  background: #eeeeee;
  border-radius: 2rem;
  box-shadow: 10px 10px 30px #c2c8d0, -10px -10px 30px #ffffff;
  color: #666;
}

.header-line label {
  font-size: 3rem;
  margin-right: 1rem;
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

.box-wrapper {
  max-width: fit-content;
  margin: 1rem auto;
  padding: 2rem;
  background: #eeeeee;
  border-radius: 2rem;
  box-shadow: 10px 10px 30px #c2c8d0, -10px -10px 30px #ffffff;
  color: #666;
}

.group-product {
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-top: 10px;
}

.group-product span {
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-product p {
  width: 100%;
  margin: 10px 0;
  padding: 12px;
  border-radius: 10px;
  border: none;
  color: red;
  background: #eeeeee;
  box-shadow: inset 4px 4px 6px #dcdee0, inset -4px -4px 6px #f0f5fa;
}

.group-product input {
  width: 100%;
  box-sizing: border-box;
}

.form-group {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.form-group span {
  margin-right: 1rem;
  white-space: nowrap;
}

.form-group p {
  width: 100%;
  margin: 10px 0;
  padding: 12px;
  border-radius: 10px;
  border: none;
  color: red;
  background: #eeeeee;
  box-shadow: inset 4px 4px 6px #dcdee0, inset -4px -4px 6px #f0f5fa;
}

.form-radio {
  width: 50%;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  height: 100%;
}

.group-radio-type {
  display: flex;
  align-items: stretch;
}


.radio-option {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  gap: 28px;
}

.radio-option-lock {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  margin-top: 1rem;
  gap: 28px;
}

.radio-option input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  border: 2px solid #ccc;
  border-radius: 50%;
  background: #fff;
  position: relative;
  transition: all 0.3s ease;
}

.radio-option-lock input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  margin: 0;
  border: 2px solid #ccc;
  border-radius: 50%;
  background: #fff;
  position: relative;
  transition: all 0.3s ease;
}

.radio-option input[type="text"] {
  width: 50%;
  margin: 10px 0;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #eeeeee;
  box-shadow: inset 4px 4px 6px #dcdee0, inset -4px -4px 6px #f0f5fa;
}

.radio-option input[type="radio"]:checked {
  border-color: #C7E299;
  background: #C7E299;
}

.radio-option-lock input[type="radio"]:checked {
  border-color: red;
  background: red;
}

.radio-option input[type="radio"]:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.radio-option-lock input[type="radio"]:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.radio-option label {
  align-items: center;
  margin: 0.25rem 0;
}

.radio-option-lock label {
  align-items: center;
  margin: 0.25rem 0;
}

.radio-option input[type="radio"].invalid {
  border-color: #ef4444;
}

.radio-option-lock input[type="radio"].invalid {
  border-color: #ef4444;
}

.form-line {
  width: fit-content;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.form-line span {
  margin-right: 1rem;
}

.form-line p {
  color: red;
}

.form.active .form-line input {
  padding: 0.6rem;
}

.line {
  width: 100%;
  margin: 0 auto;
  border: 0.5px solid #ffffff;
  height: 1px;
  border-radius: 3px;
  margin-top: 0.75px;
  opacity: 0.35;
  background-color: #000000;
}

h1 {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 400;
}

h2 {
  color: #666;
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.toggle-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toggle-buttons button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 10px;
  transition: 0.3s;
  color: #666;
}

.toggle-buttons button.active {
  background: #eeeeee;
  box-shadow: inset 2px 2px 5px #bec4cb, inset -2px -2px 5px #f0f5fa;
}

.form {
  display: none;
  flex-direction: column;
}

.form span {
  margin-right: 0.5rem;
  font-size: 1rem;
}

.form.active {
  display: flex;
}

input[type="text"] {
  width: 100%;
  margin: 10px 0;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #eeeeee;
  box-shadow: inset 4px 4px 6px #dcdee0, inset -4px -4px 6px #f0f5fa;
}

input[type="text"]:focus {
  outline: none;
}

input[type="text"].invalid,
select.invalid {
  box-shadow: inset 1px 1px 4px #ff0000, inset -1px -1px 6px #ff0000;
}

input[type="file"] {
  display: none;
}

.img-input {
  display: block;
  width: 275px;
  padding: 0.6rem;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.img-input:hover {
  border-color: #8DBAED;
  background: #f1f5f9;
}

.img-input i {
  margin-right: 0.5rem;
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

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
}

.preview {
  margin: 1rem 0;
  text-align: center;
}

.preview img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-submit,
.btn-delete {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.btn-submit {
  background: #C7E299;
  color: white;
  box-shadow: 0 2px 4px rgba(199, 226, 153, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #b3d486;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(199, 226, 153, 0.3);
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.close-btn:hover {
  background: #e2e8f0;
  color: #2c3e50;
}

.error {
  color: #ef4444;
  padding: 0.6rem;
  background: #fef2f2;
  border-radius: 8px;
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .box-wrapper {
    margin: 1rem;
    padding: 1.5rem;
  }

  .box {
    padding: 1.5rem;
  }

  input[type="text"],
  select,
  input[type="file"] {
    font-size: 16px;
    /* Prevent zoom on mobile */
  }

  .btn-submit,
  .btn-delete {
    padding: 0.875rem;
  }
}
</style>
