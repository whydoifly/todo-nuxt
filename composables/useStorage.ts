import { ref, watch } from 'vue'
import type { Note } from '~/types'

// Создаем единственный экземпляр хранилища
const notesRef = ref<Note[]>([])
let initialized = false

export function useStorage() {
  const initializeStorage = () => {
    if (!initialized && process.client) {
      const stored = localStorage.getItem('notes')
      notesRef.value = stored ? JSON.parse(stored) : []
      initialized = true
    }
  }

  // Сохраняем изменения в localStorage
  watch(notesRef, (newNotes) => {
    if (process.client) {
      localStorage.setItem('notes', JSON.stringify(newNotes))
    }
  }, { deep: true })

  // CRUD операции
  const addNote = (note: Note) => {
    notesRef.value.unshift(note)
  }

  const updateNote = (updatedNote: Note) => {
    const index = notesRef.value.findIndex(n => n.id === updatedNote.id)
    if (index !== -1) {
      notesRef.value[index] = updatedNote
    }
  }

  const deleteNote = (id: string | number) => {
    notesRef.value = notesRef.value.filter(note => note.id !== id)
  }

  return {
    notes: notesRef,
    initializeStorage,
    addNote,
    updateNote,
    deleteNote
  }
} 