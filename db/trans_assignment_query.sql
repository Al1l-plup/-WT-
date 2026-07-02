INSERT INTO transformer_station_assignment (
    transformer_id, 
    station_id, 
    start_date, 
    is_active, 
    comment
)
SELECT 
    t.UniqueID,          -- Берем PK из основной таблицы trans
    s.UniqueID,          -- Берем PK из основной таблицы Station
    date('now'),         -- Текущая дата в формате YYYY-MM-DD
    1,                   -- В SQLite true — это 1
    'Первоначальная загрузка'
FROM temp_import tmp
INNER JOIN trans t ON t.transID = tmp.field1
INNER JOIN Station s ON s.station_name = tmp.field2;


SELECT * FROM temp_import tmp
WHERE NOT EXISTS (SELECT 1 FROM trans t WHERE t.transID = tmp.field1)
   OR NOT EXISTS (SELECT 1 FROM Station s WHERE s.station_name = tmp.field2);
   

SELECT 
    tmp.field1, 
    tmp.field2, 
    COUNT(*) as count
FROM temp_import tmp
JOIN trans t ON CAST(t.transID AS TEXT) = CAST(tmp.field1 AS TEXT)
JOIN Station s ON s.station_name = tmp.field2
GROUP BY tmp.field1, tmp.field2
HAVING count > 1;