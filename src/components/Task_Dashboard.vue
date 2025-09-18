<template>
  <div>
    <div class="task-dashboard">
      <div class="header">
        <div class="group-select">
          <label>Select Month</label>
          <select id="month-select" v-model="selectedMonth" @change="onMonthChange">
            <option value="all">ทั้งหมด</option>
            <option v-for="month in availableMonths" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>

        <div class="group-select">
          <label>Select Week</label>
          <select id="week-select" v-model="selectedWeek" :disabled="weeksInSelectedMonth.length === 0">
            <option value="all">ทั้งหมด</option>
            <option v-for="week in weeksInSelectedMonth" :key="week.value" :value="week.value">
              {{ week.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="dashboard">
        <div class="summary-cards">
          <div class="card card1">
            <div class="card-header">
              <div>
                <i class="bi bi-eye"></i>
                <div class="card-value">{{ analysisData.totalRecords }}</div>
                <div class="card-title">จำนวนงานทั้งหมด</div>
                <div style="height: 19.2px;"></div>
              </div>
            </div>
          </div>

          <div class="card card2">
            <div class="card-header">
              <div>
                <i class="bi bi-check2"></i>
                <div class="card-value">{{ getPatternCount('1,2,3,4') }}</div>
                <div class="card-title">เสร็จสมบูรณ์ (1→2→3→4)</div>
                <div class="card-subtitle">{{ getPatternPercentage('1,2,3,4') }}%</div>
              </div>
            </div>
          </div>

          <div class="card card3">
            <div class="card-header">
              <div>
                <i class="bi bi-alarm"></i>
                <div class="card-value">{{ formatTime(avgTimes?.total) }}</div>
                <div class="card-title">เวลาเฉลี่ย (2→4)</div>
                <div style="height: 19.2px;"></div>
              </div>
            </div>
          </div>

          <div class="card card4">
            <div class="card-header">
              <div>
                <i class="bi bi-x-circle"></i>
                <div class="card-value">{{ analysisData.totalRecords - getPatternCount('1,2,3,4') }}</div>
                <div class="card-title">ไม่สมบูรณ์</div>
                <div class="card-subtitle">
                  {{ ((analysisData.totalRecords - getPatternCount('1,2,3,4')) / analysisData.totalRecords *
                    100).toFixed(1)
                  }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="time-analysis" v-if="avgTimes">
          <div class="chart-title">เวลาเฉลี่ยในแต่ละขั้นตอน</div>
          <div class="time-cards">
            <div class="time-card blue">
              <div class="time-card-header">
                <span class="time-card-icon"><i class="bi bi-clock"></i></span>
                <span class="time-card-title">Step 1 → 2</span>
              </div>
              <div class="time-card-value">{{ formatTime(avgTimes.step1to2) }}</div>
              <div class="time-card-subtitle">create_pre → modify_auto</div>
            </div>

            <div class="time-card green">
              <div class="time-card-header">
                <span class="time-card-icon"><i class="bi bi-clock"></i></span>
                <span class="time-card-title">Step 2 → 3</span>
              </div>
              <div class="time-card-value">{{ formatTime(avgTimes.step2to3) }}</div>
              <div class="time-card-subtitle">modify_auto → AUTO</div>
            </div>

            <div class="time-card yellow">
              <div class="time-card-header">
                <span class="time-card-icon"><i class="bi bi-clock"></i></span>
                <span class="time-card-title">Step 3 → 4</span>
              </div>
              <div class="time-card-value">{{ formatTime(avgTimes.step3to4) }}</div>
              <div class="time-card-subtitle">AUTO → PRE</div>
            </div>

            <div class="time-card purple">
              <div class="time-card-header">
                <span class="time-card-icon"><i class="bi bi-clock"></i></span>
                <span class="time-card-title">Total (2 → 4)</span>
              </div>
              <div class="time-card-value">{{ formatTime(avgTimes.total) }}</div>
              <div class="time-card-subtitle">modify_auto → PRE duration</div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No data available ( Don't have step 2 and 4)</p>
        </div>

        <div class="table-container">
          <div class="table-header">
            <div class="table-title">Detailed Pattern Analysis</div>
          </div>
          <div class="table-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Description</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in patternData" :key="index" @click="filterByPattern(item.pattern)"
                  :class="{ 'active-row': selectedPattern === item.pattern }" style="cursor: pointer;">
                  <td><strong>{{ item.pattern }}</strong></td>
                  <td>{{ item.label }}</td>
                  <td>{{ item.count }}</td>
                  <td>
                    <div class="progress-container">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: item.percentage + '%' }"></div>
                      </div>
                      {{ item.percentage }}%
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-container">
          <div class="table-header">
            <div class="table-title">Detailed Duration Analysis
              <select id="line" v-model="selectedLine" class="table-select">
                <option value="">All</option>
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
          </div>
          <div class="table-body">
            <table class="table">
              <thead>
                <tr>
                  <th @click="sortBy('unique_tray_id')" class="sortable">
                    Tray ID_เวลาสร้างฟอร์ม
                    <span v-if="sortKey === 'unique_tray_id'" class="sort-icon">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th @click="sortBy('product_order')" class="sortable">
                    Product Order
                    <span v-if="sortKey === 'product_order'" class="sort-icon">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th @click="sortBy('step1to2')" class="sortable">
                    Duration (1→2)
                    <span v-if="sortKey === 'step1to2'" class="sort-icon">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th @click="sortBy('step2to3')" class="sortable">
                    Duration (2→3)
                    <span v-if="sortKey === 'step2to3'" class="sort-icon">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th @click="sortBy('step3to4')" class="sortable">
                    Duration (3→4)
                    <span v-if="sortKey === 'step3to4'" class="sort-icon">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th @click="sortBy('totalDuration')" class="sortable">
                    Duration (2→4)
                    <span v-if="sortKey === 'totalDuration'" class="sort-icon">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in pagedRows" :key="index"
                  @click="showTaskDetails(item.task_ids[0], item.unique_tray_id)" style="cursor: pointer;">
                  <td>{{ item.unique_tray_id }}</td>
                  <td>{{ item.product_order }}</td>
                  <td>{{ formatTime(item.step1to2) }}</td>
                  <td>{{ formatTime(item.step2to3) }}</td>
                  <td>{{ formatTime(item.step3to4) }}</td>
                  <td>{{ formatTime(item.totalDuration) }}</td>
                </tr>
              </tbody>
            </table>

          </div>
          <div v-if="totalPages > 1" class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="scanner-modal" @click="closeModal">
      <div class="scanner-container" @click.stop>
        <div class="scanner-header">
          <h3>Tray & Task History</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <div v-if="loadingTaskDetail" class="loading">
          Loading details...
        </div>

        <div v-else-if="taskDetail" class="form">
          <div class="form-group">
            <span>Production Order</span>
            <p>{{ taskDetail.product_order }}</p>
          </div>
          <div class="form-group">
            <div class="history-log">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in selectedTrayHistory" :key="log.timestamp + log.location">
                    <td>{{ translateLocation(log.location) }}</td>
                    <td>{{ log.timestamp }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class="error-message">
          Failed to load task details.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useMyVar } from '../myVar';

const rawData = ref([]);
const store = useMyVar();
const selectedMonth = ref('all');
const availableMonths = ref([]);
const sortKey = ref('timestamp');
const sortOrder = ref('desc');
const pageSize = 8;
const currentPage = ref(1);
const selectedWeek = ref('all');
const availableWeeks = ref([]);
const selectedPattern = ref('all');
const selectedLine = ref(store.line || '');

const showModal = ref(false);
const loadingTaskDetail = ref(false);
const taskDetail = ref(null);
const selectedTrayHistory = ref([]);

const WORKING_HOURS = {
  normalStart: 8,    // 08:00
  normalEnd: 17,     // 17:00
  otEnd: 21,         // 21:00 (เมื่อมี OT)
  otThreshold: 17    // 18:00 (เกินเวลานี้ถือว่ามี OT)
};


onMounted(async () => {
  try {
    const res = await axios.get(`${__API_BASE_URL__}/table_delivery_time`);
    rawData.value = Array.isArray(res.data) ? res.data : [];

    generateAvailableMonths();
    generateAvailableWeeks();
  } catch (e) {
    console.error(e);
  }
});

const patternDescriptions = {
  '1,2,3,4': 'Complete Process',
  '1,2,3': 'Missing Check in at PRE',
  '1,2,4': 'Missing Check Out at Auto',
  '1,3,4': 'Missing Modify Auto Form',
  '1,2': 'Stop at Auto Form',
  '1,3': 'Missing Modift Form at Auto & Moissing Check in PRE',
  '1,4': 'Missing Modify Form at Auto & Missing Check Out Auto',
  '1': 'Waiting to Automate (รอ AUTO)',
  '2,3,4': 'Missing create_pre (ขาด create_pre)',
  '2,3': 'modify_auto to AUTO only',
  '2,4': 'modify_auto to PRE only',
  '3,4': 'AUTO to PRE only'
};

// Add this function to handle row clicks
function filterByPattern(pattern) {
  // Toggle behavior: if the user clicks the currently active pattern, reset the filter.
  if (selectedPattern.value === pattern) {
    selectedPattern.value = 'all';
  } else {
    selectedPattern.value = pattern;
  }
  currentPage.value = 1; // Reset to the first page when filter changes
}

// Replace your old showTaskDetails and closeModal functions with these

function showTaskDetails(taskId, uniqueTrayId) {
  loadingTaskDetail.value = true;
  showModal.value = true;
  taskDetail.value = null;
  selectedTrayHistory.value = [];

  // หา record ของ task นี้
  const taskInfo = rawData.value.find(row => row.task_id === taskId);

  if (taskInfo) {
    taskDetail.value = {
      task_id: taskInfo.task_id,
      product_order: taskInfo.product_order,
      timestamp: taskInfo.timestamp,
      unique_tray_id: taskInfo.unique_tray_id
    };
  } else {
    taskDetail.value = { task_id: taskId, product_order: 'N/A' };
  }

  // หาประวัติของ unique_tray_id นี้เท่านั้น (= 1 complete process flow)
  const history = rawData.value
    .filter(row => row.unique_tray_id === uniqueTrayId)
    .sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));

  selectedTrayHistory.value = history;
  loadingTaskDetail.value = false;
}

function translateLocation(location) {
  if (!location) return 'N/A';
  if (location === 'create_pre') return 'สร้างฟอร์ม';
  if (location === 'modify_auto') return 'แก้ไขฟอร์ม';
  if (location.startsWith('AUTO')) return 'Check out AUTO';
  if (location.startsWith('PRE')) return 'Check in PRE';
  return location;
}

function closeModal() {
  showModal.value = false;
}

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Fix: Change analysisDataUpdated to analysisData
const analysisData = computed(() => {
  const filteredData = getFilteredData();
  if (!filteredData || filteredData.length === 0) {
    return { patterns: {}, timeDurations: [], totalRecords: 0 };
  }

  // จัดกลุ่มตาม product_order + unique_tray_id = 1 complete process flow
  const processGroups = {};

  filteredData.forEach(row => {
    // แต่ละ product_order + unique_tray_id = process flow เดียว
    const groupKey = `${row.product_order}_${row.unique_tray_id}`;
    
    if (!processGroups[groupKey]) {
      processGroups[groupKey] = {
        product_order: row.product_order,
        unique_tray_id: row.unique_tray_id,
        tray_id: row.tray_id,
        records: []
      };
    }
    processGroups[groupKey].records.push(row);
  });

  const patterns = {};
  const timeDurations = [];

  Object.values(processGroups).forEach(group => {
    const { product_order, unique_tray_id, tray_id, records } = group;

    // เรียงตามเวลา
    records.sort((a, b) => {
      const timeA = parseTimestamp(a.timestamp);
      const timeB = parseTimestamp(b.timestamp);
      return timeA - timeB;
    });

    const stepsPresent = new Set();
    const stepTimestamps = {};
    const taskIds = new Set();
    const allTimestamps = [];

    records.forEach(row => {
      if (row.task_id) taskIds.add(row.task_id);
      
      const step = getStepFromLocation(row.location);
      if (step) {
        stepsPresent.add(step);
        const timestamp = parseTimestamp(row.timestamp);
        if (timestamp) {
          allTimestamps.push(timestamp);
          if (!stepTimestamps[step]) {
            stepTimestamps[step] = [];
          }
          stepTimestamps[step].push(timestamp);
        }
      }
    });

    // เรียง timestamps ในแต่ละ step
    Object.keys(stepTimestamps).forEach(step => {
      stepTimestamps[step].sort((a, b) => a - b);
    });

    const sortedSteps = Array.from(stepsPresent).sort();
    const patternKey = sortedSteps.join(',');

    if (!patterns[patternKey]) {
      patterns[patternKey] = { count: 0, percentage: 0 };
    }
    patterns[patternKey].count++;

    // สร้าง duration data สำหรับแต่ละ process flow
    const durationData = {
      unique_tray_id: unique_tray_id,
      display_tray_id: tray_id,
      product_order: product_order,
      timestamp: records[0].timestamp,
      task_ids: Array.from(taskIds),
      pattern: patternKey,
      totalDuration: null,
      step1to2: null,
      step2to3: null,
      step3to4: null
    };

    // คำนวณ duration แต่ละขั้นตอน
    if (stepTimestamps['1'] && stepTimestamps['2']) {
      const step1Time = stepTimestamps['1'][stepTimestamps['1'].length - 1];
      const step2Time = stepTimestamps['2'][0];
      durationData.step1to2 = calculateWorkingHoursWithOT(step1Time, step2Time, allTimestamps);
    }
    if (stepTimestamps['2'] && stepTimestamps['3']) {
      const step2Time = stepTimestamps['2'][stepTimestamps['2'].length - 1];
      const step3Time = stepTimestamps['3'][0];
      durationData.step2to3 = calculateWorkingHoursWithOT(step2Time, step3Time, allTimestamps);
    }
    if (stepTimestamps['3'] && stepTimestamps['4']) {
      const step3Time = stepTimestamps['3'][stepTimestamps['3'].length - 1];
      const step4Time = stepTimestamps['4'][0];
      durationData.step3to4 = calculateWorkingHoursWithOT(step3Time, step4Time, allTimestamps);
    }

    // Total Duration (2→4)
    if (stepTimestamps['2'] && stepTimestamps['4']) {
      const step2Time = stepTimestamps['2'][0];
      const step4Time = stepTimestamps['4'][stepTimestamps['4'].length - 1];
      durationData.totalDuration = calculateWorkingHoursWithOT(step2Time, step4Time, allTimestamps);
    }

    timeDurations.push(durationData);
  });

  const totalRecords = Object.keys(processGroups).length;
  Object.keys(patterns).forEach(key => {
    patterns[key].percentage = (patterns[key].count / totalRecords * 100).toFixed(1);
  });

  return { patterns, timeDurations, totalRecords };
});



const filteredAndSortedRows = computed(() => {
  let result = [...analysisData.value.timeDurations];

  // 1) Filter by selected pattern (affects only the table)
  if (selectedPattern.value !== 'all') {
    result = result.filter(row => row.pattern === selectedPattern.value);
  }

  // 2) Filter by selected line
  if (selectedLine.value) {
    // Use month/week filtered raw data to find trays that include this line
    const monthWeekFiltered = getFilteredData();
    const traysWithSelectedLine = new Set(
      monthWeekFiltered
        .filter(r => (r.location || '').startsWith(selectedLine.value))
        .map(r => r.unique_tray_id)
    );

    result = result.filter(row => traysWithSelectedLine.has(row.unique_tray_id));
  }

  if (sortKey.value === 'timestamp') {
    result.sort((a, b) => {
      const aValue = parseTimestampForSort(a[sortKey.value])
      const bValue = parseTimestampForSort(b[sortKey.value])

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  } else {
    result.sort((a, b) => {
      const aValue = a[sortKey.value]
      const bValue = b[sortKey.value]

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredAndSortedRows.value.length / pageSize))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAndSortedRows.value.slice(start, start + pageSize)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const hasOvertimeOnDate = (date, allTimestamps) => {
  const dateStr = date.toDateString();

  // หา timestamps ทั้งหมดในวันนั้น
  const dayTimestamps = allTimestamps.filter(timestamp => {
    return timestamp && timestamp.toDateString() === dateStr;
  });

  // ตรวจสอบว่ามี timestamp ใดเกิน 18:00 หรือไม่
  return dayTimestamps.some(timestamp => {
    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();
    const totalMinutes = hour * 60 + minute;
    const otThresholdMinutes = WORKING_HOURS.otThreshold * 60; // 18:00 = 1080 นาที

    return totalMinutes >= otThresholdMinutes; // เปลี่ยนจาก > เป็น >=
  });
};

const getWorkingEndTime = (date, allTimestamps) => {
  const hasOT = hasOvertimeOnDate(date, allTimestamps);
  return hasOT ? WORKING_HOURS.otEnd : WORKING_HOURS.normalEnd;
};

// ฟังก์ชันคำนวณเวลาทำงานในวันเดียว
const calculateSingleDayWorkingHours = (dayStart, dayEnd, workingEndTime) => {
  const startHour = dayStart.getHours() + dayStart.getMinutes() / 60;
  const endHour = dayEnd.getHours() + dayEnd.getMinutes() / 60;

  // หาช่วงเวลาที่ทับซ้อนกับเวลาทำงาน
  const workingStartHour = Math.max(startHour, WORKING_HOURS.normalStart);
  const workingEndHour = Math.min(endHour, workingEndTime);

  if (workingStartHour >= workingEndHour) {
    return 0; // ไม่มีเวลาทำงานในช่วงนี้
  }

  const workingHours = workingEndHour - workingStartHour;
  return Math.max(0, workingHours * 60); // แปลงเป็นนาที
};

const calculateWorkingHoursWithOT = (startTime, endTime, allTimestampsInRange) => {
  if (!startTime || !endTime) return null;
  if (endTime <= startTime) return 0;

  const isSameDay = startTime.toDateString() === endTime.toDateString();

  if (isSameDay) {
    // กรณีเดียวกัน - ใช้วันเริ่มต้นในการตรวจสอบ OT
    const workingEndTime = getWorkingEndTime(startTime, allTimestampsInRange);
    return calculateSingleDayWorkingHours(startTime, endTime, workingEndTime);
  }

  // กรณีข้ามวัน
  let totalWorkingMinutes = 0;
  let currentDate = new Date(startTime);
  const endDate = new Date(endTime);

  while (currentDate.toDateString() !== endDate.toDateString()) {
    const dayOfWeek = currentDate.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 6) { // จันทร์-เสาร์
      const workingEndTime = getWorkingEndTime(currentDate, allTimestampsInRange);

      // สำหรับวันแรก: ใช้เวลาจริงที่เริ่มต้น
      const dayStart = currentDate.toDateString() === startTime.toDateString()
        ? new Date(startTime)
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), WORKING_HOURS.normalStart, 0, 0, 0);

      const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), workingEndTime, 0, 0, 0);

      totalWorkingMinutes += calculateSingleDayWorkingHours(dayStart, dayEnd, workingEndTime);
    }

    // ไปวันถัดไป
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเป็น 00:00
  }

  // วันสุดท้าย: คำนวณจาก 08:00 จนถึง endTime จริง
  const finalDayOfWeek = endDate.getDay();
  if (finalDayOfWeek >= 1 && finalDayOfWeek <= 6) {
    const workingEndTime = getWorkingEndTime(endDate, allTimestampsInRange);

    const finalDayStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), WORKING_HOURS.normalStart, 0, 0, 0);
    const finalDayEnd = new Date(endTime);

    totalWorkingMinutes += calculateSingleDayWorkingHours(finalDayStart, finalDayEnd, workingEndTime);
  }

  return totalWorkingMinutes;
};


