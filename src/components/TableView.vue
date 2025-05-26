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

    <div class="view-box">
      <table v-if="pagedRows.length">
        <!-- Header สำหรับ table01 มีคอลัมน์ Image -->
        <thead v-if="viewTable === 'table01'">
          <tr>
            <th>Product Order</th>
            <th>Material</th>
            <th>Name Product</th>
            <th>Image</th>
          </tr>
        </thead>
        <!-- Header สำหรับ table02 ไม่มีคอลัมน์ Image -->
        <thead v-else>
          <tr>
            <th>Tray ID</th>
            <th>MAC Address</th>
            <th>Product Order</th>
          </tr>
        </thead>

        <!-- Body สำหรับ table01 แสดงรูป -->
        <tbody v-if="viewTable === 'table01'">
          <tr v-for="(row, i) in pagedRows" :key="i">
            <td>{{ row.product_order }}</td>
            <td>{{ row.material }}</td>
            <td>{{ row.name_product }}</td>
            <td class="image-cell">
              <img
                :src="`/images/${row.material}.jpg`"
                :alt="row.material"
              />
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

const tableTitle = computed(() =>
  viewTable.value === 'table01' ? 'Product Table' : 'Track Product Order'
)

// คำนวณหน้าทั้งหมด และข้อมูลที่จะแสดง
const totalPages = computed(() => Math.ceil(rows.value.length / pageSize))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return rows.value.slice(start, start + pageSize)
})

async function loadTable() {
  try {
    const res = await axios.get(`https://10.100.67.37:8000/${viewTable.value}`)
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
</script>

<style scoped>
.view-box {
  grid-area: view;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 3%;
}
.table-select {
  max-width: 150px;
  padding: 5px;
  margin-left: 1rem;
  border-radius: 4px;
}
.btn-load {
  padding: .5rem 1rem;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  margin-top: 1rem;
  background: #8DBAED;
  color: #2c3e50;
  font-weight: bold;
}
.btn-load:hover {
  color: #fff;
}
.image-cell img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
table {
  width:100%;
  border-collapse:collapse;
  margin-top:1rem;
}
th, td {
  border:1px solid #ccc;
  padding:0.5rem;
  text-align:left;
}
th {
  background:#f0f0f0;
}
.pagination {
  display:flex;
  justify-content:center;
  align-items:center;
  margin-top:1rem;
}
.pagination button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  border:none;
  background:#8DBAED;
  color:#2c3e50;
  border-radius:4px;
  cursor:pointer;
}
.pagination button:disabled {
  background:#ccc;
  cursor:not-allowed;
}
.pagination span {
  margin: 0 0.5rem;
}
</style>
