# API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Все защищённые эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## Endpoints by CRUD

All paths are relative to the base URL. Protected endpoints require `Authorization: Bearer <token>`.

### CREATE (POST)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (email, password). Returns user; login after to get token. |
| POST | `/auth/login` | Login. Returns JWT `access_token` and `token_type`. |
| POST | `/habits/` | Create habit (name, type, frequency, schedule, goal, color, etc.). Returns created habit with streak. |
| POST | `/habits/{habit_id}/archive` | Archive habit (set `archived: true`). |
| POST | `/checkins/` | Create or update check-in for a habit on a date (habit_id, date, completed, value, skipped). Upserts by user+habit+date; updates streak. |

### READ (GET)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Current user (id, email, settings). Requires JWT. |
| GET | `/habits/` | List user habits. Query: `archived`, `as_of_date`. Sorted by order, includes current_streak. |
| GET | `/habits/{habit_id}` | Single habit by id (with streak). |
| GET | `/checkins/` | List check-ins. Query: `habit_id`, `start_date`, `end_date`. |
| GET | `/checkins/today` | Check-ins for today. |
| GET | `/checkins/day-completion` | For date range: per day, whether all scheduled habits were completed. Query: `start_date`, `end_date`. |
| GET | `/analytics/habits/{habit_id}` | Analytics for one habit: completion rate, streaks, check-ins. Query: `days` (default 30). |
| GET | `/analytics/heatmap` | Heatmap: count of completed check-ins per day. Query: `days` (default 365). |
| GET | `/analytics/completion-by-habit` | Completed count per habit in period. Query: `days` (default 30). |
| GET | `/analytics/insights` | Dashboard: week summary, perfect days, best streak, tips, habit insights. |

### UPDATE (PUT / PATCH)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/habits/{habit_id}` | Update habit (partial update via Pydantic exclude_unset). |
| PATCH | `/habits/{habit_id}/order` | Change habit order. Query: `order` (int). |

Check-in update is done via POST `/checkins/` (upsert by user+habit+date).

### DELETE

| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/habits/{habit_id}` | Delete habit and its check-ins and streaks. |
| DELETE | `/checkins/{checkin_id}` | Delete one check-in; updates habit total_completions and streak. |

### Other (non-CRUD)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root: SPA index or `{"message": "Habitify Clone API"}`. |
| GET | `/{path}` | SPA fallback (serve frontend). |

---

## Endpoints (detailed)

### Auth

#### POST /auth/register

Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "settings": {
    "theme": "light",
    "notifications_enabled": true
  }
}
```

#### POST /auth/login

Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

#### GET /auth/me

Получение информации о текущем пользователе.

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "settings": {
    "theme": "light",
    "notifications_enabled": true
  }
}
```

### Habits

#### GET /habits

Получение списка привычек.

**Query Parameters:**
- `archived` (boolean, optional): Фильтр по архивированным привычкам

**Response:**
```json
[
  {
    "id": "habit_id",
    "user_id": "user_id",
    "name": "Drink water",
    "type": "positive",
    "frequency": "daily",
    "color": "#3B82F6",
    "order": 0,
    "archived": false
  }
]
```

#### POST /habits

Создание новой привычки.

**Request:**
```json
{
  "name": "Drink water",
  "type": "positive",
  "frequency": "daily",
  "start_date": "2024-01-01T00:00:00",
  "color": "#3B82F6"
}
```

#### PUT /habits/{id}

Обновление привычки.

#### DELETE /habits/{id}

Удаление привычки.

#### POST /habits/{id}/archive

Архивация привычки.

### Checkins

#### POST /checkins

Создание чек-ина.

**Request:**
```json
{
  "habit_id": "habit_id",
  "date": "2024-01-01",
  "completed": true
}
```

#### GET /checkins/today

Получение чек-инов на сегодня.

#### DELETE /checkins/{id}

Удаление чек-ина.

### Analytics

#### GET /analytics/habits/{id}

Аналитика по конкретной привычке.

**Query Parameters:**
- `days` (int, optional): Количество дней для анализа (по умолчанию 30)

#### GET /analytics/heatmap

Тепловая карта активности.

**Query Parameters:**
- `days` (int, optional): Количество дней (по умолчанию 365)

#### GET /analytics/insights

Инсайты и паттерны.