const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;
  try {
    const [datePart, timePart] = timestamp.split(' ');
    const [day, month, year] = datePart.split('/');
    const fullYear = `20${year}`;
    return new Date(`${fullYear}-${month}-${day} ${timePart}`);
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error);
    return null;
  }
};

const parseTimestampForSort = (timestamp) => {
  if (!timestamp) return null;
  try {
    const [datePart, timePart] = timestamp.split(' ');
    const [day, month, year] = datePart.split('/');
    const fullYear = `20${year}`;
    return `${fullYear}-${month}-${day} ${timePart}`;
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error);
    return null;
  }
};

const getWeekNumber = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffInTime = date - startOfYear + (startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
  return Math.floor((diffInDays + startOfYear.getDay()) / 7) + 1;
};

const getFirstDayOfWeek = (year, weekNumber) => {
  const startOfYear = new Date(year, 0, 1);
  const startOfYearDay = startOfYear.getDay();
  const daysToFirstWeek = (weekNumber - 1) * 7 - startOfYearDay;
  return new Date(year, 0, 1 + daysToFirstWeek);
};

const generateAvailableMonths = () => {
  const monthSet = new Set();

  rawData.value.forEach(row => {
    const timestamp = parseTimestamp(row.timestamp);
    if (timestamp) {
      const monthKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(monthKey);
    }
  });

  availableMonths.value = Array.from(monthSet).sort().map(monthKey => {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'สิงหาคม', 'กันยายน', 'October', 'November', 'December'
    ];
    return {
      value: monthKey,
      label: `${monthNames[parseInt(month) - 1]} ${year}`
    };
  });
};

