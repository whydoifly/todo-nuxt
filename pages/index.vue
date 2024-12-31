<template>
  <div class="container">
    <div class="header">
      <h1>Мои заметки</h1>
      <button @click="showCreateModal = true" class="create-btn">+ Новая заметка</button>
    </div>
    <div class="notes-grid">
      <div v-for="note in notes" :key="note.id" class="note-wrapper">
        <NoteCard :note="note" />
        <div class="actions">
          <button @click="editNote(note.id)" class="edit-btn">Редактировать</button>
          <button @click="confirmDelete(note.id)" class="delete-btn">Удалить</button>
        </div>
      </div>
    </div>

    <CreateNoteModal 
      :is-open="showCreateModal" 
      @close="showCreateModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'nuxt/app'
import { useStorage } from '../composables/useStorage'

const router = useRouter()
const { notes, deleteNote, initializeStorage } = useStorage()
const showCreateModal = ref(false)

const editNote = (id: number) => {
  router.push(`/note/${id}`)
}

const confirmDelete = (id: number) => {
  if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
    deleteNote(id)
  }
}

// Инициализация хранилища при загрузке компонента
onMounted(() => {
  initializeStorage()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.notes-grid {
  display: grid;
  gap: 1rem;
}

.note-wrapper {
  position: relative;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background: #2196F3;
  color: white;
}

.delete-btn {
  background: #f44336;
  color: white;
}
</style> 