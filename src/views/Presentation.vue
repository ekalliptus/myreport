<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'

const loading = ref(true)
const error = ref(null)
const slides = ref([])
const idx = ref(0)
const deckEl = ref(null)

// Raw job list pasted from user input.
// Only URLs will be extracted; tasks without links are ignored; duplicates are deduplicated by canonical URL.
const jobsText = `Membuat LP GWS: Sumur Santri Penghafal Quran	https://wakafsumur.com/sumursantripenghafalquran-gws
Revisi LP Komunitas Sedekah Subuh KSS Hutang	https://komunitassedekahsubuh.org/kss-hutang
Revisi LP Komunitas Sedekah Subuh KSS Sakit	https://komunitassedekahsubuh.org/kss-sakit
Revisi LP Komunitas Sedekah Subuh KSS Pekerjaan	https://komunitassedekahsubuh.org/kss-pekerjaan
Belajar Coding untuk elementor dan berdu	-
Revisi Homepage Kajian Subuh	https://kajiansubuh.com
Optimasi Homepage Kajian Subuh pada Mobile	https://kajiansubuh.com
Improve Web Portofolio	https://ekalliptus.my.id
Update LP Zakat Fitrah Online	https://zakatfitrah.com
Optimalisasi LP Zakat Fitrah Online untuk Mobile	https://zakatfitrah.com
Ngedit Canva dan Presentasi Web Dev	-
Ngoding	-
Update Homepage Sahabat Quran	https://sahabatquran.com
Ngoding ( Membuat web broadcast whatsapp )	-
Membuat LP 404	https://ekalliptus.id
Ikut Distribusi Semen	-
Mengikuti acara Maulid Nabi	-
Update LP Wakaf Sumur:	http://wakafsumur.com/form-santri-jariyah-yth
	http://wakafsumur.com/form-sumur-orangtua-pesantrennusantara-yt-AR
	https://wakafsumur.com/form-santri-hadiah-rmdhyt-AR
	https://wakafsumur.com/form-sumur-orangtua-hadiahterbaik-yt
	https://wakafsumur.com/form-sumur-orangtua-ibu-yt
	https://wakafsumur.com/form-sumur-orangtua-pahalajariyah-yt-nh
	https://wakafsumur.com/form-sumur-orangtua-santripelosok-yt
	https://wakafsumur.com/form-sumur-penghafal-quran-yt
	https://wakafsumur.com/form-sumur-santri-bor-yt
	https://wakafsumur.com/form-wasiat-hadiah-terbaikyt-ss
	https://wakafsumur.com/form-wasiat-pahalajariyah-rmdhyt
	https://wakafsumur.com/form-wasiat-rezeki-ramadhan-nh
	https://wakafsumur.com/gerakanwakafsumur
	https://wakafsumur.com/form-sumur-kesehatan-yt
	https://wakafsumur.com/pahala-jariyah
	https://wakafsumur.com/form-sumur-santri-air-bersih-yt-nh
	https://wakafsumur.com/pelosok
	https://wakafsumur.com/sumur-orangtua-krisisairbersih-yt
	https://wakafsumur.org/form-wsprezeki-rmdhyt
	https://wakafsumur.com/sumurorangtua
	https://wakafsumur.com/wakafairbersih
	https://wakafsumur.com/wakafsumurpesantren
	https://wakafsumur.com/wakafsumursantri
	https://wakafsumur.com/sumur-santri-orang-tua-yt
	http://wakafsumur.com/form-santri-rezeki-hnf

Update LP GWS	https://wakafsumur.org/pesantren-atas-nama-ortu
⁠Update HP PKBM	https://pkbm.alfatihahhomeschooling.com/
Update LP Kelas Tahajud	https://alfatihah.id/kelas-tahajud
⁠Update LP Challenge Hijrah 	https://alfatihah.id/challenge-hijrah
Survey harga hosting dan domain	-
Belajar Multi Domain dalam 1 Hosting	-
Ngoding	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/
Belajar Digital Marketing	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/
Day 1 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/
Day 2 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
LIBUR

Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/
Day 3 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/
Membuat LP Galeri PKBM Alfatihah	https://pkbm.alfatihahhomeschooling.com/galeri
Day 4 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Angkat Mushaf	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/pkbm-alfatihah-2
Membuat LP Program PKBM Alfatihah	https://pkbm.alfatihahhomeschooling.com/program-2
Day 5 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Rapat Together di Ruang Transit	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/pkbm-alfatihah-2
Day 6 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Membuat Quiz Wayground untuk Besok Mengajar	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com
Day 7 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Sepak Bola + Milad	-

Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com
Day 8 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com
Day 9 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Membuat homepage Ambulance Jenazah Premium	https://ambulancejenazahpremium.com/
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com
Membuat Header & Footer Ambulance Jenazah Premium	https://ambulancejenazahpremium.com/
Day 10 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Membuat homepage Ambulance Jenazah Premium	https://ambulancejenazahpremium.com/
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com
Day 11 - Mengajar sementara kelas RPL SMK IT AL-HIDAYAH	-
Membuat homepage Ambulance Jenazah Premium	https://ambulancejenazahpremium.com/
Update Homepage PKBM AlFatihah	https://pkbm.alfatihahhomeschooling.com/
Update Homepage dan LP Alfatihah Homeschooling:	https://alfatihahhomeschooling.com/
	https://alfatihahhomeschooling.com/visi-dan-misi/
	https://alfatihahhomeschooling.com/artikel-2/
Update Homepage dan LP Ambulance Jenazah Premium:	https://ambulancejenazahpremium.com
	https://ambulancejenazahpremium.com/profil/
	https://ambulancejenazahpremium.com/layanan-kami/
	https://ambulancejenazahpremium.com/kontak/
Piket Besar	-
Update Homepage & LP PKBM AlFatihah:	https://pkbm.alfatihahhomeschooling.com/
	https://pkbm.alfatihahhomeschooling.com/galeri/
	https://pkbm.alfatihahhomeschooling.com/program-2/
	https://pkbm.alfatihahhomeschooling.com/pendidikan-kesetaraan/
	https://pkbm.alfatihahhomeschooling.com/kelas-online/
	https://pkbm.alfatihahhomeschooling.com/pelatihan-keterampilan/
	https://pkbm.alfatihahhomeschooling.com/artikel/
	https://pkbm.alfatihahhomeschooling.com/berita-acara/
	https://pkbm.alfatihahhomeschooling.com/faq/
	https://pkbm.alfatihahhomeschooling.com/tentang-kami/
	https://pkbm.alfatihahhomeschooling.com/taman-baca/
Belajar VPS	-

Membuat LP Bayar Fidyah	https://bayarfidyah.com/fidyah-orang-tua-meninggal-gsn/
	https://bayarfidyah.com/fidyah-orang-tua-sakit-keras-gsn/
	https://bayarfidyah.com/fidyah-ibu-hamil-gsn/
Belajar VPS	-
Membuat Homepage web porto	https://ekalliptus.id/
Homepage & LP AIS	https://alhidayahschool.sch.id
	https://spmb.alhidayahschool.sch.id
`;

