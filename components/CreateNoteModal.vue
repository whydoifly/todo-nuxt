<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <!-- Заголовок модального окна -->
      <div class="modal-header">
        <h2>Создать новую заметку</h2>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <!-- Форма создания заметки -->
      <div class="modal-body">
        <input 
          v-model="title" 
          type="text" 
          class="title-input"
          placeholder="Введите заголовок заметки"
        >
        
        <!-- Секция задач -->
        <div class="todos-section">
          <div class="todos-header">
            <h3>Задачи</h3>
            <button @click="addTodo" class="add-btn">+ Добавить задачу</button>
          </div>
          
          <div class="todos-list">
            <div v-for="todo in todos" :key="todo.id" class="todo-item">
              <input 
                type="checkbox" 
                v-model="todo.completed"
              >
              <input 
                v-model="todo.text" 
                type="text" 
                class="todo-input"
                placeholder="Текст задачи"
              >
              <button @click="removeTodo(todo.id)" class="delete-btn">×</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="cancel-btn">Отмена</button>
        <button 
          @click="createNote" 
          class="create-btn"
          :disabled="!title.trim()"
        >
          Создать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '../composables/useStorage'

// Определение входных параметров
defineProps<{
  isOpen: boolean
}>()

// Определение событий
const emit = defineEmits<{
  close: []
}>()

const { addNote } = useStorage()
const title = ref('')
const todos = ref<Array<{ id: number; text: string; completed: boolean }>>([])

const addTodo = () => {
  todos.value.push({
    id: Date.now(),
    text: '',
    completed: false
  })
}

const removeTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}

const createNote = () => {
  if (!title.value.trim()) return

  const newNote = {
    id: Date.now(),
    title: title.value.trim(),
    todos: todos.value
  }

  addNote(newNote)
  closeModal()
}

const closeModal = () => {
  title.value = ''
  todos.value = []
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.title-input {
  width: 100%;
  font-size: 1.2rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-body {
  margin: 1.5rem 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  background: #f0f0f0;
}

.create-btn {
  background: #2196F3;
  color: white;
}

.create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.todos-section {
  margin: 2rem 0;
}

.todos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.todo-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Updated button styles to match website */
.add-btn, .create-btn, .cancel-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-btn {
  background: #4CAF50;
  color: white;
}

.create-btn {
  background: #2196F3;
  color: white;
}

.cancel-btn {
  background: #666;
  color: white;
}

.delete-btn {
  background: none;
  border: none;
  color: #f44336;
  font-size: 1.2rem;
  padding: 0 0.5rem;
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Match website's input styles */
.title-input, .todo-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.title-input {
  font-size: 1.5rem;
}

/* Responsive styles */
@media (max-width: 768px) {
  .modal {
    width: 95%;
    padding: 1rem;
    margin: 1rem;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .title-input {
    font-size: 1.2rem;
  }

  .todo-item {
    flex-wrap: wrap;
  }

  .todo-input {
    min-width: 200px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .modal-footer button {
    width: 100%;
  }
}
</style> 