const generateAvailableWeeks = () => {
  const weekMap = new Map();

  rawData.value.forEach(row => {
    const timestamp = parseTimestamp(row.timestamp);
    if (timestamp) {
      const year = timestamp.getFullYear();
      const weekNumber = getWeekNumber(timestamp);
      const monthKey = `${year}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;

      if (!weekMap.has(weekKey)) {
        const firstDayOfWeek = getFirstDayOfWeek(year, weekNumber);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

        weekMap.set(weekKey, {
          value: weekKey,
          weekNumber: weekNumber,
          monthKey: monthKey,
          startDate: firstDayOfWeek,
          endDate: lastDayOfWeek,
          label: `Week ${weekNumber} (${firstDayOfWeek.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} - ${lastDayOfWeek.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })})`
        });
      }
    }
  });
  availableWeeks.value = Array.from(weekMap.values()).sort((a, b) => a.weekNumber - b.weekNumber);
};

const weeksInSelectedMonth = computed(() => {
  if (selectedMonth.value === 'all') {
    return availableWeeks.value;
  }

  return availableWeeks.value.filter(week => {
    // Check if week overlaps with selected month
    if (selectedMonth.value === 'all') return true;

    const [selectedYear, selectedMonthNum] = selectedMonth.value.split('-');
    const selectedMonthStart = new Date(parseInt(selectedYear), parseInt(selectedMonthNum) - 1, 1);
    const selectedMonthEnd = new Date(parseInt(selectedYear), parseInt(selectedMonthNum), 0);

    // Check if week overlaps with the selected month
    return (week.startDate <= selectedMonthEnd && week.endDate >= selectedMonthStart);
  });
});

const onMonthChange = () => {
  selectedWeek.value = 'all';
  currentPage.value = 1;
};

const getStepFromLocation = (location) => {
  if (!location) return null;

  if (location === 'create_pre') return '1';
  if (location === 'modify_auto') return '2';
  if (location.startsWith('AUTO')) return '3';
  if (location.startsWith('PRE')) return '4';

  return null;
};

const getFilteredData = () => {
  let filteredData = rawData.value;

  if (selectedMonth.value !== 'all') {
    filteredData = filteredData.filter(row => {
      const timestamp = parseTimestamp(row.timestamp);
      if (!timestamp) return false;

      const monthKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth.value;
    });
  }

  if (selectedWeek.value !== 'all') {
    const selectedWeekData = availableWeeks.value.find(week => week.value === selectedWeek.value);
    if (selectedWeekData) {
      filteredData = filteredData.filter(row => {
        const timestamp = parseTimestamp(row.timestamp);
        if (!timestamp) return false;

        return timestamp >= selectedWeekData.startDate && timestamp <= selectedWeekData.endDate;
      });
    }
  }

  return filteredData;
};

const patternData = computed(() => {
  return Object.entries(analysisData.value.patterns)
    .map(([pattern, data]) => ({
      pattern: pattern || 'Empty',
      count: data.count,
      percentage: parseFloat(data.percentage),
      label: patternDescriptions[pattern] || `Pattern: ${pattern}`
    }))
    .sort((a, b) => b.count - a.count);
});

const avgTimes = computed(() => {
  const validDurations = analysisData.value.timeDurations.filter(d => d.totalDuration > 0);
  if (!validDurations.length) return null;

  const avgTotal = validDurations.reduce((sum, d) => sum + d.totalDuration, 0) / validDurations.length;

  const step1to2Durations = validDurations.filter(d => d.step1to2 !== null && d.step1to2 > 0);
  const avgStep1to2 = step1to2Durations.length > 0
    ? step1to2Durations.reduce((sum, d) => sum + d.step1to2, 0) / step1to2Durations.length
    : 'N/A';

  const step2to3Durations = validDurations.filter(d => d.step2to3 !== null && d.step2to3 > 0);
  const avgStep2to3 = step2to3Durations.length > 0
    ? step2to3Durations.reduce((sum, d) => sum + d.step2to3, 0) / step2to3Durations.length
    : 'N/A';

  const step3to4Durations = validDurations.filter(d => d.step3to4 !== null && d.step3to4 > 0);
  const avgStep3to4 = step3to4Durations.length > 0
    ? step3to4Durations.reduce((sum, d) => sum + d.step3to4, 0) / step3to4Durations.length
    : 'N/A';

  return {
    total: avgTotal,
    step1to2: avgStep1to2,
    step2to3: avgStep2to3,
    step3to4: avgStep3to4
  };
});

const formatTime = (minutes) => {
  if (minutes === 'N/A' || minutes === null || minutes === undefined) {
    return 'N/A';
  }

  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return 'N/A';
  }

  // ปัดทศนิยมให้แม่นยำ
  const roundedMinutes = Math.round(minutes * 100) / 100; // ปัด 2 ทศนิยม

  if (roundedMinutes < 1) {
    const seconds = Math.round(roundedMinutes * 60);
    return `${seconds}secs`;
  }
  else if (roundedMinutes < 60) {
    return `${Math.round(roundedMinutes * 100) / 100}นาที`;
  }
  else {
    const hours = Math.floor(roundedMinutes / 60);
    const remainingMinutes = Math.round((roundedMinutes % 60) * 100) / 100;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}นาที`;
    }
  }
};

