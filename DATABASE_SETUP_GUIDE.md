# MediSync Database Setup Guide

You have **two options** depending on whether you want to keep existing data or start fresh.

---

## Option A: Fresh Start (Wipe & Recreate) — Use if you DON'T need to keep existing data

This will **delete all data** in mediSyncDB and recreate everything from scratch.

### Steps in MySQL Workbench:

1. **Open MySQL Workbench** and connect to your server.

2. **Backup first (optional but recommended):**
   - Right-click `mediSyncDB` → **Data Export** → Export to a file (e.g., `mediSyncDB_backup.sql`).

3. **Run the main schema file:**
   - Go to **File → Open SQL Script**
   - Select `mediSyncDB.sql`
   - Click the **Execute** (lightning bolt) button, or press `Ctrl+Shift+Enter`
   - This will:
     - Create/reuse the `mediSyncDB` database
     - Create all tables (or reuse if they exist)
     - **Clear all existing data** (TRUNCATE/DELETE)
     - Insert seed data (Dr. Smith, doctor schedule)

4. **Done.** You now have a fresh database. No need to run the migration file.

---

## Option B: Keep Existing Data (Safe Migration) — Use if you WANT to keep your data

This only adds new columns and updates the schema. **No data is deleted.**

### Steps in MySQL Workbench:

1. **Open MySQL Workbench** and connect to your server.

2. **Backup first (strongly recommended):**
   - Right-click `mediSyncDB` → **Data Export** → Export to a file.

3. **Check what you already have:**
   - Run: `DESCRIBE medical_records;`
   - If you already see `doctor_id` and `diagnosis` columns, you may not need the full migration.

4. **Run the migration file:**
   - Go to **File → Open SQL Script**
   - Select `mediSyncDB-migration-prescription.sql`
   - Click **Execute** (lightning bolt)

5. **If you get errors:**
   - **"Duplicate column name 'doctor_id'"** → That column exists. Comment out or skip that `ALTER TABLE` line and the foreign key line for it.
   - **"Duplicate column name 'diagnosis'"** → Skip that `ALTER TABLE` line.
   - **Error on MODIFY status** → Your enum might already include `completed`. You can skip that line.

---

## Summary

| Situation                               | What to run                 |
|-----------------------------------------|-----------------------------|
| New project / No important data         | `mediSyncDB.sql` only       |
| Existing data you want to keep          | `mediSyncDB-migration-prescription.sql` only |
| Not sure                                | Backup first, then run migration (Option B)  |

---

## After Setup

- **Doctor login:** `doctor@clinic.com` / `doctor123` (if using seed data; you may need to set a proper bcrypt password)
- **Patient:** Register a new account from the app
