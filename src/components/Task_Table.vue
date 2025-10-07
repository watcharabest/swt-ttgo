<template>
  <div class="box view-box">
    <h2>{{ tableTitle }}</h2>
    <div class="form-group-header">
      <label for="viewTableSelect">Select Table to View</label>
      <select id="viewTableSelect" v-model="viewTable" class="table-select">
        <option value="table_task_order">Task Order</option>
        <option value="table_delivery_time">Delivery Time</option>
      </select>
    </div>

    <!-- Add search input -->
    <div class="search-box">
      <input type="text" v-model="searchQuery" placeholder="Search..." class="search-input" />
    </div>

    <div class="view-box">
      <table v-if="pagedRows.length">
        <!-- Header สำหรับ table01 มีคอลัมน์ Image -->
        <thead v-if="viewTable === 'table_task_order'">
          <tr>
            <th @click="sortBy('tag')" class="sortable">
              Tag
              <span v-if="sortKey === 'tag'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('product_order')" class="sortable">
              Product Order
              <span v-if="sortKey === 'product_order'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('material_no')" class="sortable">
              Material
              <span v-if="sortKey === 'material_no'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('material_des')" class="sortable">
              Material Description
              <span v-if="sortKey === 'material_des'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('surface')" class="sortable">
              Surface
              <span v-if="sortKey === 'surface'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('type')" class="sortable">
              Machine
              <span v-if="sortKey === 'type'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('rpm')" class="sortable">
              Cap.
              <span v-if="sortKey === 'rpm'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('amount')" class="sortable">
              จำนวน ( ก่อนส่ง )
              <span v-if="sortKey === 'amount'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('amount_auto')" class="sortable">
              จำนวน ( Auto)
              <span v-if="sortKey === 'amount_auto'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('amount_pre')" class="sortable">
              จำนวน ( หลังส่ง )
              <span v-if="sortKey === 'amount_pre'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('line')" class="sortable">
              Line
              <span v-if="sortKey === 'line'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('ps')" class="sortable">
              หมายเหตุ
              <span v-if="sortKey === 'ps'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <!-- Header สำหรับ table02 ไม่มีคอลัมน์ Image -->
        <thead v-else>
          <tr>
            <th @click="sortBy('product_order')" class="sortable">
              Product Order
              <span v-if="sortKey === 'product_order'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('task_id')" class="sortable">
              Task ID
              <span v-if="sortKey === 'task_id'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('tray_id')" class="sortable">
              Tray ID
              <span v-if="sortKey === 'tray_id'" class="sort-icon">
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
              Timestamp
              <span v-if="sortKey === 'timestamp'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>

        <!-- Body สำหรับ table01 แสดงรูป -->
        <tbody v-if="viewTable === 'table_task_order'">
          <tr v-for="(row, i) in pagedRows" :key="i" @click="showTaskDetail(row)" class="clickable-row">
            <td>{{ row.tag }}</td>
            <td>{{ row.product_order }}</td>
            <td>{{ row.material_no }}</td>
            <td>{{ row.material_des }}</td>
            <td>{{ row.surface }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.rpm }}</td>
            <td>{{ row.amount }}</td>
            <td>{{ row.amount_auto }}</td>
            <td>{{ row.amount_pre }}</td>
            <td>{{ row.line }}</td>
            <td>{{ row.ps }}</td>
          </tr>
        </tbody>
        <!-- Body สำหรับ table02 -->
        <tbody v-else>
          <tr v-for="(row, i) in pagedRows" :key="i" @click="showTaskDetail(row)" class="clickable-row">
            <td>{{ row.product_order }}</td>
            <td>{{ row.task_id }}</td>
            <td>{{ row.tray_id }}</td>
            <td>{{ row.location }}</td>
            <td>{{ row.timestamp }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Show message when no results found -->
      <div v-else-if="searchQuery && !pagedRows.length" class="no-results">
        No results found for "{{ searchQuery }}"
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>

      <!-- Show total results info -->
      <div v-if="filteredAndSortedRows.length" class="results-info">
        Showing {{ pagedRows.length }} of {{ filteredAndSortedRows.length }} results
        <span v-if="searchQuery">(filtered from {{ rows.length }} total)</span>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <div v-if="showModal" class="scanner-modal" @click="closeModal">
      <div class="scanner-container" @click.stop>
        <div class="scanner-header">
          <h3>Task Details</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <div v-if="loadingTaskDetail" class="loading">
          Loading task details...
        </div>

        <div v-else-if="taskDetail" class="form">
          <div>
            <div class="form-group">
              <span>Tag</span>
              <p>{{ taskDetail.tag }}</p>
            </div>

            <div class="form-group">
              <span>Production Order</span>
              <p>{{ taskDetail.product_order }}</p>
            </div>

            <div class="form-group">
              <span>Material</span>
              <p>{{ taskDetail.material_no }}</p>
            </div>

            <div class="form-group">
              <span>Material Description</span>
              <p>{{ taskDetail.material_des }}</p>
            </div>

            <div class="form-group">
              <span>Surface</span>
              <p>{{ taskDetail.surface || 'N/A' }}</p>
            </div>

            <div class="form-group">
              <span>Machine
              </span>
              <p>{{ taskDetail.type || 'N/A' }}</p>
            </div>

            <div class="form-group">
              <span>Capacity</span>
              <p>{{ taskDetail.rpm || 'N/A' }}</p>
            </div>

            <div class="form-group">
              <span>Amount</span>
              <p>{{ taskDetail.amount }}</p>
            </div>

            <div class="form-group">
              <span>Amount Auto</span>
              <p>{{ taskDetail.amount_auto || 'N/A' }}</p>
            </div>

            <div class="form-group">
              <span>Recheck PRE</span>
              <p>{{ taskDetail.amount_pre || 'N/A' }}</p>
            </div>

            <div class="form-group">
              <span>Line</span>
              <p>{{ taskDetail.line }}</p>
            </div>

            <div v-if="taskDetail.ps" class="form-group">
              <span>หมายเหตุ</span>
              <p>{{ taskDetail.ps }}</p>
            </div>
          </div>
          <div>
            <div v-if="taskDetail.images" class="form-group">
              <div class="image-gallery">
                <div v-for="(imageUrl, index) in taskDetail.images" :key="index" class="image-item">
                  <img :src="imageUrl" :alt="`Product Image ${index + 1}`" class="product-image" />
                </div>
              </div>
            </div>
            <div v-else class="error-message">
              Failed to load task details
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'

const viewTable = ref('table_task_order')
const rows = ref([])
const currentPage = ref(1)
const pageSize = 10
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const sortKey = ref('timestamp')
const sortOrder = ref('desc')

// Modal and task detail states
const showModal = ref(false)
const taskDetail = ref(null)

const loadingTaskDetail = ref(false)

// Debounce timer
let searchTimeout = null

const parseTimestamp = (timestamp) => {
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

const tableTitle = computed(() =>
  viewTable.value === 'table_task_order' ? 'Task Order' : 'Delivery Time'
)

// Watch for search query changes and debounce
watch(searchQuery, (newQuery) => {
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Set new timeout for debouncing (300ms delay)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newQuery
    // Reset to page 1 when search changes
    currentPage.value = 1
  }, 300)
})

