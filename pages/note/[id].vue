<template>
    <div class="container">
      <div class="header">
        <button @click="confirmCancel" class="back-button">← На главную</button>
        <div class="actions">
          <div class="change-actions">
            <button @click="undoLastChange" class="undo-btn" :disabled="!canUndo">
              <span class="icon">↺</span> Отменить
            </button>
            <button @click="redoLastChange" class="redo-btn" :disabled="!canRedo">
              <span class="icon">↻</span> Повторить
            </button>
            <button @click="saveChanges" class="save-btn" :disabled="!hasChanges">
              <span class="icon">✓</span> Сохранить
            </button>
          </div>
          <button @click="confirmDelete" class="delete-btn">Удалить заметку</button>
        </div>
      </div>
      
      <div v-if="note" class="note-edit">
        <!-- Title section with edit mode -->
        <div class="title-section">
          <!-- View mode -->
          <div v-if="!isTitleEditing" class="title-view">
            <h1>{{ note.title }}</h1>
            <button @click="startTitleEditing" class="edit-btn">Edit</button>
          </div>
          
          <!-- Edit mode -->
          <div v-else class="title-edit">
            <input 
              v-model="titleEditText"
              class="title-input" 
              type="text"
              @input="handleTextChange"
            >
            <div class="title-actions">
              <button @click="saveTitleEdit" class="save-btn">Сохранить</button>
              <button @click="cancelTitleEdit" class="cancel-btn">Отмена</button>
            </div>
          </div>
        </div>
        
        <div class="todos-section">
          <div class="todos-header">
            <h2>Список задач</h2>
            <button @click="showAddTodoModal" class="add-btn">+ Добавить задачу</button>
          </div>
          
          <div class="todos-list">
            <div v-for="todo in note.todos" :key="todo.id" class="todo-item">
              <label class="checkbox-container">
                <input 
                  type="checkbox" 
                  :checked="todo.completed"
                  @change="handleCheckboxChange(todo)"
                >
                <span class="checkmark"></span>
              </label>
              
              <!-- View mode -->
              <div v-if="!todo.isEditing" class="todo-view">
                <span :class="{ completed: todo.completed }">{{ todo.text }}</span>
                <div class="todo-actions">
                  <button @click="startEditing(todo)" class="edit-btn">Ред.</button>
                  <button @click="confirmDeleteTodo(todo.id)" class="delete-todo-btn">×</button>
                </div>
              </div>
              
              <!-- Edit mode -->
              <div v-else class="todo-edit">
                <input 
                  v-model="todo.editText"
                  type="text" 
                  class="todo-input"
                  @input="handleTextChange"
                >
                <div class="todo-actions">
                  <button @click="saveTodoEdit(todo)" class="save-btn">Сохранить</button>
                  <button @click="cancelTodoEdit(todo)" class="cancel-btn">Отмена</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TodoFormModal
        :is-open="isAddTodoModalOpen"
        @close="isAddTodoModalOpen = false"
        @save="handleAddTodo"
      />
      <TodoFormModal
        :is-open="isEditModalOpen"
        :initial-text="editingTodo?.text"
        :is-editing="true"
        @close="handleEditModalClose"
        @save="handleEditTodo"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter, onBeforeRouteLeave } from 'nuxt/app'
  import { Note } from '../../types'
  import { useStorage } from '../../composables/useStorage'
  import TodoFormModal from '../../components/TodoFormModal.vue'
  
  const route = useRoute()
  const router = useRouter()
  const { notes, updateNote, deleteNote, initializeStorage } = useStorage()
  
  // Инициализация хранилища и заметки
  const initialNote = ref<Note | null>(null)
  const history = ref<Note[]>([])
  const currentHistoryIndex = ref(-1)
  const hasUnsavedChanges = ref(false)
  const maxHistorySize = 10
  const maxHistoryIndex = ref(-1)
  let debounceTimeout: NodeJS.Timeout | null = null
  
  // Добавляем refs для редактирования заголовка
  const isTitleEditing = ref(false)
  const titleEditText = ref('')
  
  const isAddTodoModalOpen = ref(false)
  const isEditModalOpen = ref(false)
  const editingTodo = ref<any>(null)
  
  function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }
  
  onMounted(async () => {
    initializeStorage()
    
    const id = parseInt(route.params.id as string)
    const foundNote = notes.value.find(n => n.id === id)
    
    if (foundNote) {
      const initialState = deepClone(foundNote)
      history.value = [initialState]
      currentHistoryIndex.value = 0
    } else {
      alert('Note not found')
      router.push('/')
    }
  })
  
  // Update note computed to handle two-way binding
  const note = computed({
    get: () => {
      return history.value[currentHistoryIndex.value] || null
    },
    set: (newValue) => {
      if (!newValue) return
      history.value[currentHistoryIndex.value] = deepClone(newValue)
    }
  })
  
  const hasChanges = computed(() => {
    return hasUnsavedChanges.value || currentHistoryIndex.value > 0
  })
  
  const canUndo = computed(() => {
    return history.value.length > 1 && currentHistoryIndex.value > 0
  })
  
  const canRedo = computed(() => 
    currentHistoryIndex.value < maxHistoryIndex.value
  )
  
  // Отслеживаем изменения текста без сохранения в историю
  const handleTextChange = () => {
    if (!note.value) return
    hasUnsavedChanges.value = true
  }
  
  // Сохраняем в историю когда пользователь закончил редактирование текста
  const handleTextBlur = () => {
    if (!note.value || !hasUnsavedChanges.value) return
    
    // Создаем новое состояние для изменений текста
    const newState = deepClone(note.value)
    addToHistory(newState)
    hasUnsavedChanges.value = false
  }
  
  // Отслеживаем немедленные изменения (чекбоксы, удаление, добавление)
  const trackImmediateChange = () => {
    if (!note.value) return
    hasUnsavedChanges.value = true
    addToHistory(deepClone(note.value))
  }
  
  // Действия
  const saveChanges = () => {
    if (!note.value) return
    if (confirm('Сохранить изменения?')) {
      updateNote(deepClone(note.value))
      hasUnsavedChanges.value = false
      
      // Reset history and indices after saving
      history.value = [deepClone(note.value)]
      currentHistoryIndex.value = 0
      maxHistoryIndex.value = 0  // Reset max history index to disable redo
    }
  }
  
  const confirmCancel = () => {
    if (!hasUnsavedChanges.value || confirm('Отменить несохраненные изменения?')) {
      router.back()
    }
  }
  
  const confirmDelete = () => {
    if (confirm('Удалить эту заметку? Это действие нельзя отменить.')) {
      if (note.value) {
        deleteNote(note.value.id)
        router.push('/')
      }
    }
  }
  
  // Todo actions
  const addTodo = () => {
    if (!note.value) return
    const newTodo = {
      id: Date.now(),
      text: '',
      editText: '',
      completed: false,
      isEditing: true
    }
    const updatedNote = deepClone(note.value)
    updatedNote.todos.push(newTodo)
    addToHistory(updatedNote)
  }
  
  const confirmDeleteTodo = (todoId: number) => {
    if (confirm('Удалить эту задачу?')) {
      deleteTodo(todoId)
    }
  }
  
  const deleteTodo = (todoId: number) => {
    if (!note.value) return
    const updatedNote = deepClone(note.value)
    updatedNote.todos = updatedNote.todos.filter(t => t.id !== todoId)
    addToHistory(updatedNote)
  }
  
  // Добавляем состояние в историю
  const addToHistory = (state: Note) => {
    // Удаляем будущие состояния если мы не в конце
    history.value = history.value.slice(0, currentHistoryIndex.value + 1)
    history.value.push(state)
    currentHistoryIndex.value = history.value.length - 1
    maxHistoryIndex.value = currentHistoryIndex.value
  }
  
  const undoLastChange = () => {
    if (currentHistoryIndex.value > 0) {
      currentHistoryIndex.value--
      // Update v-model binding
      note.value = deepClone(history.value[currentHistoryIndex.value])
      hasUnsavedChanges.value = true
    }
  }
  
  const redoLastChange = () => {
    if (currentHistoryIndex.value < maxHistoryIndex.value) {
      currentHistoryIndex.value++
      // Update v-model binding
      note.value = deepClone(history.value[currentHistoryIndex.value])
      hasUnsavedChanges.value = true
    }
  }
  
  // Защита навигации
  onBeforeRouteLeave((to, from, next) => {
    if (!hasUnsavedChanges.value || confirm('You have unsaved changes. Are you sure you want to leave?')) {
      next()
    } else {
      next(false)
    }
  })
  
  // Update checkbox handling
  const handleCheckboxChange = (todo: { id: number, completed: boolean, text: string }) => {
    if (!note.value) return
    
    // Create new state with updated checkbox
    const updatedNote = deepClone(note.value)
    const todoToUpdate = updatedNote.todos.find(t => t.id === todo.id)
    if (todoToUpdate) {
      todoToUpdate.completed = !todoToUpdate.completed
      addToHistory(updatedNote)
    }
  }
  
  // Функции для редактирования задач
  const startEditing = (todo: any) => {
    if (window.innerWidth <= 480) {
      editingTodo.value = todo
      isEditModalOpen.value = true
    } else {
      todo.isEditing = true
      todo.editText = todo.text
      hasUnsavedChanges.value = true
    }
  }
  
  const saveTodoEdit = (todo: any) => {
    const updatedNote = deepClone(note.value)
    const todoToUpdate = updatedNote.todos.find(t => t.id === todo.id)
    if (todoToUpdate) {
      todoToUpdate.text = todo.editText
      todoToUpdate.isEditing = false
      addToHistory(updatedNote)
    }
    todo.isEditing = false
  }
  
  const cancelTodoEdit = (todo: any) => {
    if (hasUnsavedChanges.value && !confirm('Отменить изменения?')) {
      return
    }
    todo.isEditing = false
    todo.editText = todo.text
    hasUnsavedChanges.value = false
  }
  
  // Функции для редактирования заголовка
  const startTitleEditing = () => {
    isTitleEditing.value = true
    titleEditText.value = note.value?.title || ''
    hasUnsavedChanges.value = true
  }
  
  const saveTitleEdit = () => {
    if (!note.value) return
    
    const updatedNote = deepClone(note.value)
    updatedNote.title = titleEditText.value
    addToHistory(updatedNote)
    
    isTitleEditing.value = false
    hasUnsavedChanges.value = false
  }
  
  const cancelTitleEdit = () => {
    isTitleEditing.value = false
    titleEditText.value = note.value?.title || ''
    hasUnsavedChanges.value = false
  }
  
  const showAddTodoModal = () => {
    if (window.innerWidth <= 480) {
      isAddTodoModalOpen.value = true
    } else {
      addTodo()
    }
  }
  
  const handleAddTodo = (todo: { id: number, text: string, completed: boolean }) => {
    if (!note.value) return
    const updatedNote = deepClone(note.value)
    updatedNote.todos.push({
      ...todo,
      editText: todo.text,
      isEditing: false
    })
    addToHistory(updatedNote)
  }
  
  // Add handler for modal edit save
  const handleEditTodo = (updatedTodo: { text: string }) => {
    if (!note.value || !editingTodo.value) return
    const updatedNote = deepClone(note.value)
    const todoToUpdate = updatedNote.todos.find(t => t.id === editingTodo.value.id)
    if (todoToUpdate) {
      todoToUpdate.text = updatedTodo.text
      addToHistory(updatedNote)
    }
    editingTodo.value = null
  }
  
  // For mobile modal
  const handleEditModalClose = () => {
    if (hasUnsavedChanges.value && !confirm('Отменить изменения?')) {
      return
    }
    isEditModalOpen.value = false
    editingTodo.value = null
  }
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
  
  .actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .change-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .back-button, .undo-btn, .redo-btn {
    padding: 0.5rem 1rem;
    border: none;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .title-input {
    width: 100%;
    font-size: 1.5rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
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
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .add-btn {
    background: #4CAF50;
    color: white;
  }
  
  .save-btn {
    background: #2196F3;
    color: white;
  }
  
  .delete-btn {
    background: #f44336;
    color: white;
  }
  
  .delete-todo-btn {
    background: none;
    border: none;
    color: #f44336;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 0.5rem;
  }
  
  .add-btn, .save-btn, .delete-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  [disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .icon {
    font-size: 1.1em;
  }
  
  .todo-view, .todo-edit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
  }
  
  .todo-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .completed {
    text-decoration: line-through;
    color: #666;
  }
  
  .edit-btn {
    background: #2196F3;
    color: white;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .cancel-btn {
    background: #666;
    color: white;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .title-section {
    margin-bottom: 2rem;
  }
  
  .title-view {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .title-view h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .title-edit {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .title-input {
    flex: 1;
    font-size: 1.5rem;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .title-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
    }

    .actions {
      flex-direction: column;
      width: 100%;
    }

    .change-actions {
      width: 100%;
      justify-content: space-between;
    }

    .change-actions button {
      flex: 1;
      font-size: 0.9rem;
      padding: 0.5rem;
    }

    .delete-btn {
      width: 100%;
    }

    .todo-item {
      flex-wrap: wrap;
    }

    .todo-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .title-edit {
      flex-direction: column;
      gap: 0.5rem;
    }

    .title-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  /* Additional improvements for very small screens */
  @media (max-width: 480px) {
    .change-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .todo-actions button {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }
  }

  /* Add the same checkbox styles as in NoteCard.vue */
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