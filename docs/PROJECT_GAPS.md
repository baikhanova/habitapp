# HabitTracker — Course Criteria Status

**Course:** Advanced Databases (NoSQL)  
This document lists the grading criteria and their implementation status. All previously missing items have been addressed.

---

## Requirements Status

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Aggregation-based endpoint** | Done | Heatmap: `db.checkins.aggregate()` with `$match`, `$group`, `$project`. Completion-by-habit: `$match`, `$group`, `$lookup`, `$unwind`, `$project`. |
| **Advanced update/delete operators** | Done | `$inc` in `checkins.py`: habit field `total_completions` on check-in create/update/delete when completed. |
| **Compound indexes in code** | Done | `connect_to_mongo()` in `app/core/database.py` creates all four compound indexes from `docs/database.md`. |
| **MongoDB queries in documentation** | Done | Subsection "MongoDB Query Examples" in `docs/database.md` (habits list, checkins range, streak update, heatmap aggregation). |
| **Contribution** | Done | Anel Baikhanova, Alua Muratova — see main report section 7. |

---

## First Requirement: Aggregation — Nothing Left

The criterion was: *at least one endpoint using `db.collection.aggregate([...])` with several stages (e.g. `$match`, `$group`, `$project`).*

**Implemented:**

1. **GET /api/v1/analytics/heatmap** — pipeline: `$match` (user_id, date range, completed) → `$group` by date via `$dateToString`, `$sum: 1` → `$project` (date, count). Response format unchanged.
2. **GET /api/v1/analytics/completion-by-habit** — pipeline: `$match` → `$group` by habit_id → `$lookup` habits → `$unwind` → `$project`. Returns per-habit completed count.

No further work required for aggregation.
