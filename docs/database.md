# Database Schema

## MongoDB Collections

### users

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "created_at": "2024-01-01T00:00:00",
  "settings": {
    "theme": "light",
    "notifications_enabled": true
  }
}
```

### habits

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "name": "Drink water",
  "type": "positive",
  "frequency": "daily",
  "schedule": {},
  "time_of_day": "morning",
  "start_date": "2024-01-01T00:00:00",
  "goal": {
    "type": "quantity",
    "value": 2,
    "unit": "liters"
  },
  "color": "#3B82F6",
  "icon": "water",
  "category": "health",
  "order": 0,
  "archived": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### checkins

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "habit_id": "ObjectId",
  "date": "2024-01-01",
  "completed": true,
  "value": 2.0,
  "skipped": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### streaks

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "habit_id": "ObjectId",
  "current_streak": 5,
  "best_streak": 10,
  "last_checkin_date": "2024-01-05",
  "updated_at": "2024-01-05T00:00:00"
}
```

## Indexes

Recommended compound indexes (created at app startup in `app/core/database.py`):

```javascript
db.habits.createIndex({ "user_id": 1, "archived": 1 })
db.checkins.createIndex({ "user_id": 1, "habit_id": 1, "date": 1 })
db.checkins.createIndex({ "user_id": 1, "date": 1 })
db.streaks.createIndex({ "user_id": 1, "habit_id": 1 })
```

## MongoDB Query Examples

Representative queries and updates used in the application:

**1. List user habits (active, sorted by order):**
```javascript
db.habits.find({ user_id: ObjectId(uid), archived: false }).sort("order", 1)
```

**2. Check-ins in date range:**
```javascript
db.checkins.find({
  user_id: ObjectId(uid),
  date: { $gte: startDatetime, $lte: endDatetime }
}).sort("date", -1)
```

**3. Streak update after check-in:**
```javascript
db.streaks.updateOne(
  { user_id: ObjectId(uid), habit_id: ObjectId(hid) },
  { $set: { current_streak: n, best_streak: m, last_checkin_date: d, updated_at: now } }
)
```

**4. Heatmap aggregation (count completed check-ins per day):**
```javascript
db.checkins.aggregate([
  { $match: { user_id: ObjectId(uid), date: { $gte: start, $lte: end }, completed: true } },
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
  { $project: { date: "$_id", count: 1, _id: 0 } }
])
```
