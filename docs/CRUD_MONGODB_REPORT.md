# CRUD + MongoDB Report

Report with examples of CRUD operations and corresponding MongoDB usage in the Habit tracker API.

**Stack:** FastAPI, Motor (async MongoDB), Pydantic.  
**Database:** `habittracker`.  
**Collections:** `users`, `habits`, `checkins`, `streaks`.

---

## MongoDB Setup

**Connection:** `get_database()` returns the Motor database instance.

**Indexes (created at startup in `app/core/database.py`):**

```python
await database.habits.create_index([("user_id", 1), ("archived", 1)])
await database.checkins.create_index([("user_id", 1), ("habit_id", 1), ("date", 1)])
await database.checkins.create_index([("user_id", 1), ("date", 1)])
await database.streaks.create_index([("user_id", 1), ("habit_id", 1)])
```

All IDs in Python use `bson.ObjectId`; in API requests/responses they are strings.

---

## 1. Users

Collection: `users`. No auth on read/update/delete; login uses `find_one` by email.

### CREATE — Register

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**MongoDB:**
```python
db = get_database()

existing_user = await db.users.find_one({"email": user_data.email})
if existing_user:
    raise HTTPException(400, "Email already registered")

user_dict = {
    "_id": ObjectId(),
    "email": user_data.email,
    "password_hash": get_password_hash(user_data.password),
    "created_at": datetime.utcnow(),
    "settings": {"theme": "light", "notifications_enabled": True},
}
await db.users.insert_one(user_dict)
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "settings": { "theme": "light", "notifications_enabled": true }
}
```

---

### READ — Login (find user)

**Endpoint:** `POST /api/v1/auth/login`

**MongoDB:**
```python
user = await db.users.find_one({"email": user_data.email})
if not user or not verify_password(user_data.password, user["password_hash"]):
    raise HTTPException(401, "Incorrect email or password")
# then create JWT with data={"sub": str(user["_id"])}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

---

### READ — Current user

**Endpoint:** `GET /api/v1/auth/me` (requires `Authorization: Bearer <token>`)

User is resolved from JWT in `get_current_user` (token payload `sub` = user `_id`). No direct MongoDB call in the route; dependency loads user once from DB.

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "settings": { "theme": "light", "notifications_enabled": true }
}
```

---

## 2. Habits

Collection: `habits`. All operations are scoped by `user_id` (from JWT).

### CREATE — Create habit

**Endpoint:** `POST /api/v1/habits/`

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

**MongoDB:**
```python
count = await db.habits.count_documents({
    "user_id": ObjectId(current_user.id),
    "archived": False
})
habit_dict = {
    "_id": ObjectId(),
    "user_id": ObjectId(current_user.id),
    "name": habit_data.name,
    "type": habit_data.type,
    "frequency": habit_data.frequency,
    "schedule": normalize_schedule(habit_data.schedule, date.today()),
    "time_of_day": habit_data.time_of_day,
    "start_date": habit_data.start_date,
    "goal": habit_data.goal,
    "color": habit_data.color or "#3B82F6",
    "icon": habit_data.icon,
    "category": habit_data.category,
    "order": count,
    "archived": False,
    "created_at": datetime.utcnow(),
}
await db.habits.insert_one(habit_dict)
```

**Response (201):** Full habit object including `id`, `user_id`, `current_streak`, etc.

---

### READ — List habits

**Endpoint:** `GET /api/v1/habits/?archived=false&as_of_date=2024-01-15`

**MongoDB:**
```python
query = {
    "user_id": ObjectId(current_user.id),
    "archived": archived
}
habits = await db.habits.find(query).sort("order", 1).to_list(length=100)
# then for each habit: get_streak(...) reads from streaks collection
```

**Response (200):** Array of `HabitResponse` (with `current_streak`).

---

### READ — Get one habit

**Endpoint:** `GET /api/v1/habits/{habit_id}`

**MongoDB:**
```python
habit = await db.habits.find_one({
    "_id": ObjectId(habit_id),
    "user_id": ObjectId(current_user.id)
})
if not habit:
    raise HTTPException(404, "Habit not found")
# get_streak(...) for current_streak
```

**Response (200):** Single `HabitResponse`.

---

### UPDATE — Update habit

**Endpoint:** `PUT /api/v1/habits/{habit_id}`

**Request (partial):**
```json
{
  "name": "Drink 2L water",
  "color": "#10B981"
}
```