function uniqueLinksFromText(text) {
  const matches = Array.from(text.matchAll(/https?:\/\/[^\s)]+/g)).map(m => m[0]);
  const seen = new Set();
  const links = [];
  function canonicalKey(h) {
    try {
      const u = new URL(h);
      const host = u.hostname.toLowerCase().replace(/^www\./, '');
      const path = u.pathname.replace(/\/+$/, '');
      return `${host}${path}`;
    } catch {
      return h.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '').toLowerCase();
    }
  }
  function normalizedHref(h) {
    try {
      const u = new URL(h);
      const host = u.hostname.replace(/^www\./, '');
      const path = u.pathname.replace(/\/+$/, '');
      return `https://${host}${path}`;
    } catch {
      return h.trim().replace(/^http:\/\//, 'https://').replace(/^www\./, '').replace(/\/+$/, '');
    }
  }
  function displayText(h) {
    try {
      const u = new URL(h);
      const host = u.hostname.replace(/^www\./, '');
      const segments = u.pathname.split('/').filter(Boolean);
      if (segments.length === 0) return host;
      const last = segments[segments.length - 1];
      const shorten = (s, max = 32) => s.length > max ? s.slice(0, max - 1) + '…' : s;
      if (segments.length === 1) {
        return `${host}/${shorten(last)}`;
      }
      return `${host}/…/${shorten(last)}`;
    } catch {
      const s = h.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
      const parts = s.split('/');
      if (parts.length <= 1) return parts[0] || s;
      const last = parts[parts.length - 1];
      const base = parts[0];
      const shorten = (t, max = 32) => t.length > max ? t.slice(0, max - 1) + '…' : t;
      return `${base}/…/${shorten(last)}`;
    }
  }
  for (const raw of matches) {
    const key = canonicalKey(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    const href = normalizedHref(raw);
    links.push({ text: displayText(href), href });
  }
  return links;
}


function parseHashIndex() {
  try {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''))
    const s = Number(hash.get('s'))
    return Number.isFinite(s) && s >= 0 ? s : 0
  } catch {
    return 0
  }
}

