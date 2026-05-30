<template>
  <div id="app">
    <header>
      <h1>Field Scout</h1>
      <div class="status-bar" :class="isOnline ? 'bg-green' : 'bg-red'">
        {{ isOnline ? 'Tryb Online' : 'Tryb Offline — dane zapisywane lokalnie' }}
      </div>
    </header>

    <main>
      <LocationLogger />
    </main>

    <footer>
      <p>Konwersatorium Terenowe — PWA &amp; Vue.js</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LocationLogger from './components/LocationLogger.vue'

const isOnline = ref(navigator.onLine)

const updateStatus = () => { isOnline.value = navigator.onLine }

onMounted(() => {
  window.addEventListener('online',  updateStatus)
  window.addEventListener('offline', updateStatus)
})
onUnmounted(() => {
  window.removeEventListener('online',  updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<style>
:root {
  --p-color: #42b883;
  --s-color: #35495e;
}
body {
  margin: 0;
  font-family: sans-serif;
  background: #f4f4f4;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
header {
  background: var(--s-color);
  color: white;
  padding: 1rem;
  text-align: center;
}
header h1 { margin: 0 0 0.5rem; font-size: 1.4rem; }
.status-bar {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
  transition: background 0.3s;
}
.bg-green { background: #2ecc71; }
.bg-red   { background: #e74c3c; }
main { flex: 1; padding: 1rem; max-width: 600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
footer { font-size: 0.7rem; text-align: center; padding: 1rem; color: #999; }
</style>
