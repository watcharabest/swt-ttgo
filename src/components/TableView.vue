<template>
  <div class="box view-box">
    <h2>{{ tableTitle }}</h2>
    <div class="form-group">
      <label for="viewTableSelect">Select Table to View</label>
      <select id="viewTableSelect" v-model="viewTable" class="table-select">
        <option value="table01">Table 01</option>
        <option value="table02">Table 02</option>
      </select>
    </div>

    <!-- Add search input -->
    <div class="search-box">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search..." 
        class="search-input"
      />
    </div>

    <div class="view-box">
      <table v-if="pagedRows.length">
        <!-- Header สำหรับ table01 มีคอลัมน์ Image -->
        <thead v-if="viewTable === 'table01'">
          <tr>
            <th @click="sortBy('product_order')" class="sortable">
              Product Order
              <span v-if="sortKey === 'product_order'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('material')" class="sortable">
              Material
              <span v-if="sortKey === 'material'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('name_product')" class="sortable">
              Name Product
              <span v-if="sortKey === 'name_product'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Image</th>
          </tr>
        </thead>
        <!-- Header สำหรับ table02 ไม่มีคอลัมน์ Image -->
        <thead v-else>
          <tr>
            <th @click="sortBy('tray_id')" class="sortable">
              Tray ID
              <span v-if="sortKey === 'tray_id'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('mac_address')" class="sortable">
              MAC Address
              <span v-if="sortKey === 'mac_address'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('product_order')" class="sortable">
              Product Order
              <span v-if="sortKey === 'product_order'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>

        <!-- Body สำหรับ table01 แสดงรูป -->
        <tbody v-if="viewTable === 'table01'">
          <tr v-for="(row, i) in pagedRows" :key="i">
            <td>{{ row.product_order }}</td>
            <td>{{ row.material }}</td>
            <td>{{ row.name_product }}</td>
            <td class="image-cell">
              <img v-if="row.material" :src="`/images/${row.material}.jpg`" :alt="row.material" />
              <span v-else>No image</span>
            </td>

          </tr>
        </tbody>
        <!-- Body สำหรับ table02 -->
        <tbody v-else>
          <tr v-for="(row, i) in pagedRows" :key="i">
            <td>{{ row.tray_id }}</td>
            <td>{{ row.mac_address }}</td>
            <td>{{ row.product_order }}</td>
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

const viewTable = ref('table01')
const rows = ref([])
const currentPage = ref(1)
const pageSize = 10
const searchQuery = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')

const tableTitle = computed(() =>
  viewTable.value === 'table01' ? 'Product Table' : 'Track Product Order'
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
  
  // Apply sorting
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

// คำนวณหน้าทั้งหมด และข้อมูลที่จะแสดง
const totalPages = computed(() => Math.ceil(filteredAndSortedRows.value.length / pageSize))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAndSortedRows.value.slice(start, start + pageSize)
})

async function loadTable() {
  try {
    const res = await axios.get(`https://10.100.113.33:8000/${viewTable.value}`)
    rows.value = Array.isArray(res.data) ? res.data : []
    currentPage.value = 1
  } catch (err) {
    console.error(err)
    rows.value = []
    currentPage.value = 1
  }
}

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
    width: calc(100% - 2rem);
    box-sizing: border-box;
  }

  .search-box {
    padding: 0;
  }

  .search-input,
  .table-select {
    font-size: 16px; /* Prevent zoom on mobile */
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

  th, td {
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
  th, td {
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
