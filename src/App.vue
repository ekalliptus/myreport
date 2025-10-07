<script setup>
import { onMounted } from 'vue'
import { gsap } from 'gsap'

onMounted(() => {
  gsap.from('.brand', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' })
  gsap.from('.nav a', { opacity: 0, y: -10, stagger: 0.08, duration: 0.5, delay: 0.1, ease: 'power2.out' })
})
</script>

<template>
  <div class="app">
    <header class="brand">
      <h1>Laporan Bulanan</h1>
      <p>Presentasi Data dari Google Sheets</p>
    </header>

    <nav class="nav">
      <RouterLink to="/">Overview</RouterLink>
      <RouterLink to="/trends">Trends</RouterLink>
      <RouterLink to="/categories">Categories</RouterLink>
    </nav>

    <main class="content">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <footer class="footer">
      <small>&copy; 2025 Monthly Report</small>
    </footer>
  </div>
</template>

<style>
:root {
  --bg: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1020 100%);
  --card: rgba(255, 255, 255, 0.06);
  --border: rgba(255, 255, 255, 0.12);
  --text: #e5e7eb;
  --muted: #9ca3af;
  --primary: #60a5fa;
  --accent: #34d399;
}

* { box-sizing: border-box; }

html, body, #app {
  height: 100%;
}

.app {
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  padding: 24px;
}

.brand {
  text-align: center;
  margin-bottom: 10px;
}

.brand h1 {
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand p {
  margin: 6px 0 0;
  color: var(--muted);
}

.nav {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 10px auto 18px;
  flex-wrap: wrap;
}

.nav a {
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text);
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease, border 0.2s ease;
  backdrop-filter: blur(6px);
}

.nav a.router-link-active {
  background: rgba(96, 165, 250, 0.18);
  border-color: rgba(96, 165, 250, 0.5);
}

.nav a:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

/* Page transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.footer {
  text-align: center;
  color: var(--muted);
  margin-top: 20px;
}
</style>
