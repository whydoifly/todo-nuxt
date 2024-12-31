// Интерфейс для задачи
export interface Todo {
  id: number; // Идентификатор задачи
  text: string; // Текст задачи
  editText?: string; // Текст при редактировании
  completed: boolean; // Статус выполнения
  isEditing?: boolean; // Режим редактирования
}

// Интерфейс для заметки
export interface Note {
  id: number; // Идентификатор заметки
  title: string; // Заголовок заметки
  todos: Todo[]; // Массив задач
} 