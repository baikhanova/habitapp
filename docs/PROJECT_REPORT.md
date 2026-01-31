# Final Project Report  
**Course:** Advanced Databases (NoSQL)  
**Project:** HabitTracker — Habit Tracking Web Application

Below is a concise report that answers the required criteria: overview, architecture, database, API, indexing, and contribution.

---

## 1. Project Overview

The project is a **web application** for tracking habits. Users can register, log in, create habits, mark daily check-ins, and view analytics (streaks, heatmap, insights).

- **Format:** Web app only (frontend + backend).
- **Stack:** Backend — FastAPI, MongoDB (Motor). Frontend — React, TypeScript, Vite, Redux, Tailwind.
- **Database:** MongoDB as the only database.
- **Team:** 2 students.

The app meets the course requirements: it is a web application, uses MongoDB, has both backend and frontend, and implements real business logic (habits, check-ins, streaks, analytics).

---

## 2. System Architecture

**High-level flow:**  
Browser → React SPA → Axios (HTTP) → FastAPI backend → Motor (async MongoDB) → MongoDB.

- **Frontend:** React 18 + TypeScript, Vite, Redux Toolkit, React Router. UI: Tailwind CSS, Radix/shadcn-style components. Structure: FSD (app, shared, entities, features, widgets, pages). All API calls go through a single Axios instance with JWT in `Authorization` header.
- **Backend:** FastAPI app, routers under `/api/v1` (auth, habits, checkins, analytics). Business logic in services (e.g. streak calculation, schedule rules). Auth: JWT; protected routes use `get_current_user` dependency.
- **Database:** One MongoDB database (`habittracker`). Collections: `users`, `habits`, `checkins`, `streaks`. Relations by reference (`user_id`, `habit_id`). Embedded documents used where it fits (e.g. `user.settings`, `habit.schedule`, `habit.goal`).

**Data flow examples:**  
- Login: POST `/api/v1/auth/login` → check user in `users` → return JWT.  
- List habits: GET `/api/v1/habits` → find in `habits` by `user_id` → for each habit, optionally compute streak from `checkins`/`streaks` → return list.  
- Check-in: POST `/api/v1/checkins` → insert/update `checkins` → update `streaks` (via streak service).

---

## 3. Database Schema Description

**Collections and relations:**

| Collection   | Purpose                         | Relations / embedding |
|-------------|----------------------------------|------------------------|
| **users**   | Accounts and profile             | Embedded: `settings` (theme, notifications). |
| **habits**  | User’s habits                    | Reference: `user_id` → users. Embedded: `schedule`, `goal`. |
| **checkins**| Daily completions per habit      | References: `user_id`, `habit_id`. |
| **streaks** | Current/best streak per habit    | References: `user_id`, `habit_id`. |

**Embedded vs referenced:**

- **Embedded:** `users.settings`, `habits.schedule`, `habits.goal` (small, always used with the parent document).
- **Referenced:** Habits → user; checkins → user and habit; streaks → user and habit. This keeps collections normalized and allows flexible querying (e.g. all checkins for a user or for a habit).

**Main fields (short):**

- **users:** `_id`, `email`, `password_hash`, `created_at`, `settings` (object).
- **habits:** `_id`, `user_id`, `name`, `type`, `frequency`, `schedule`, `time_of_day`, `start_date`, `goal`, `color`, `icon`, `category`, `order`, `archived`, `created_at`.
- **checkins:** `_id`, `user_id`, `habit_id`, `date`, `completed`, `value`, `skipped`, `created_at`.
- **streaks:** `_id`, `user_id`, `habit_id`, `current_streak`, `best_streak`, `last_checkin_date`, `updated_at`.

Detailed schemas with example JSON are in `docs/database.md`.

---

## 4. MongoDB Queries (Examples Used in the Project)

The app uses **Motor** with CRUD, **aggregation pipelines**, and advanced update operators.

**Aggregation:** Heatmap and completion-by-habit use `db.checkins.aggregate([...])` with multiple stages (`$match`, `$group`, `$project`; completion-by-habit also uses `$lookup`, `$unwind`). See `docs/database.md` for pipeline examples.

**CRUD and updates:**

- **Create:** `db.users.insert_one(user_dict)`, `db.habits.insert_one(habit_dict)`, `db.checkins.insert_one(checkin_dict)`.
- **Read:**  
  - Habits: `db.habits.find({"user_id": ObjectId(uid), "archived": False}).sort("order", 1)`.  
  - Checkins for range: `db.checkins.find({"user_id": uid, "date": {"$gte": start_dt, "$lte": end_dt}})`.  
  - Single habit: `db.habits.find_one({"_id": ObjectId(habit_id), "user_id": ObjectId(uid)})`.
