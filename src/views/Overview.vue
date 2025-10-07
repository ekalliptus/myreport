<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import MetricCard from '../components/MetricCard.vue'
import ChartCard from '../components/ChartCard.vue'
import { fetchSheetData, formatIDCurrency } from '../services/sheets.js'

const loading = ref(true)
const error = ref(null)
const summary = ref({
  total: 0,
  currentMonthTotal: 0,
  previousMonthTotal: 0,
  monthChange: null,
  itemCount: 0,
})

const monthlyLabels = ref([])
const monthlyDatasets = ref([])
const categoriesLabels = ref([])
const categoriesDatasets = ref([])

function formatMonthStr(monthKey) {
  try {
    const [y, m] = monthKey.split('-').map(Number)
    const d = new Date(y, (m - 1), 1)
    return new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(d)
  } catch {
    return monthKey
  }
}

onMounted(async () => {
  try {
    const data = await fetchSheetData({ prefer: 'csv' })
    summary.value = data.summary

    const months = data.byMonth.slice().sort((a, b) => a.month.localeCompare(b.month))
    monthlyLabels.value = months.map(m => formatMonthStr(m.month))
    monthlyDatasets.value = [
      {
        label: 'Total per Bulan',
        data: months.map(m => Math.round(m.total)),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.25)',
        fill: true,
        tension: 0.35,
      }
    ]

    const cats = data.byCategory.slice().sort((a, b) => b.total - a.total)
    categoriesLabels.value = cats.map(c => c.category)
    const palette = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#f87171', '#22d3ee', '#84cc16']
    categoriesDatasets.value = [
      {
        label: 'Total per Kategori',
        data: cats.map(c => Math.round(c.total)),
        backgroundColor: cats.map((_, i) => palette[i % palette.length]),
        borderColor: 'rgba(255,255,255,0.18)',
      }
    ]

    loading.value = false
    await nextTick()
    if (document.querySelector('.metrics .metric-card')) {
      gsap.from('.metrics .metric-card', { opacity: 0, y: 12, duration: 0.5, stagger: 0.05, ease: 'power2.out' })
    }
    if (document.querySelector('.charts .chart-card')) {
      gsap.from('.charts .chart-card', { opacity: 0, y: 12, duration: 0.5, delay: 0.1, stagger: 0.08, ease: 'power2.out' })
    }
  } catch (e) {
    error.value = e?.message || String(e)
    loading.value = false
  }
})
</script>

<template>
  <section class="overview">
    <div v-if="loading" class="loading">
      Memuat data dari Google Sheets...
    </div>
    <div v-else-if="error" class="error">
      Terjadi kesalahan: {{ error }}
    </div>
    <div v-else class="content">
      <div class="metrics">
        <MetricCard
          title="Total"
          :value="formatIDCurrency(summary.total)"
          subtitle="Akumulasi"
          icon="📊"
          accent="#60a5fa"
        />
        <MetricCard
          title="Bulan Ini"
          :value="formatIDCurrency(summary.currentMonthTotal)"
          subtitle="Total bulan berjalan"
          icon="🗓️"
          :trend="summary.monthChange"
          accent="#34d399"
        />
        <MetricCard
          title="Bulan Lalu"
          :value="formatIDCurrency(summary.previousMonthTotal)"
          subtitle="Perbandingan"
          icon="↩️"
          accent="#fbbf24"
        />
        <MetricCard
          title="Jumlah Item"
          :value="summary.itemCount"
          subtitle="Data masuk"
          icon="🧮"
          accent="#a78bfa"
        />
      </div>

      <div class="charts">
        <ChartCard
          type="line"
          title="Trend Bulanan"
          :labels="monthlyLabels"
          :datasets="monthlyDatasets"
          :height="300"
          accent="#60a5fa"
        />
        <ChartCard
          type="bar"
          title="Distribusi Kategori"
          :labels="categoriesLabels"
          :datasets="categoriesDatasets"
          :height="300"
          accent="#34d399"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.overview {
  display: grid;
  gap: 20px;
}
.loading, .error {
  text-align: center;
  padding: 24px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
}
.content {
  display: grid;
  gap: 20px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* Responsive */
@media (max-width: 1100px) {
  .metrics { grid-template-columns: repeat(2, 1fr); }
  .charts { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .metrics { grid-template-columns: 1fr; }
}
</style>