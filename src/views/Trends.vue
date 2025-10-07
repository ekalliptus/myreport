<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import ChartCard from '../components/ChartCard.vue'
import { fetchSheetData } from '../services/sheets.js'

const loading = ref(true)
const error = ref(null)

const smoothing = ref(3) // moving average window (months)
const monthlyLabels = ref([])
const monthlyDatasets = ref([])
const momLabels = ref([])
const momDatasets = ref([])

function formatMonthStr(monthKey) {
  try {
    const [y, m] = monthKey.split('-').map(Number)
    const d = new Date(y, (m - 1), 1)
    return new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(d)
  } catch {
    return monthKey
  }
}

function computeMovingAverage(arr, window = 3) {
  const out = []
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = arr.slice(start, i + 1)
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length
    out.push(Math.round(avg))
  }
  return out
}

function computeMoMPercent(totals) {
  const out = []
  for (let i = 0; i < totals.length; i++) {
    if (i === 0) {
      out.push(0)
    } else {
      const prev = totals[i - 1]
      const curr = totals[i]
      const pct = prev ? ((curr - prev) / prev) * 100 : 0
      out.push(Number(pct.toFixed(1)))
    }
  }
  return out
}

async function buildData() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchSheetData({ prefer: 'csv' })
    const months = data.byMonth.slice().sort((a, b) => a.month.localeCompare(b.month))
    const labels = months.map(m => formatMonthStr(m.month))
    const totals = months.map(m => Math.round(m.total))
    const ma = computeMovingAverage(totals, smoothing.value)
    const mom = computeMoMPercent(totals)

    monthlyLabels.value = labels
    monthlyDatasets.value = [
      {
        label: 'Total per Bulan',
        data: totals,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.25)',
        fill: true,
        tension: 0.35,
      },
      {
        label: `MA (${smoothing.value})`,
        data: ma,
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167,139,250,0.18)',
        fill: false,
        tension: 0.2,
      }
    ]

    momLabels.value = labels
    momDatasets.value = [
      {
        label: 'Pertumbuhan MoM (%)',
        data: mom,
        backgroundColor: mom.map(v => (v >= 0 ? 'rgba(52,211,153,0.7)' : 'rgba(248,113,113,0.7)')),
        borderColor: 'rgba(255,255,255,0.18)',
      }
    ]

    loading.value = false
    await nextTick()
    if (document.querySelector('.grid .chart-card')) {
      gsap.from('.grid .chart-card', { opacity: 0, y: 12, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  } catch (e) {
    error.value = e?.message || String(e)
    loading.value = false
  }
}

onMounted(buildData)
watch(smoothing, buildData)
</script>

<template>
  <section class="trends">
    <div class="panel">
      <div class="panel-left">
        <h2>Tren Bulanan</h2>
        <p class="muted">Analisa total per bulan, rata-rata bergerak, dan pertumbuhan MoM.</p>
      </div>
      <div class="panel-right">
        <label class="ctrl">
          Smoothing (MA):
          <select v-model.number="smoothing">
            <option :value="1">1</option>
            <option :value="3">3</option>
            <option :value="6">6</option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading">Memuat data...</div>
    <div v-else-if="error" class="error">Terjadi kesalahan: {{ error }}</div>
    <div v-else class="grid">
      <ChartCard
        type="line"
        title="Total per Bulan dan MA"
        :labels="monthlyLabels"
        :datasets="monthlyDatasets"
        :height="320"
        accent="#60a5fa"
      />
      <ChartCard
        type="bar"
        title="Pertumbuhan MoM (%)"
        :labels="momLabels"
        :datasets="momDatasets"
        :height="320"
        accent="#34d399"
      />
    </div>
  </section>
</template>

<style scoped>
.trends {
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
</style>