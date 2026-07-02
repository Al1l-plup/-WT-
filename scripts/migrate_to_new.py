import sqlite3

OLD_DB = r"C:\Users\al.galimov\WeldTeam\BD\WeldTeam_DataBase.db"
NEW_DB = r"C:\Users\al.galimov\WeldTeam\BD\extracted_28_05\BD\web site\temp_server\welding_shop.db"

old = sqlite3.connect(OLD_DB)
new = sqlite3.connect(NEW_DB)

# --- maintenance ---
# OLD cols: UniqueId, first_weld, second_weld, third_weld, first_pressure, second_pressure, third_pressure, to_date, worker_id, gun_id
# NEW cols: UniqueId, first_weld, second_weld, third_weld, first_pressure, second_pressure, third_pressure, to_date, worker_id, gun_id, parameter_id
old_maint = old.execute("SELECT * FROM maintenance").fetchall()
new_ids_m = {r[0] for r in new.execute("SELECT UniqueId FROM maintenance").fetchall()}
missing_m = [r for r in old_maint if r[0] not in new_ids_m]

print(f"maintenance: old={len(old_maint)}, new={len(new_ids_m)}, to_insert={len(missing_m)}")
if missing_m:
    # append NULL for parameter_id
    rows = [r + (None,) for r in missing_m]
    new.executemany(
        "INSERT OR REPLACE INTO maintenance "
        "(UniqueId,first_weld,second_weld,third_weld,first_pressure,second_pressure,third_pressure,to_date,worker_id,gun_id,parameter_id) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?)", rows
    )
    print(f"  -> inserted {len(missing_m)} rows")

# --- defects ---
# OLD cols: UniqueID, problem_code, root_cause, solution, df_date, worker_name, spot_id, gun_id
# NEW cols: UniqueID, problem_code, root_cause, solution, df_date, worker_solve_id, spot_id, gun_id, worker_register_id
old_defs = old.execute("SELECT * FROM defects").fetchall()
new_ids_d = {r[0] for r in new.execute("SELECT UniqueID FROM defects").fetchall()}
missing_d = [r for r in old_defs if r[0] not in new_ids_d]

print(f"defects:     old={len(old_defs)}, new={len(new_ids_d)}, to_insert={len(missing_d)}")
if missing_d:
    # worker_name -> worker_solve_id, append NULL for worker_register_id
    rows = [(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], None) for r in missing_d]
    new.executemany(
        "INSERT OR REPLACE INTO defects "
        "(UniqueID,problem_code,root_cause,solution,df_date,worker_solve_id,spot_id,gun_id,worker_register_id) "
        "VALUES (?,?,?,?,?,?,?,?,?)", rows
    )
    print(f"  -> inserted {len(missing_d)} rows")

new.commit()
old.close()
new.close()
print("\nDone.")