**MongoDB:**
```python
habit = await db.habits.find_one({
    "_id": ObjectId(habit_id),
    "user_id": ObjectId(current_user.id)
})
if not habit:
    raise HTTPException(404, "Habit not found")

update_data = habit_data.model_dump(exclude_unset=True)
if "schedule" in update_data:
    update_data["schedule"] = normalize_schedule(update_data.get("schedule"), date.today())

await db.habits.update_one(
    {"_id": ObjectId(habit_id)},
    {"$set": update_data},
)
updated_habit = await db.habits.find_one({"_id": ObjectId(habit_id)})
```

**Response (200):** Updated `HabitResponse`.

---

### UPDATE — Change order

**Endpoint:** `PATCH /api/v1/habits/{habit_id}/order?order=2`

**MongoDB:**
```python
result = await db.habits.update_one(
    {"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)},
    {"$set": {"order": order}},
)
if result.matched_count == 0:
    raise HTTPException(404, "Habit not found")
```

**Response (200):** `{"message": "Order updated"}`.

---

### UPDATE — Archive habit

**Endpoint:** `POST /api/v1/habits/{habit_id}/archive`

**MongoDB:**
```python
result = await db.habits.update_one(
    {"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)},
    {"$set": {"archived": True}},
)
if result.matched_count == 0:
    raise HTTPException(404, "Habit not found")
```

**Response (200):** `{"message": "Habit archived"}`.

---

### DELETE — Delete habit

**Endpoint:** `DELETE /api/v1/habits/{habit_id}`

**MongoDB:**
```python
result = await db.habits.delete_one({
    "_id": ObjectId(habit_id),
    "user_id": ObjectId(current_user.id)
})
if result.deleted_count == 0:
    raise HTTPException(404, "Habit not found")
await db.checkins.delete_many({"habit_id": ObjectId(habit_id)})
await db.streaks.delete_many({"habit_id": ObjectId(habit_id)})
```

**Response (204):** No body.

---

## 3. Check-ins

Collection: `checkins`. Create is upsert-by (user, habit, date); delete also updates `habits.total_completions` and streaks.

### CREATE (or UPDATE) — Upsert check-in

**Endpoint:** `POST /api/v1/checkins/`

**Request:**
```json
{
  "habit_id": "507f1f77bcf86cd799439011",
  "date": "2024-01-15",
  "completed": true,
  "value": 2.0,
  "skipped": false
}
```

**MongoDB (simplified):**
```python
habit = await db.habits.find_one({
    "_id": ObjectId(checkin_data.habit_id),
    "user_id": ObjectId(current_user.id)
})
if not habit:
    raise HTTPException(404, "Habit not found")

checkin_date_start = datetime.combine(checkin_data.date, datetime.min.time())
checkin_date_end = datetime.combine(checkin_data.date, datetime.max.time())
existing = await db.checkins.find_one({
    "user_id": ObjectId(current_user.id),
    "habit_id": ObjectId(checkin_data.habit_id),
    "date": {"$gte": checkin_date_start, "$lte": checkin_date_end},
})

if existing:
    await db.checkins.update_one(
        {"_id": existing["_id"]},
        {"$set": {"completed": checkin_data.completed, "value": checkin_data.value, "skipped": checkin_data.skipped}}
    )
    # adjust habit total_completions if completed changed
else:
    checkin_dict = {
        "_id": ObjectId(),
        "user_id": ObjectId(current_user.id),
        "habit_id": ObjectId(checkin_data.habit_id),
        "date": datetime.combine(checkin_data.date, datetime.min.time()),
        "completed": checkin_data.completed,
        "value": checkin_data.value,
        "skipped": checkin_data.skipped,
        "created_at": datetime.utcnow(),
    }
    await db.checkins.insert_one(checkin_dict)
    if checkin_data.completed:
        await db.habits.update_one(
            {"_id": ObjectId(checkin_data.habit_id)},
            {"$inc": {"total_completions": 1}}
        )
# update_streak(...) updates streaks collection
```

**Response (201):** `CheckinResponse` (id, user_id, habit_id, date, completed, value, skipped, created_at).

---

### READ — List check-ins

**Endpoint:** `GET /api/v1/checkins/?habit_id=...&start_date=2024-01-01&end_date=2024-01-31`