// Filter and sort the rows using debounced search query
const filteredAndSortedRows = computed(() => {
  let result = [...rows.value]

  // Apply search filter with debounced query
  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(query)
      )
    )
  }

  // Apply sorting
   if (sortKey.value === 'timestamp') {
    result.sort((a, b) => {
      const aValue = parseTimestamp(a[sortKey.value])
      const bValue = parseTimestamp(b[sortKey.value])
      
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

async function loadTable() {
  try {
    const res = await axios.get(`${__API_BASE_URL__}/${viewTable.value}`)
    rows.value = Array.isArray(res.data) ? res.data : []
    currentPage.value = 1
    // Clear search when switching tables
    searchQuery.value = ''
    debouncedSearchQuery.value = ''
  } catch (err) {
    console.error(err)
    rows.value = []
    currentPage.value = 1
  }
}

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

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  // Reset to page 1 when sorting changes
  currentPage.value = 1
}

async function showTaskDetail(row) {
  showModal.value = true
  loadingTaskDetail.value = true
  taskDetail.value = null

  try {
    // Fetch task details using task_id
    const taskRes = await axios.post(`${__API_BASE_URL__}/product_task_order_lookup`, {
      task_id: row.task_id || row.product_order,
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

function closeModal() {
  showModal.value = false
  taskDetail.value = null
}

</script>

<style scoped>
.view-box {
  grid-area: view;
  border: none;
  border-radius: 16px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 2rem;
  overflow: auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
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

.search-input:focus {
  outline: none;
  border-color: #8DBAED;
  box-shadow: 0 0 0 3px rgba(141, 186, 237, 0.2);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1.5rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

}

th {
  background: #f8fafc;
  color: #2c3e50;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.95rem;
  white-space: nowrap;
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

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: #f8f9fa;
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

.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.results-info {
  margin-top: 1rem;
  padding: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
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
  max-width: 75%;
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: auto;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.scanner-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
  position: relative;
}

.form-group {
  display: flex;
  align-items: center;
  justify-content: start;
  width: 100%;
  margin-bottom: 0.5rem;
}

.form-group-header {
  margin-bottom: 1.5rem;
}

.form-group span {
  margin-right: 1rem;
  white-space: nowrap;
}

.form-group p {
  margin: 0;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  color: #333;
  min-height: 1.2rem;
  width: 100%
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
}

.image-container {
  margin-top: 0.5rem;
}

.product-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
  .view-box {
    margin: 1rem;
    padding: 1.5rem;
    width: calc(100% - 2rem);
    box-sizing: border-box;
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