function writeHashIndex(i) {
  const p = new URLSearchParams(location.hash.replace(/^#/, ''))
  p.set('s', String(i))
  location.hash = p.toString()
}

const progress = computed(() => {
  const total = slides.value.length || 1
  return Math.min(100, Math.max(0, ((idx.value + 1) / total) * 100))
})

function next() {
  if (!slides.value.length) return
  idx.value = Math.min(slides.value.length - 1, idx.value + 1)
  writeHashIndex(idx.value)
  animateIn()
}
function prev() {
  if (!slides.value.length) return
  idx.value = Math.max(0, idx.value - 1)
  writeHashIndex(idx.value)
  animateIn()
}

async function animateIn() {
  await nextTick()
  const el = document.querySelector('.slide.active')
  if (!el) return
  const items = el.querySelectorAll('.reveal')
  if (items.length) {
    gsap.from(items, { opacity: 0, y: 16, duration: 0.45, stagger: 0.05, ease: 'power2.out' })
  } else {
    gsap.from(el, { opacity: 0, duration: 0.35, ease: 'power2.out' })
  }
}

function onKey(e) {
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
    e.preventDefault()
    next()
  } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
    e.preventDefault()
    prev()
  } else if (e.key.toLowerCase() === 'f') {
    toggleFullscreen()
  } else if (e.key.toLowerCase() === 'h') {
    // help overlay could be toggled here
  }
}