- **Update:**  
  - `db.habits.update_one({"_id": id}, {"$set": update_data})`, and `{"$inc": {"total_completions": 1}}` when a check-in is completed (in `checkins.py`).  
  - `db.streaks.update_one({...}, {"$set": {...}})`.  
  - Checkin upsert: `db.checkins.update_one({...}, {"$set": update_data})` when a checkin for that day already exists.
- **Delete:**  
  - `db.habits.delete_one({"_id": id, "user_id": uid})`.  
  - Cascade: `db.checkins.delete_many({"habit_id": id})`, `db.streaks.delete_many({"habit_id": id})`.  
  - `db.checkins.delete_one({"_id": id, "user_id": uid})`.

Other analytics (insights, per-habit analytics) use `find()` and Python where appropriate; heatmap and completion-by-habit are aggregation-based.

---

## 5. API Documentation

**Base URL:** `http://localhost:8000/api/v1`  
**Auth:** Protected routes need header: `Authorization: Bearer <access_token>`.

**Endpoints (summary):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /auth/register | Register (email, password) |
| POST   | /auth/login     | Login, returns JWT |
| GET    | /auth/me        | Current user (protected) |
| GET    | /habits         | List habits (optional: archived, as_of_date) |
| POST   | /habits         | Create habit |
| GET    | /habits/{id}    | Get one habit |
| PUT    | /habits/{id}    | Update habit |
| DELETE | /habits/{id}    | Delete habit (+ cascade checkins/streaks) |
| PATCH  | /habits/{id}/order | Set habit order |
| POST   | /habits/{id}/archive | Archive habit |
| POST   | /checkins       | Create/update check-in |
| GET    | /checkins       | List checkins (optional: habit_id, start_date, end_date) |
| GET    | /checkins/today | Today’s checkins |
| GET    | /checkins/day-completion | Completion by day in range |
| DELETE | /checkins/{id}  | Delete check-in |
| GET    | /analytics/habits/{id} | Analytics for one habit (e.g. completion rate, streaks) |
| GET    | /analytics/heatmap | Activity heatmap by day (aggregation pipeline) |
| GET    | /analytics/completion-by-habit | Completed check-ins per habit in range (aggregation, optional `days`) |
| GET    | /analytics/insights | Summary + tips + insights |

**Count:** 19 REST endpoints (above the minimum of 12 for 2 students).

**REST design:** Resource-based URLs, HTTP methods (GET/POST/PUT/PATCH/DELETE), JSON bodies, appropriate status codes (200, 201, 204, 400, 401, 404).  
**OpenAPI:** FastAPI exposes OpenAPI at `/api/v1/openapi.json` (and Swagger UI if enabled).

Detailed request/response examples are in `docs/api.md`.

---

## 6. Indexing and Optimization Strategy

**Intended indexes** (documented in `docs/database.md`):

- `habits`: `{ "user_id": 1, "archived": 1 }` — for listing a user’s active/archived habits.
- `checkins`: `{ "user_id": 1, "habit_id": 1, "date": 1 }` — for per-habit history and date range.
- `checkins`: `{ "user_id": 1, "date": 1 }` — for “today” and date-range queries.
- `streaks`: `{ "user_id": 1, "habit_id": 1 }` — for streak lookup by user and habit.

Indexes can be created at application startup (e.g. in `connect_to_mongo()`) or via a migration script.

**Query patterns that benefit:**  
- Habits list: filter by `user_id` (+ `archived`), sort by `order`.  
- Checkins: filter by `user_id`, often with `habit_id` and/or `date` range; sort by `date`.  
- Streaks: lookup by `user_id` and `habit_id`.

---

## 7. Contribution

Team of 2 students:

- **Anel Baikhanova** — backend, MongoDB, REST API, authentication, streak and schedule services.
- **Alua Muratova** — frontend, UI, Redux state management, documentation, deployment.

---

## 8. Code Snippets (Backend, Frontend, Database)

Short code examples for the main functionality.

### Backend

**Database connection and indexes** (`app/core/database.py`):

```python
async def connect_to_mongo():
    global client, database
    client = AsyncIOMotorClient(settings.MONGODB_URL, **connect_kwargs)
    database = client.get_database("habittracker")
    await database.habits.create_index([("user_id", 1), ("archived", 1)])
    await database.checkins.create_index([("user_id", 1), ("habit_id", 1), ("date", 1)])
    await database.checkins.create_index([("user_id", 1), ("date", 1)])
    await database.streaks.create_index([("user_id", 1), ("habit_id", 1)])

def get_database():
    return database
```

