# Todo App

## Запуск приложения через Docker

### Предварительные требования

- Установленный Docker
- Установленный Docker Compose

### Шаги по запуску

1. Клонируйте репозиторий:

```bash
git clone <url-репозитория>
cd todo
```

2. Создайте и запустите контейнеры:

```bash
docker-compose up --build
```

После успешного запуска приложение будет доступно по адресу: `http://localhost:3000`

### Дополнительные команды

- Остановить приложение:

```bash
docker-compose down
```

- Просмотр логов:

```bash
docker-compose logs
```

- Перезапуск приложения:

```bash
docker-compose restart
```

### Разработка

Для локальной разработки без Docker:

1. Установите зависимости:

```bash
npm install
```

2. Запустите сервер разработки:

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

### Возможные проблемы

1. Если порт 3000 занят, измените его в `docker-compose.yaml`:

```yaml
ports:
  - '3001:3000' # Или любой другой свободный порт
```

2. При проблемах с правами доступа используйте sudo (для Linux/MacOS):

```bash
sudo docker-compose up --build
```

### Структура проекта

- `components/` - Vue компоненты
- `pages/` - Страницы приложения
- `composables/` - Композабл функции
- `types/` - TypeScript типы
- `Dockerfile` - Конфигурация Docker образа
- `docker-compose.yaml` - Конфигурация Docker Compose