**MongoDB:**
```python
query = {"user_id": ObjectId(current_user.id)}
if habit_id:
    query["habit_id"] = ObjectId(habit_id)
if start_date:
    query["date"] = {"$gte": datetime.combine(start_date, datetime.min.time())}
if end_date:
    if "date" in query:
        query["date"]["$lte"] = datetime.combine(end_date, datetime.max.time())
    else:
        query["date"] = {"$lte": datetime.combine(end_date, datetime.max.time())}

checkins = await db.checkins.find(query).sort("date", -1).to_list(length=1000)
```

**Response (200):** Array of `CheckinResponse`.

---

### READ — Today’s check-ins

**Endpoint:** `GET /api/v1/checkins/today`

**MongoDB:**
```python
today_date = date.today()
today_start = datetime.combine(today_date, datetime.min.time())
today_end = datetime.combine(today_date, datetime.max.time())
checkins = await db.checkins.find({
    "user_id": ObjectId(current_user.id),
    "date": {"$gte": today_start, "$lte": today_end},
}).to_list(length=100)
```

**Response (200):** Array of `CheckinResponse`.

---

### READ — Day completion (per-day “all done”)

**Endpoint:** `GET /api/v1/checkins/day-completion?start_date=2024-01-01&end_date=2024-01-07`

Uses `db.habits.find` and `db.checkins.find` for the user and date range, then in-memory logic to compute for each day whether all scheduled habits were completed.

**Response (200):** `{"2024-01-01": true, "2024-01-02": false, ...}`.

---

### DELETE — Delete check-in

**Endpoint:** `DELETE /api/v1/checkins/{checkin_id}`

**MongoDB:**
```python
checkin = await db.checkins.find_one({
    "_id": ObjectId(checkin_id),
    "user_id": ObjectId(current_user.id)
})
if not checkin:
    raise HTTPException(404, "Checkin not found")

if checkin.get("completed"):
    await db.habits.update_one(
        {"_id": checkin["habit_id"]},
        {"$inc": {"total_completions": -1}}
    )
await db.checkins.delete_one({"_id": ObjectId(checkin_id)})
# update_streak(..., False, ...) to recalc streak
```

**Response (204):** No body.

---

## 4. Analytics (read-only, MongoDB read/aggregate)

No separate collection for “analytics”; data is read from `habits`, `checkins`, and `streaks`.

### GET `/api/v1/analytics/habits/{habit_id}?days=30`

- `db.habits.find_one({ _id, user_id })`
- `db.checkins.find({ user_id, habit_id, date in range })`
- `get_streak(...)` (reads/derives from `streaks` / checkins)

Returns completion rate, completed_count, skipped_count, current_streak, best_streak, list of check-ins.

### GET `/api/v1/analytics/heatmap?days=365`

**MongoDB:**
```python
pipeline = [
    {"$match": {
        "user_id": ObjectId(current_user.id),
        "date": {"$gte": start_datetime, "$lte": end_datetime},
        "completed": True
    }},
    {"$group": {
        "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
        "count": {"$sum": 1}
    }},
    {"$project": {"date": "$_id", "count": 1, "_id": 0}},
]
cursor = db.checkins.aggregate(pipeline)
```

Returns `{ "start_date", "end_date", "data": { "2024-01-01": 3, ... } }`.

### GET `/api/v1/analytics/completion-by-habit?days=30`

**MongoDB:** Aggregation on `checkins` (match by user and date range, `completed: true`), `$group` by `habit_id`, `$lookup` habits for names. Returns list of `{ habit_id, habit_name, completed_count }`.

### GET `/api/v1/analytics/insights`

Uses `db.habits.find`, `db.checkins.find`, and `get_streak` to build summary, tips, and insights (e.g. best weekday per habit). No write operations.

---

## Summary

| Resource | Create        | Read                    | Update                    | Delete        |
|----------|---------------|-------------------------|---------------------------|---------------|
| User     | `insert_one`  | `find_one` (email/me)   | —                         | —             |
| Habit    | `insert_one`  | `find`, `find_one`      | `update_one` ($set)       | `delete_one` + `delete_many` (checkins, streaks) |
| Check-in | `insert_one` or `update_one` (upsert) | `find`, `find_one` | via POST upsert | `delete_one` + habit/streak updates |

All habit and check-in operations are scoped by `user_id` from the JWT. IDs are stored as `ObjectId` in MongoDB and exposed as strings in the API.
