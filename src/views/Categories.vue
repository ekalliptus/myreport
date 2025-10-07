<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import ChartCard from '../components/ChartCard.vue'
import { fetchSheetData, formatIDCurrency } from '../services/sheets.js'

const loading = ref(true)
const error = ref(null)

const topN = ref(8)
const categoriesLabels = ref([])
const categoriesPieDatasets = ref([])
const categoriesBarDatasets = ref([])
const tableRows = ref([])

const palette = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#f87171', '#22d3ee', '#84cc16', '#fb7185', '#2dd4bf', '#c084fc', '#fde047']

function buildFromCategories(cats, n = 8) {
  const sorted = cats.slice().sort((a, b) => b.total - a.total)
  const picked = sorted.slice(0, n)
  const labels = picked.map(c => c.category)
  const totals = picked.map(c => Math.round(c.total))
  const totalAll = cats.reduce((a, b) => a + b.total, 0)
  const percents = picked.map(c => Number(((c.total / (totalAll || 1)) * 100).toFixed(1)))

  categoriesLabels.value = labels
  categoriesPieDatasets.value = [
    {
      label: 'Distribusi (%)',
      data: percents,
      backgroundColor: picked.map((_, i) => palette[i % palette.length]),
      borderColor: 'rgba(255,255,255,0.18)',
    }
  ]
  categoriesBarDatasets.value = [
    {
      label: 'Total per Kategori',
      data: totals,
      backgroundColor: picked.map((_, i) => palette[i % palette.length]),
      borderColor: 'rgba(255,255,255,0.18)',
    }
  ]
  tableRows.value = picked.map((c, i) => ({
    idx: i + 1,
    category: c.category,
    total: c.total,
    percent: percents[i],
    color: palette[i % palette.length],
  }))
}

async function buildData() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchSheetData({ prefer: 'csv' })
    buildFromCategories(data.byCategory, topN.value)

    loading.value = false
    await nextTick()
    if (document.querySelector('.grid .chart-card')) {
      gsap.from('.grid .chart-card', { opacity: 0, y: 12, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
    if (document.querySelector('.table')) {
      gsap.from('.table', { opacity: 0, y: 10, duration: 0.5, delay: 0.1, ease: 'power2.out' })
    }
  } catch (e) {
    error.value = e?.message || String(e)
    loading.value = false
  }
}

onMounted(buildData)
watch(topN, buildData)
</script>

<template>
  <section class="categories">
    <div class="panel">
      <div class="panel-left">
        <h2>Distribusi Kategori</h2>
        <p class="muted">Lihat porsi dan total per kategori dari data Google Sheets.</p>
      </div>
      <div class="panel-right">
        <label class="ctrl">
          Top N:
          <select v-model.number="topN">
            <option :value="5">5</option>
            <option :value="8">8</option>
            <option :value="12">12</option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading">Memuat data...</div>
    <div v-else-if="error" class="error">Terjadi kesalahan: {{ error }}</div>
    <div v-else class="grid">
      <ChartCard
        type="pie"
        title="Persentase per Kategori"
        :labels="categoriesLabels"
        :datasets="categoriesPieDatasets"
        :height="320"
        accent="#a78bfa"
      />
      <ChartCard
        type="bar"
        title="Total per Kategori"
        :labels="categoriesLabels"
        :datasets="categoriesBarDatasets"
        :height="320"
        accent="#60a5fa"
      />
    </div>

    <div v-if="!loading && !error" class="table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Kategori</th>
            <th>Total</th>
            <th>Porsi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableRows" :key="row.category">
            <td class="idx"><span class="dot" :style="{ background: row.color }"></span>{{ row.idx }}</td>
            <td>{{ row.category }}</td>
            <td>{{ formatIDCurrency(row.total) }}</td>
            <td>{{ row.percent }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.categories {
  display: grid;
  gap: 16px;
}
.panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
  padding: 14px 16px;
}
.muted { color: var(--muted); margin: 4px 0 0; }
.ctrl {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
}
select {
  appearance: none;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.06);
  color: var(--text);
}
.loading, .error {
  text-align: center;
  padding: 24px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}
.table {
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
  overflow: hidden;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead tr {
  background: rgba(255,255,255,0.06);
}
th, td {
  text-align: left;
  padding: 10px 12px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
tbody tr:hover {
  background: rgba(255,255,255,0.04);
}
.idx {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}
</style>