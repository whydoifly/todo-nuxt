<template>
  <div class="note-card">
    <h3 class="note-title">{{ note.title }}</h3>
    
    <div class="todos-list">
      <div v-for="todo in displayedTodos" :key="todo.id" class="todo-item">
        <label class="checkbox-container">
          <input type="checkbox" :checked="todo.completed" disabled>
          <span class="checkmark"></span>
          <span :class="{ 'todo-text': true, completed: todo.completed }">{{ todo.text }}</span>
        </label>
      </div>
      
      <div v-if="remainingTodos > 0" class="remaining-todos">
        И ещё {{ remainingTodos }}...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '../types'

// Входные параметры компонента
const props = defineProps<{
  note: Note
}>()

// Вычисляемые свойства
const displayedTodos = computed(() => {
  // Показываем только первые 3 задачи
  return props.note.todos.slice(0, 3)
})

const remainingTodos = computed(() => {
  // Подсчитываем оставшиеся задачи
  return Math.max(0, props.note.todos.length - 3)
})
</script>

<style scoped>
.note-card {
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  margin: 1rem 0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.note-title {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.todo-item {
  margin: 0.75rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 1rem;
  user-select: none;
  color: #444;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 22px;
  width: 22px;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #2196F3;
  border-color: #2196F3;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.todo-text {
  margin-left: 0.5rem;
  flex: 1;
  transition: all 0.2s;
}

.completed {
  text-decoration: line-through;
  color: #999;
}

.remaining-todos {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

/* Hover effects */
.checkbox-container:hover .checkmark {
  border-color: #2196F3;
  background-color: #f5f9ff;
}

.checkbox-container:hover .todo-text:not(.completed) {
  color: #2196F3;
}

/* Mobile optimization */
@media (max-width: 480px) {
  .note-card {
    padding: 1rem;
  }

  .checkbox-container {
    padding-left: 30px;
  }

  .checkmark {
    height: 20px;
    width: 20px;
  }

  .checkmark:after {
    left: 6px;
    top: 2px;
  }
}
</style> 