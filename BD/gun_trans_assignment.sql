SELECT 
    tmp.field1 AS [Файл_Пистолет],
    g.g_num AS [База_Пистолет],
    tmp.field2 AS [Файл_Транс],
    t.transID AS [База_Транс],
    g.UniqueID AS [Gun_ID],
    t.UniqueID AS [Trans_ID]
FROM temp_import_guns tmp
LEFT JOIN gun g ON CAST(g.g_num AS INTEGER) = CAST(REPLACE(tmp.field1, 'G.', '') AS INTEGER)
LEFT JOIN trans t ON CAST(t.transID AS INTEGER) = CAST(tmp.field2 AS INTEGER)
WHERE g.UniqueID IS NULL OR t.UniqueID IS NULL;



INSERT INTO gun_transformer_assignment (
    gun_id, 
    transformer_id, 
    start_date, 
    is_active,
	comments
)
SELECT 
    (SELECT UniqueID FROM gun 
     WHERE CAST(g_num AS INTEGER) = CAST(REPLACE(tmp.field1, 'G.', '') AS INTEGER) 
     LIMIT 1) AS g_id,
    
    (SELECT UniqueID FROM trans 
     WHERE CAST(transID AS TEXT) = TRIM(CAST(tmp.field2 AS TEXT)) 
     LIMIT 1) AS t_id,
    
    date('now'), 
    1,
	'Первоначальная загрузка'
FROM temp_import_guns tmp;
