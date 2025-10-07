<script setup>
import { ref, onMounted, computed } from 'vue'
import { Chart as ChartJS, registerables } from 'chart.js'
import { Line, Bar, Pie } from 'vue-chartjs'
import { gsap } from 'gsap'

ChartJS.register(...registerables)

const props = defineProps({
  type: { type: String, default: 'line' },
  title: { type: String, default: '' },
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  options: { type: Object, default: () => ({}) },
  height: { type: Number, default: 280 },
  accent: { type: String, default: '#60a5fa' },
})

const el = ref(null)
const accent = computed(() => props.accent)

const ChartComponent = computed(() => {
  switch (props.type) {
    case 'bar': return Bar
    case 'pie': return Pie
    default: return Line
  }
})

const resolvedOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#e5e7eb' }
    },
    tooltip: { enabled: true }
  },
  scales: {
    x: {
      ticks: { color: '#e5e7eb' },
      grid: { color: 'rgba(255,255,255,0.08)' }
    },
    y: {
      ticks: { color: '#e5e7eb' },
      grid: { color: 'rgba(255,255,255,0.08)' }
    }
  },
  ...props.options
}))

const data = computed(() => ({
  labels: props.labels,
  datasets: props.datasets
}))

onMounted(() => {
  gsap.from(el.value, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' })
})
</script>

<template>
  <div class="chart-card" ref="el" :style="{ '--accent': accent }">
    <div class="chart-head">
      <h3 class="chart-title">{{ title }}</h3>
    </div>
    <div class="chart-body" :style="{ height: height + 'px' }">
      <component :is="ChartComponent" :data="data" :options="resolvedOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  position: relative;
}
.chart-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(120deg, var(--accent), rgba(255,255,255,0));
  mask:
    linear-gradient(#000, #000) content-box,
    linear-gradient(#000, #000);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.chart-title {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
  letter-spacing: 0.02em;
}
.chart-body {
  position: relative;
}
</style>