const getPatternCount = pattern => analysisData.value.patterns[pattern]?.count || 0;
const getPatternPercentage = pattern => analysisData.value.patterns[pattern]?.percentage || 0;


</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

:deep(.main) {
  margin: 0 !important;
}

.dashboard {
  width: 100%;
  margin: 0 auto;
  padding: 1rem 3rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
}

@media (max-width: 768px) {
  .dashboard {
    width: 100%;
    margin: 0 auto;
    padding: 1rem 3rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .summary-cards,
  .time-cards {
    grid-template-columns: repeat(auto-fit, minmax(clamp(150px, 30vw, 200px), 1fr));
  }

  .card-subtitle {
    display: none !important;
  }
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  flex-direction: column;
}

.header label {
  font-size: 3.5rem;
  color: #2c3e50;
}

.group-select {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.group-select label {
  align-self: flex-start;
  margin-bottom: 10px;
  line-height: 1;
}


select {
  align-self: stretch;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #eeeeee;
  box-shadow: inset 4px 4px 6px #dcdee0, inset -4px -4px 6px #f0f5fa;
  width: fit-content;
  justify-content: center;
  margin: auto;
  font-size: 1rem;
}

.table-select {
  justify-self: end;
  margin-right: 1rem;
}

.summary-cards {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  border: none;
  border-radius: 16px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card {
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 220px;
  align-items: center;
}

.card.card1 {
  background-color: #ADCFF1;
}

.card.card2 {
  background-color: #C7E299;
}

.card.card3 {
  background-color: #FFE495;
}

.card.card4 {
  background-color: #FCC2CC;
}

.card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}

.card-title {
  font-size: 0.9rem;
  color: #2c3e50;
  display: flex;
  text-align: center;
  justify-content: center;
}

.card-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  justify-content: center;
  white-space: nowrap;
  margin-top: 1rem;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #7f8c8d;
  display: flex;
  justify-content: center;
}

.card i {
  font-size: 2rem;
  display: flex;
  justify-content: center;
  color: #2c3e50;
}

.time-analysis {
  border: none;
  border-radius: 16px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  align-items: center;
  height: auto;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

.time-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  border: none;
  border-radius: 16px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.time-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

.time-card.blue {
  border-left-color: #3498db;
}

.time-card.green {
  border-left-color: #2ecc71;
}

.time-card.purple {
  border-left-color: #9b59b6;
}

.time-card.yellow {
  border-left-color: #f1c40f;
}

.time-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.time-card-icon {
  font-size: 1.2rem;
  color: #2c3e50;
}

.time-card-title {
  font-weight: 600;
  color: #333;
}

.time-card-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.time-card-subtitle {
  font-size: 0.8rem;
  color: #666;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 629px;
}

.table-header {
  background: #34495e;
  color: white;
  padding: 20px;
}

.table-title {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-body {
  overflow-y: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}


.table tbody tr.active-row {
  background-color: #d0e7ff;
  /* A light blue to indicate selection */
  font-weight: bold;
}

.table th,
.table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.table th,
td {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table tr:hover {
  background: #f8f9fa;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.progress-container {
  display: flex;
  align-items: center;
}

.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
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

.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  /* Adds a nice frosted glass effect */
}

/* The main modal container/box */
.scanner-container {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 650px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Important for the header gradient */
}

/* Header section with a colorful gradient */
.scanner-header {
  background: linear-gradient(135deg, #34495e, #2c3e50);
  color: #fff;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scanner-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #fff;
}

/* --- Content Styles --- */
.form {
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group span {
  font-weight: 700;
  font-size: 0.9rem;
  color: #2c3e50;
  /* Blue accent for labels */
  display: block;
  margin-bottom: 6px;
}

.form-group p {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

/* --- Colorful History Table --- */
.history-log table {
  width: 100%;
  border-collapse: collapse;
}

.history-log th {
  background-color: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-size: 0.85rem;
  color: #6c757d;
  border-bottom: 2px solid #e9ecef;
}

.history-log td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f5;
}

/* Zebra-striping for readability */
.history-log tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* --- Location Status Badges --- */
</style>