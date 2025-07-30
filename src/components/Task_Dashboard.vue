<template>
  <div class="task-dashboard">
    <div class="header">
      <div class="group-select">
        <label>Select Month</label>
        <select id="month-select" v-model="selectedMonth" @change="onMonthChange">
          <option value="all">All</option>
          <option v-for="month in availableMonths" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
      </div>

      <div class="group-select">
        <label>Select Week</label>
        <select id="week-select" v-model="selectedWeek" :disabled="weeksInSelectedMonth.length === 0">
          <option value="all">All</option>
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
              <div class="card-title">Total Records</div>
              <div style="height: 19.2px;"></div>
            </div>
          </div>
        </div>

        <div class="card card2">
          <div class="card-header">
            <div>
              <i class="bi bi-check2"></i>
              <div class="card-value">{{ getPatternCount('1,2,3,4') }}</div>
              <div class="card-title">Complete Process (1→2→3→4)</div>
              <div class="card-subtitle">{{ getPatternPercentage('1,2,3,4') }}%</div>
            </div>
          </div>
        </div>

        <div class="card card3">
          <div class="card-header">
            <div>
              <i class="bi bi-alarm"></i>
              <div class="card-value">{{ formatTime(avgTimes?.total) }}</div>
              <div class="card-title">Avg Total Time (2→4)</div>
              <div style="height: 19.2px;"></div>
            </div>
          </div>
        </div>

        <div class="card card4">
          <div class="card-header">
            <div>
              <i class="bi bi-x-circle"></i>
              <div class="card-value">{{ analysisData.totalRecords - getPatternCount('1,2,3,4') }}</div>
              <div class="card-title">Incomplete Records</div>
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
        <div class="chart-title">Average Processing Time Analysis</div>
        <div class="time-cards">
          <div class="time-card blue">
            <div class="time-card-header">
              <span class="time-card-icon"><i class="bi bi-clock"></i></span>
              <span class="time-card-title">Step 1 → 2</span>
            </div>
            <div class="time-card-value">{{ formatTime(avgTimes.step1to2) }}</div>
            <div class="time-card-subtitle">create_pre → AUTO</div>
          </div>

          <div class="time-card green">
            <div class="time-card-header">
              <span class="time-card-icon"><i class="bi bi-clock"></i></span>
              <span class="time-card-title">Step 2 → 3</span>
            </div>
            <div class="time-card-value">{{ formatTime(avgTimes.step2to3) }}</div>
            <div class="time-card-subtitle">AUTO → modify_auto</div>
          </div>

          <div class="time-card yellow">
            <div class="time-card-header">
              <span class="time-card-icon"><i class="bi bi-clock"></i></span>
              <span class="time-card-title">Step 3 → 4</span>
            </div>
            <div class="time-card-value">{{ formatTime(avgTimes.step3to4) }}</div>
            <div class="time-card-subtitle">modify_auto → PRE</div>
          </div>

          <div class="time-card purple">
            <div class="time-card-header">
              <span class="time-card-icon"><i class="bi bi-clock"></i></span>
              <span class="time-card-title">Total (2 → 4)</span>
            </div>
            <div class="time-card-value">{{ formatTime(avgTimes.total) }}</div>
            <div class="time-card-subtitle">AUTO → PRE duration</div>
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
              <tr v-for="(item, index) in patternData" :key="index">
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
          <div class="table-title">Detailed Duration Analysis</div>
        </div>
        <div class="table-body">
          <table class="table">
            <thead>
              <tr>
                <th @click="sortBy('unique_tray_id')" class="sortable">
                  Tray ID
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
              <tr v-for="(item, index) in pagedRows" :key="index">
                <td>{{ item.unique_tray_id }}</td>
                <td>{{ item.product_order }}</td>
                <td>{{ formatTime(item.step1to2) }}</td>
                <td>{{ formatTime(item.step2to3) }}</td>
                <td>{{ formatTime(item.step3to4) }}</td>
                <td>{{ formatTime(item.totalDuration) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="totalPages > 1" class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const rawData = ref([]);
const chartInstance = ref(null);
const selectedMonth = ref('all');
const availableMonths = ref([]);
const sortKey = ref('totalDuration');
const sortOrder = ref('desc');
const pageSize = 8;
const currentPage = ref(1);
const selectedWeek = ref('all');
const availableWeeks = ref([]);

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
  '1,2,3,4': 'Complete Process (ครบทุก step)',
  '1,2,3': 'Missing Final Step (ขาด PRE)',
  '1,2,4': 'Missing Modify Step (ขาด modify_auto)',
  '1,3,4': 'Missing AUTO Step (ขาด AUTO)',
  '1,2': 'Stopped at AUTO (หยุดที่ AUTO)',
  '1,3': 'Missing AUTO & PRE (ขาด AUTO,PRE)',
  '1,4': 'Only Start & End (มีแค่ create_pre,PRE)',
  '1': 'Only Initial Step (มีแค่ create_pre)',
  '2,3,4': 'Missing create_pre (ขาด create_pre)',
  '2,3': 'AUTO to modify_auto only',
  '2,4': 'AUTO to PRE only',
  '3,4': 'modify_auto to PRE only'
};

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const filteredAndSortedRows = computed(() => {
  let result = [...analysisData.value.timeDurations]
  if (sortKey.value) {
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
      'July', 'August', 'September', 'October', 'November', 'December'
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
  if (location.startsWith('AUTO')) return '2';
  if (location === 'modify_auto') return '3';
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

const analysisData = computed(() => {
  const filteredData = getFilteredData();
  if (!filteredData || filteredData.length === 0) {
    return { patterns: {}, timeDurations: [], totalRecords: 0 };
  }

  const trayGroups = {};
  const displayTrayIds = {};
  const trayProductOrders = {};
  const productOrders = {};

  filteredData.forEach(row => {
    const trayId = row.unique_tray_id;

    if (!trayGroups[trayId]) {
      trayGroups[trayId] = [];
    }
    trayGroups[trayId].push(row);

    if (!displayTrayIds[trayId]) {
      displayTrayIds[trayId] = row.tray_id;
    }
    if (!productOrders[row.product_order]) {
      productOrders[row.product_order] = row.product_order;
    }
  });

  const patterns = {};
  const timeDurations = [];

  Object.keys(trayGroups).forEach(trayId => {
    const trayData = trayGroups[trayId];

    trayData.sort((a, b) => {
      const timeA = parseTimestamp(a.timestamp);
      const timeB = parseTimestamp(b.timestamp);
      return timeA - timeB;
    });

    const stepsPresent = new Set();
    const stepTimestamps = {};
    const taskIds = new Set();

    trayData.forEach(row => {
      if (row.task_id) {
        taskIds.add(row.task_id);
      }

      const step = getStepFromLocation(row.location);
      if (step) {
        stepsPresent.add(step);
        const timestamp = parseTimestamp(row.timestamp);

        if (!stepTimestamps[step]) {
          stepTimestamps[step] = [];
        }
        stepTimestamps[step].push(timestamp);
      }
    });

    Object.keys(stepTimestamps).forEach(step => {
      stepTimestamps[step].sort((a, b) => a - b);
    });

    const sortedSteps = Array.from(stepsPresent).sort();
    const patternKey = sortedSteps.join(',');

    if (!patterns[patternKey]) {
      patterns[patternKey] = { count: 0, percentage: 0 };
    }
    patterns[patternKey].count++;

    if (stepTimestamps['2'] && stepTimestamps['4']) {
      const step2Time = stepTimestamps['2'][0];
      const step4Time = stepTimestamps['4'][stepTimestamps['4'].length - 1];
      const totalDuration = (step4Time - step2Time) / 1000 / 60;


      const durationData = {
        unique_tray_id: trayId,
        display_tray_id: displayTrayIds[trayId],
        product_order: productOrders[trayData[0].product_order],
        task_ids: taskIds.size > 0 ? Array.from(taskIds) : [],
        totalDuration: totalDuration,
        step1to2: null,
        step2to3: null,
        step3to4: null
      };
      if (stepTimestamps['1'] && stepTimestamps['2']) {
        durationData.step1to2 = (stepTimestamps['2'][0] - stepTimestamps['1'][stepTimestamps['1'].length - 1]) / 1000 / 60;
      }
      if (stepTimestamps['2'] && stepTimestamps['3']) {
        durationData.step2to3 = (stepTimestamps['3'][0] - stepTimestamps['2'][stepTimestamps['2'].length - 1]) / 1000 / 60;
      }
      if (stepTimestamps['3'] && stepTimestamps['4']) {
        durationData.step3to4 = (stepTimestamps['4'][0] - stepTimestamps['3'][stepTimestamps['3'].length - 1]) / 1000 / 60;
      }

      timeDurations.push(durationData);
    }
  });

  const totalRecords = Object.keys(trayGroups).length;
  Object.keys(patterns).forEach(key => {
    patterns[key].percentage = (patterns[key].count / totalRecords * 100).toFixed(1);
  });

  return { patterns, timeDurations, totalRecords };
});


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

const formatTime = (seconds) => {
  if (seconds === 'N/A') {
    return 'N/A';
  }

  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return 'N/A';
  }

  if (seconds < 60) {
    return `${seconds.toFixed(1)}mins`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}mins ${remainingSeconds.toFixed(1)}secs`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}mins ${remainingSeconds.toFixed(1)}secs`;
  }
};

const getPatternCount = pattern => analysisData.value.patterns[pattern]?.count || 0;
const getPatternPercentage = pattern => analysisData.value.patterns[pattern]?.percentage || 0;

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
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

  .summary-cards,.time-cards {
    grid-template-columns: repeat(auto-fit, minmax(clamp(150px, 30vw, 200px), 1fr));
  }

  .card-subtitle {
    display :none !important;
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
  width: 50%;
  justify-content: center;
  margin: auto;
  font-size: 1rem;
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
  height: 180px;
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
}

.card-title {
  font-size: 0.9rem;
  color: #2c3e50;
  display: flex;
  text-align: center;
}

.card-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  justify-content: center;
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
}

.table-header {
  background: #34495e;
  color: white;
  padding: 20px;
}

.table-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.table-body {
  overflow-y: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.table th,
td {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table tr:hover {
  background: #f8f9fa;
}

.chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 1rem;
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
</style>
