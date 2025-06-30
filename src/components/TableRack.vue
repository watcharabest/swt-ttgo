<template>
  <div class="box view-box">
    <h2>{{ tableTitle }}</h2>
    <div class="form-group">
      <label for="viewTableSelect">Select Table to View</label>
      <select id="viewTableSelect" v-model="viewTable" class="table-select">
        <option value="table_rack">Rack Table </option>
        <option value="table_location">Location Table</option>
      </select>
    </div>

    <!-- Add search input -->
    <div class="search-box">
      <input type="text" v-model="searchQuery" placeholder="Search..." class="search-input" />
    </div>

    <div class="view-box">
      <div v-if="viewTable === 'table_location'" class="total-text">Total Rack : {{ totalCount }}</div>
      <table v-if="pagedRows.length">
        <!-- Header สำหรับ table_rack มีคอลัมน์ Image -->
        <thead v-if="viewTable === 'table_rack'">
          <tr>
            <th @click="sortBy('rack')" class="sortable">
              Rack
              <span v-if="sortKey === 'rack'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('product_order')" class="sortable">
              Product Order
              <span v-if="sortKey === 'product_order'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('qty')" class="sortable">
              Qty
              <span v-if="sortKey === 'qty'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('location')" class="sortable">
              Location
              <span v-if="sortKey === 'location'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('time_rack_po')" class="sortable">
              Time Rack PO
              <span v-if="sortKey === 'time_rack_po'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('time_rack_location')" class="sortable">
              Time Rack Location
              <span v-if="sortKey === 'time_rack_location'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('time_ago')" class="sortable">
              Time Ago
              <span v-if="sortKey === 'time_ago'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <!-- Header สำหรับ table_location ไม่มีคอลัมน์ Image -->
        <thead v-else>

          <tr>
            <th @click="sortBy('location')" class="sortable">
              Location
              <span v-if="sortKey === 'location'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('rack_count')" class="sortable">
              Rack Count
              <span v-if="sortKey === 'rack_count'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>

        <!-- Body สำหรับ table_rack แสดงรูป -->
        <tbody v-if="viewTable === 'table_rack'">
          <tr v-for="(row, i) in pagedRows" :key="i">
            <td>{{ row.rack || '-' }}</td>
            <td>{{ row.product_order || '-' }}</td>
            <td>{{ row.qty || '-' }}</td>
            <td>{{ row.location || '-' }}</td>
            <td>{{ row.time_rack_po || '-' }}</td>
            <td>{{ row.time_rack_location || '-' }}</td>
            <td>{{ timeAgo(row.time_rack_location) }}</td>
          </tr>
        </tbody>
        <!-- Body สำหรับ table_location -->
        <tbody v-else>
          <tr v-for="(row, i) in pagedRows" :key="i">
            <td>{{ row.location || '-' }}</td>
            <td>{{ row.rack_count || '0' }}</td>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'

import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/th'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.locale('en')

const viewTable = ref('table_rack')
const rows = ref([])
const groupRows = ref([])
const currentPage = ref(1)
const pageSize = 10
const searchQuery = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')

const tableTitle = computed(() =>
  viewTable.value === 'table_rack' ? 'Rack Table' : 'Location Table'
)