function toggleFullscreen() {
  const root = document.documentElement
  if (!document.fullscreenElement) {
    root.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

async function buildSlides() {
  loading.value = true
  error.value = null
  try {
    const jobLinks = uniqueLinksFromText(jobsText)

    function bulletWithLink(label, link) {
      return link ? `${label} (<a href="${link.href}" target="_blank" rel="noopener">${link.text}</a>)` : `${label}:`
    }

    const gwsLink = jobLinks.find(l => l.href.includes('wakafsumur.com/sumursantripenghafalquran-gws'))
    const kssHutangLink = jobLinks.find(l => l.href.includes('komunitassedekahsubuh.org/kss-hutang'))
    const zakatLink = jobLinks.find(l => l.href.includes('zakatfitrah.com'))
    const pkbmGaleriLink = jobLinks.find(l => l.href.includes('pkbm.alfatihahhomeschooling.com'))
    const ambulanceLink = jobLinks.find(l => l.href.includes('ambulancejenazahpremium.com'))
    const alhidayahMainLink = jobLinks.find(l => l.href.includes('alhidayahschool.sch.id'))
    const alhidayahSpmbLink = jobLinks.find(l => l.href.includes('spmb.alhidayahschool.sch.id'))
    const alhidayahLink = alhidayahMainLink || alhidayahSpmbLink

    const gwsBullet = bulletWithLink('LP GWS Sumur Santri Penghafal Quran', gwsLink)
    const kssBullet = bulletWithLink('LP KSS Hutang', kssHutangLink)
    const zakatBullet = bulletWithLink('LP Zakat Fitrah Online', zakatLink)
    const pkbmBullet = bulletWithLink('Homepage & LP PKBM AlFatihah', pkbmGaleriLink)
    const ambulanceBullet = bulletWithLink('Homepage Ambulance Jenazah Premium', ambulanceLink)
    const alhidayahBullet =
      alhidayahMainLink && alhidayahSpmbLink
        ? `Homepage & LP AIS (<a href="${alhidayahMainLink.href}" target="_blank" rel="noopener">${alhidayahMainLink.text}</a> / <a href="${alhidayahSpmbLink.href}" target="_blank" rel="noopener">${alhidayahSpmbLink.text}</a>)`
        : bulletWithLink('Homepage & LP AIS', alhidayahLink)

    function chunk(arr, size) {
      const out = []
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
      return out
    }
    // Group links by domain to emphasize LPs with many links
    function domainOf(l) {
      try { return new URL(l.href).hostname.replace(/^www\./, '') } catch { return (l.text || '').split('/')[0] }
    }
    function groupKey(domain) {
      const d = domain.toLowerCase()
      if (d === 'alhidayahschool.sch.id' || d === 'spmb.alhidayahschool.sch.id') return 'alhidayah'
      return d
    }
    function displayGroupTitle(domainKey) {
      if (domainKey === 'alhidayah') {
        return 'alhidayahschool.sch.id'
      }
      return domainKey
    }
    const groups = new Map()
    for (const l of jobLinks) {
      const d = domainOf(l)
      const g = groupKey(d)
      const arr = groups.get(g) || []
      arr.push(l)
      groups.set(g, arr)
    }
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length)
    const SPECIAL_DOMAINS = new Set(['alhidayah'])
    const heavyGroups = sortedGroups.filter(([domain, links]) => SPECIAL_DOMAINS.has(domain) || links.length >= 4)
    const lightLinks = sortedGroups.filter(([domain, links]) => !SPECIAL_DOMAINS.has(domain) && links.length < 4).flatMap(([, links]) => links)

    const bulletMap = new Map([
      ['wakafsumur.com', gwsBullet],
      ['komunitassedekahsubuh.org', kssBullet],
      ['zakatfitrah.com', zakatBullet],
      ['pkbm.alfatihahhomeschooling.com', pkbmBullet],
      ['ambulancejenazahpremium.com', ambulanceBullet],
      ['alhidayah', alhidayahBullet],
    ])

    const groupedSlides = []

    for (const [domain, links] of heavyGroups) {
      const chunks = chunk(links, 12)
      chunks.forEach((chunkLinks, index) => {
        const suffix = chunks.length > 1 ? ` (Halaman ${index + 1}/${chunks.length})` : ''
        const labelDomain = displayGroupTitle(domain)
        const firstItem = index === 0
          ? (bulletMap.get(domain) || `Link Output • ${labelDomain}`)
          : `Link Output • ${labelDomain} (lanjutan)`
        groupedSlides.push({
          key: `links-${domain}-${index + 1}`,
          type: 'bullets',
          title: `Daftar Jobdesk & Link Output — ${labelDomain}${suffix}`,
          items: [firstItem],
          links: chunkLinks,
        })
      })
    }

    if (lightLinks.length) {
      const miscChunks = chunk(lightLinks, 18)
      miscChunks.forEach((chunkLinks, index) => {
        groupedSlides.push({
          key: `links-misc-${index + 1}`,
          type: 'bullets',
          title: `Link Output Lainnya${miscChunks.length > 1 ? ` (Halaman ${index + 1}/${miscChunks.length})` : ''}`,
          items: index === 0 ? ['Link output tambahan:'] : ['Link output tambahan (lanjutan):'],
          links: chunkLinks,
        })
      })
    }

    slides.value = [
      {
        key: 'title',
        type: 'title',
        title: 'Laporan Bulanan Alul',
        subtitle: 'Periode: September 2025',
      },
      {
        key: 'ringkasan',
        type: 'bullets',
        title: 'Statistik Ringkasan',
        items: [
          'Total jobdesk tercatat: 105',
          'Semua jobdesk selesai (baik pada hari H maupun hari berikutnya)',
          'Variasi tugas: pengembangan web, pengajaran, belajar teknologi',
        ],
      },
      {
        key: 'tugas-output',
        type: 'bullets',
        title: 'Tugas & Output Utama',
        items: [
          'Membuat & revisi berbagai homepage dan landing page',
          'Update & optimalisasi homepage dan landing page',
          'Kegiatan belajar coding, VPS, dan digital marketing',
        ],
      },
      {
        key: 'contoh-link',
        type: 'bullets',
        title: 'Daftar Jobdesk & Link Output',
        items: [gwsBullet, alhidayahBullet, zakatBullet, pkbmBullet, ambulanceBullet],
      },
      ...groupedSlides,
      {
        key: 'pengajaran',
        type: 'bullets',
        title: 'Pengajaran & Pengembangan Diri',
        items: [
          'Mengajar sementara kelas RPL SMK IT AL-HIDAYAH (11 hari)',
          'Membuat materi presentasi Web Development',
          'Belajar multi domain, VPS, dan digital marketing',
          'Mengikuti acara keagamaan: Maulid Nabi, distribusi amal, dll.',
        ],
      },
      {
        key: 'evaluasi',
        type: 'bullets',
        title: 'Evaluasi & Catatan',
        items: [
          'Seluruh jobdesk bulanan tercapai',
          'Penataan waktu baik, tugas harian variatif',
          'Tugas dengan status PROSES pasti akan terselesaikan, tidak ada pekerjaan mangkrak',
        ],
      },
      {
        key: 'rekomendasi',
        type: 'bullets',
        title: 'Rekomendasi & Next Step',
        items: [
          'Follow-up progress harian',
          'Jadwalkan review mingguan untuk efisiensi tim',
          'Prioritaskan pengembangan diri & kontribusi sosial/organisasi',
        ],
      },
      {
        key: 'closing',
        type: 'closing',
        title: 'Terima Kasih',
        subtitle: 'Terima kasih atas perhatian dan kolaborasinya — mari bertumbuh dan bermanfaat bersama.',
      },
    ]

    idx.value = Math.min(slides.value.length - 1, Math.max(0, parseHashIndex()))
    writeHashIndex(idx.value)

    loading.value = false
    await animateIn()
  } catch (e) {
    error.value = e?.message || String(e)
    loading.value = false
  }
}

onMounted(() => {
  buildSlides()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <section ref="deckEl" class="deck" @click="next">
    <div v-if="loading" class="center-note">Memuat presentasi...</div>
    <div v-else-if="error" class="center-note">Terjadi kesalahan: {{ error }}</div>

    <div v-else class="slides">
      <div
        v-for="(s, i) in slides"
        :key="s.key"
        class="slide"
        :class="{ active: i === idx }"
        v-show="i === idx"
      >
        <!-- TITLE -->
        <div v-if="s.type === 'title'" class="title-slide">
          <div class="title-block reveal">
            <h1 class="title">{{ s.title }}</h1>
            <p class="subtitle">{{ s.subtitle }}</p>
            <p v-if="s.desc" class="desc">{{ s.desc }}</p>
          </div>
        </div>

        <!-- STATS -->
        <div v-else-if="s.type === 'stats'" class="stats-slide">
          <h2 class="slide-title reveal">{{ s.title }}</h2>
          <div class="stats-grid">
            <div class="stat reveal" v-for="(item, k) in s.items" :key="k">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
          <div v-if="s.note" class="note reveal">{{ s.note }}</div>
        </div>

        <!-- BULLETS -->
        <div v-else-if="s.type === 'bullets'" class="bullet-slide">
          <h2 class="slide-title reveal">{{ s.title }}</h2>
          <ul class="bullet-list">
            <li v-for="(b, k) in s.items" :key="k" class="reveal" v-html="b"></li>
          </ul>
          <ul v-if="s.links && s.links.length" class="link-list">
            <li v-for="(l, k) in s.links" :key="k" class="reveal">
              <a :href="l.href" :title="l.href" target="_blank" rel="noopener">{{ l.text }}</a>
            </li>
          </ul>
        </div>


        <!-- CLOSING -->
        <div v-else-if="s.type === 'closing'" class="closing-slide">
          <div class="title-block reveal">
            <h2 class="title">Terima Kasih</h2>
            <p class="subtitle">Pertanyaan dan Diskusi</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error" class="hud">
      <div class="progress"><div class="bar" :style="{ width: progress + '%' }" /></div>
      <div class="counter">{{ idx + 1 }} / {{ slides.length }}</div>
      <div class="hint">Tekan ← → atau spasi • F untuk fullscreen • Klik untuk lanjut</div>
    </div>
  </section>
</template>

<style scoped>
.deck {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bg, linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1020 100%));
  color: var(--text, #e5e7eb);
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr auto;
}

.center-note {
  display: grid;
  place-items: center;
  font-size: 18px;
  color: var(--text);
}

.slides, .slide {
  width: 100%;
  height: 100%;
}

.slide {
  display: grid;
  place-items: center;
  padding: 40px;
}

/* Title slide */
.title-slide .title-block {
  text-align: center;
  max-width: 900px;
}
.title {
  font-size: 56px;
  margin: 0 0 8px 0;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #60a5fa, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  margin: 0;
  font-size: 20px;
  color: var(--text);
  font-weight: 700;
}
.desc {
  margin: 8px 0 0 0;
  font-size: 18px;
  color: var(--muted, #9ca3af);
}

/* Stats slide */
.stats-slide {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}
.slide-title {
  margin: 0 0 16px 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stat {
  border: 1px solid var(--border, rgba(255,255,255,0.12));
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 18px;
  backdrop-filter: blur(6px);
}
.stat-value {
  font-size: 44px;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.stat-label {
  margin-top: 6px;
  font-size: 14px;
  color: var(--muted, #9ca3af);
}
.note {
  margin-top: 10px;
  font-size: 14px;
  color: var(--muted, #9ca3af);
}

/* Bullets slide */
.bullet-slide {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}
.bullet-list, .link-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}
.link-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 8px;
}
.bullet-list li {
  position: relative;
  padding: 10px 14px 10px 26px;
  border: 1px solid var(--border, rgba(255,255,255,0.12));
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  margin-bottom: 8px;
}
.link-list li {
  position: relative;
  padding: 10px 14px 10px 26px;
  border: 1px solid var(--border, rgba(255,255,255,0.12));
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
}
.bullet-list li::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 16px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, #34d399);
}
.link-list a {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: var(--primary, #60a5fa);
  text-decoration: none;
}

/* Chart slide (kept) */
.chart-slide {
  width: 100%;
  max-width: 1100px;
  padding: 10px;
}

/* HUD */
.hud {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 10px 14px;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 10px;
  align-items: center;
  pointer-events: none;
}
.progress {
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #34d399);
  width: 0%;
}
.counter, .hint, .to-dashboard {
  font-size: 12px;
  color: var(--muted, #9ca3af);
}
.hint { text-align: right; }
.to-dashboard {
  pointer-events: auto;
  text-decoration: none;
  border: 1px solid var(--border, rgba(255,255,255,0.12));
  background: rgba(255,255,255,0.06);
  padding: 6px 10px;
  border-radius: 10px;
}
</style>