<template>
  <div class="logger">

    <section class="controls">
      <button @click="getLocation" :disabled="gpsLoading">
        {{ gpsLoading ? 'Pobieranie GPS...' : 'Pobierz lokalizację GPS' }}
      </button>

      <div v-if="coords" class="coords-box">
        <p>Szerokość: {{ coords.latitude.toFixed(6) }}</p>
        <p>Długość: {{ coords.longitude.toFixed(6) }}</p>
        <p>Dokładność: ±{{ Math.round(coords.accuracy) }} m</p>
      </div>

      <textarea
        v-model="note"
        placeholder="Opisz co widzisz w terenie..."
        rows="4"
      ></textarea>

      <button @click="saveNote" class="btn-save" :disabled="!note || !coords">
        Zapisz obserwację
      </button>
    </section>

    <section class="history">
      <h3>Twoje obserwacje ({{ logs.length }})</h3>

      <p v-if="logs.length === 0" class="empty">
        Brak obserwacji. Pobierz lokalizację i dodaj pierwszą notatkę.
      </p>

      <ul>
        <li
          v-for="item in logs"
          :key="item.id"
          :class="{ 'pending': item.pending }"
        >
          <div class="log-header">
            <strong>{{ item.time }}</strong>
            <span v-if="item.pending" class="badge-pending">oczekuje na sync</span>
            <button class="btn-delete" @click="removeLog(item.id)">usuń</button>
          </div>
          <small class="coords">{{ item.lat.toFixed(6) }}, {{ item.lng.toFixed(6) }}</small>
          <p>{{ item.content }}</p>
        </li>
      </ul>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLogs, addLog, deleteLog } from '../db.js'

const coords   = ref(null)
const gpsLoading = ref(false)
const note     = ref('')
const logs     = ref([])

onMounted(async () => {
  logs.value = await getLogs()
})

function getLocation() {
  if (!navigator.geolocation) {
    alert('Geolokalizacja nie jest wspierana przez tę przeglądarkę.')
    return
  }
  gpsLoading.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      coords.value = position.coords
      gpsLoading.value = false
    },
    (err) => {
      alert('Błąd GPS: ' + err.message)
      gpsLoading.value = false
    }
  )
}

async function saveNote() {
  const newLog = {
    time:    new Date().toLocaleString('pl-PL'),
    lat:     coords.value.latitude,
    lng:     coords.value.longitude,
    content: note.value,
    pending: true,
  }

const tempId = 'temp-' + Date.now()
  logs.value.unshift({ ...newLog, id: tempId })
  note.value = ''

  try {
    const realId = await addLog({ ...newLog, pending: false })
    const idx = logs.value.findIndex(l => l.id === tempId)
    if (idx !== -1) {
      logs.value[idx] = { ...newLog, id: realId, pending: false }
    }
  } catch (err) {
    logs.value = logs.value.filter(l => l.id !== tempId)
    note.value = newLog.content
    alert('Błąd zapisu: ' + err.message)
  }
}

async function removeLog(id) {
  const snapshot = [...logs.value]
  logs.value = logs.value.filter(l => l.id !== id)
  try {
    await deleteLog(id)
  } catch {
    logs.value = snapshot
  }
}
</script>

<style scoped>
.logger { display: flex; flex-direction: column; gap: 1rem; }

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

button {
  padding: 12px;
  background: var(--p-color);
  border: none;
  color: white;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
button:disabled { background: #ccc; cursor: default; }

textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
}

.coords-box {
  font-family: monospace;
  font-size: 0.85rem;
  background: #eef;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
}
.coords-box p { margin: 2px 0; }

/* Historia obserwacji */
.history ul { list-style: none; padding: 0; margin: 0; }
.history li {
  background: white;
  margin-bottom: 0.5rem;
  padding: 10px;
  border-left: 4px solid var(--p-color);
  border-radius: 0 4px 4px 0;
  font-size: 0.9rem;
}

/* Wpis oczekujący na zapis (Optimistic UI) */
.history li.pending {
  border-left-color: #f39c12;
  opacity: 0.8;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 4px;
}

.coords { color: #888; font-family: monospace; font-size: 0.8rem; }

.badge-pending {
  font-size: 0.7rem;
  background: #f39c12;
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
}

.btn-delete {
  margin-left: auto;
  padding: 2px 8px;
  font-size: 0.75rem;
  background: #e74c3c;
  font-weight: normal;
}

.empty { color: #999; font-style: italic; text-align: center; padding: 1rem; }
</style>