// Filter and sort the rows
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

  // Helper function to parse date string in format 'DD/MM/YY HH:mm' to timestamp
  const parseCustomDate = (dateStr) => {
    if (!dateStr) return 0;
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Create a date object with the parsed values (using 2000 + year for YY format)
    const fullYear = 2000 + year;
    return new Date(fullYear, month - 1, day, hours, minutes).getTime();
  };

  // Apply sorting
  if (sortKey.value) {
    result.sort((a, b) => {
      let aValue, bValue;
      
      // Special handling for time_ago column - use the original timestamp
      if (sortKey.value === 'time_ago') {
        aValue = a.time_rack_location ? parseCustomDate(a.time_rack_location) : 0;
        bValue = b.time_rack_location ? parseCustomDate(b.time_rack_location) : 0;
      } 
      // Handle other date/time fields
      else if (['time_rack_po', 'time_rack_location'].includes(sortKey.value)) {
        aValue = a[sortKey.value] ? parseCustomDate(a[sortKey.value]) : 0;
        bValue = b[sortKey.value] ? parseCustomDate(b[sortKey.value]) : 0;
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

// คำนวณหน้าทั้งหมด และข้อมูลที่จะแสดง
const totalPages = computed(() => Math.ceil(filteredAndSortedRows.value.length / pageSize))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAndSortedRows.value.slice(start, start + pageSize)
})

async function loadTable() {
  try {
    const res = await axios.get(`https://10.100.10.139:8000/${viewTable.value}`)

    if (viewTable.value === 'table_location') {
      rows.value = Array.isArray(res.data?.location_summary) ? res.data.location_summary : []
      groupRows.value = Array.isArray(res.data?.location_table) ? res.data.location_table : []
      totalCount.value = res.data?.total_rack ?? 0
    } else {
      rows.value = Array.isArray(res.data) ? res.data : []
      groupRows.value = []
      // Set totalCount to the length of the rows for table_rack view
      totalCount.value = rows.value.length
    }
    console.log('Loaded data:', { table: viewTable.value, rows: rows.value, total: totalCount.value })
    currentPage.value = 1
  } catch (err) {
    console.error('Error loading table data:', err)
    rows.value = []
    groupRows.value = []
    currentPage.value = 1
  }
}

const totalCount = computed(() => {
  if (viewTable.value === 'table_location') {
    // ใช้ข้อมูลที่กรองแล้วแทนข้อมูลดิบ
    return pagedRows.value.reduce((sum, item) => sum + (item.rack_count || 0), 0)
  } else {
    // สำหรับ table_rack ใช้จำนวนแถวที่กรองแล้ว
    return pagedRows.value.length
  }
})


// รีโหลดข้อมูลเมื่อเปลี่ยนตาราง
watch(viewTable, () => {
  loadTable()
})

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

function timeAgo(input) {
  if (!input) return 'N/A'
  const time = dayjs(input, 'YY/MM/DD HH:mm')
  return time.isValid() ? time.fromNow() : 'เวลาไม่ถูกต้อง'
}
</script>

<style>
.view-box {
  grid-area: view;
  border: none;
  border-radius: 16px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 2rem;


}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
}

.table-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #2c3e50;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.table-select:focus {
  outline: none;
  border-color: #8DBAED;
  box-shadow: 0 0 0 3px rgba(141, 186, 237, 0.2);
}

.search-box {
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.search-input {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}


.total-text {
  margin-left: 2.45rem;
  width: 100%;
  display: block;
  font-size: 1.25rem;
  color: #9e4e4e;
  margin-bottom: 1rem;
}


.search-input:focus {
  outline: none;
  border-color: #8DBAED;
  box-shadow: 0 0 0 3px rgba(141, 186, 237, 0.2);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

.image-cell {
  text-align: center;
}

.image-cell img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-cell img:hover {
  transform: scale(1.05);
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

@media (max-width: 480px) {

  .view-box {
    margin: 1rem;
    padding: 1.5rem;
    box-sizing: border-box;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
    overflow: hidden;
  }

  .search-box {
    padding: 0;
  }

  .search-input,
  .table-select {
    font-size: 16px;
    /* Prevent zoom on mobile */
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .pagination button {
    width: 100%;
    padding: 0.875rem;
  }

  /* Add responsive table styles */
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
  }

  th,
  td {
    min-width: 120px;
    padding: 0.75rem;
  }

  .image-cell {
    min-width: 100px;
  }

  .image-cell img {
    width: 40px;
    height: 40px;
  }

  /* Improve text readability on mobile */
  th,
  td {
    font-size: 0.9rem;
  }

  /* Add horizontal scroll indicator */
  .view-box {
    position: relative;
  }

  .view-box::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.95));
    pointer-events: none;
  }
}
</style>
