<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Редактировать задачу' : 'Новая задача' }}</h3>
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
          {{ isEditing ? 'Сохранить' : 'Добавить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TodoFormModal'
}
</script>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
  initialText?: string
  isEditing?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [todo: { id: number, text: string, completed: boolean }]
}>()

const todoText = ref(props.initialText || '')

// Update text when initialText changes
watch(() => props.initialText, (newText) => {
  if (newText !== undefined) {
    todoText.value = newText
  }
})

const inputRef = ref<HTMLTextAreaElement>()

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
  todoText.value = props.initialText || ''
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  margin: 0.5rem 0;
  min-height: 120px;
}

.todo-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: none;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.todo-input:focus {
  outline: none;
  border-color: #2196F3;
}

.modal-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.save-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.save-btn {
  background: #2196F3;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #1976D2;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Mobile styles */
@media (max-width: 480px) {
  .modal {
    position: fixed;
    top: 30px;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: none;
    border-radius: 0;
    padding: 1rem;
    animation: slideUp 0.3s ease-out;
  }

  .modal-header {
    padding-bottom: 0.75rem;
  }

  .modal-header h3 {
    font-size: 1.2rem;
  }

  .modal-footer {
    padding: 0.75rem;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }

  .modal-footer button {
    flex: 1;
    padding: 0.75rem;
  }

  .todo-input {
    font-size: 1rem;
    padding: 0.75rem;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style> 