**Registration — insert user with embedded settings** (`app/api/v1/auth.py`):

```python
user_dict = {
    "_id": ObjectId(),
    "email": user_data.email,
    "password_hash": password_hash,
    "created_at": datetime.utcnow(),
    "settings": {"theme": "light", "notifications_enabled": True},
}
await db.users.insert_one(user_dict)
```

**Authorization — get current user from JWT** (`app/core/dependencies.py`):

```python
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    # ... return User or raise 401
```

**List habits and create habit** (`app/api/v1/habits.py`):

```python
habits = await db.habits.find({"user_id": ObjectId(current_user.id), "archived": archived}).sort("order", 1).to_list(length=100)
habit_dict = {"_id": ObjectId(), "user_id": ObjectId(current_user.id), "name": habit_data.name, ...}
await db.habits.insert_one(habit_dict)
```

**Update with `$set`, delete with cascade** (`app/api/v1/habits.py`):

```python
await db.habits.update_one({"_id": ObjectId(habit_id)}, {"$set": update_data})
await db.habits.delete_one({"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)})
await db.checkins.delete_many({"habit_id": ObjectId(habit_id)})
await db.streaks.delete_many({"habit_id": ObjectId(habit_id)})
```

**Check-in with `$inc` on habit** (`app/api/v1/checkins.py`): when a check-in is created or updated to completed, `db.habits.update_one(..., {"$inc": {"total_completions": 1}})`; when uncompleted or deleted, `$inc: -1`.

**Check-in upsert** (`app/api/v1/checkins.py`):

```python
existing = await db.checkins.find_one({"user_id": ..., "habit_id": ..., "date": {"$gte": start, "$lte": end}})
if existing:
    await db.checkins.update_one({"_id": existing["_id"]}, {"$set": {"completed": ..., "value": ..., "skipped": ...}})
else:
    await db.checkins.insert_one(checkin_dict)
```

### Frontend

**API client with JWT** (`src/shared/api/instance.ts`):

```typescript
const api = axios.create({ baseURL: '/api/v1' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

**Auth: login and register** (`src/entities/user/model/userSlice.ts`):

```typescript
export const login = createAsyncThunk('user/login', async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials)
  localStorage.setItem('access_token', response.data.access_token)
  return response.data
})
export const register = createAsyncThunk('user/register', async (data: { email: string; password: string }) => {
  await api.post('/auth/register', data)
  const response = await api.post('/auth/login', { email: data.email, password: data.password })
  localStorage.setItem('access_token', response.data.access_token)
  return response.data
})
```

**Habits: fetch, create, update, delete** (`src/entities/habit/model/habitsSlice.ts`):

```typescript
export const fetchHabits = createAsyncThunk('habits/fetchAll', async ({ archived, as_of_date } = {}) => {
  const response = await api.get('/habits/', { params: { archived, as_of_date } })
  return response.data
})
export const createHabit = createAsyncThunk('habits/create', async (habitData) => {
  const response = await api.post('/habits/', habitData)
  return response.data
})
export const updateHabit = createAsyncThunk('habits/update', async ({ id, data }) => {
  const response = await api.put(`/habits/${id}`, data)
  return response.data
})
export const deleteHabit = createAsyncThunk('habits/delete/', async (id) => {
  await api.delete(`/habits/${id}/`)
  return id
})
```

### Database (MongoDB from backend)

Collections: `users`, `habits`, `checkins`, `streaks`. Access via Motor and `get_database()`.

- **Insert:** `db.users.insert_one({...})`, `db.habits.insert_one({...})`, `db.checkins.insert_one({...})`
- **Find one:** `db.users.find_one({"email": email})`, `db.habits.find_one({"_id": id, "user_id": uid})`
- **Find many:** `db.habits.find({"user_id": uid, "archived": False}).sort("order", 1)`
- **Update:** `db.habits.update_one({"_id": id}, {"$set": {...}})`, `db.habits.update_one(..., {"$inc": {"total_completions": 1}})`, `db.streaks.update_one({...}, {"$set": {...}})`
- **Aggregation:** heatmap and completion-by-habit use `db.checkins.aggregate([{$match}, {$group}, {$project}, ...])`; see `docs/database.md`.
- **Delete:** `db.habits.delete_one({...})`, `db.checkins.delete_many({"habit_id": id})`

Embedded: `user.settings`, `habit.schedule`, `habit.goal`. Optional counter: `habit.total_completions` (maintained via `$inc`). References: `user_id`, `habit_id` as `ObjectId`.
