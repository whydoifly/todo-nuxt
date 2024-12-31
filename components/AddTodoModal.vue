<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>Новая задача</h3>
        <button @click="closeModal" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <textarea 
          v-model="todoText"
          class="todo-input"
          placeholder="Введите текст задачи"
          ref="inputRef"
          rows="3"
        ></textarea>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="cancel-btn">Отмена</button>
        <button 
          @click="saveTodo"
          class="save-btn"
          :disabled="!todoText.trim()"
        >
          Добавить
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AddTodoModal'
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [todo: { id: number, text: string, completed: boolean }]
}>()

const todoText = ref('')
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  if (props.isOpen) {
    inputRef.value?.focus()
  }
})

const saveTodo = () => {
  if (!todoText.value.trim()) return
  
  emit('save', {
    id: Date.now(),
    text: todoText.value.trim(),
    completed: false
  })
  closeModal()
}

const closeModal = () => {
  todoText.value = ''
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
  padding: 1rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 100px;
  margin: 0.5rem 0;
}

.todo-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: none;
  min-height: 80px;
  font-family: inherit;
}

.modal-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.save-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background: #2196F3;
  color: white;
}

.cancel-btn {
  background: #666;
  color: white;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile styles */
@media (max-width: 480px) {
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: none;
    border-radius: 0;
    max-height: 100vh;
  }

  .modal-footer {
    padding: 0.5rem;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }

  .modal-footer button {
    flex: 1;
    padding: 0.75rem;
  }
}
</style> 