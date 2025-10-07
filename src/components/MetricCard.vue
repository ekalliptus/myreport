<script setup>
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  subtitle: { type: String, default: '' },
  trend: { type: Number, default: null }, // percent change e.g., 0.12
  accent: { type: String, default: '#60a5fa' }, // accent gradient start
  icon: { type: String, default: '' }, // optional emoji/icon text
})

const el = ref(null)
onMounted(() => {
  gsap.from(el.value, { opacity: 0, y: 8, duration: 0.5, ease: 'power2.out' })
})
</script>

<template>
  <div class="metric-card" ref="el" :style="{ '--accent': accent }">
    <div class="metric-head">
      <span v-if="icon" class="metric-icon">{{ icon }}</span>
      <h3 class="metric-title">{{ title }}</h3>
    </div>
    <div class="metric-value">{{ value }}</div>
    <div class="metric-sub">
      <span v-if="trend !== null" class="trend" :class="trendClass">
        <span v-if="trend > 0">▲</span><span v-else-if="trend < 0">▼</span>
        {{ formatTrend(trend) }}
      </span>
      <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    trendClass() {
      if (this.trend === null) return '';
      return this.trend >= 0 ? 'up' : 'down';
    }
  },
  methods: {
    formatTrend(val) {
      if (val === null) return '';
      const pct = (val * 100).toFixed(1);
      return `${pct}%`;
    }
  }
}
</script>

<style scoped>
.metric-card {
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  position: relative;
}
.metric-card::after {
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
.metric-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.metric-icon {
  font-size: 20px;
}
.metric-title {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
  letter-spacing: 0.02em;
}
.metric-value {
  font-weight: 800;
  font-size: 28px;
  margin: 8px 0;
  letter-spacing: -0.02em;
}
.metric-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}
.trend.up { color: #34d399; }
.trend.down { color: #f87171; }
</style>