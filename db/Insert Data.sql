INSERT INTO brand (brand)
VALUES
('Chery'),
('GWM'),
('Changan');


INSERT INTO worker (surname, name, father_name, position, email, password, start_date, is_active)
VALUES
('Қазнабек','Ғалымжан','Айжарықұлы','начальник участка','test@email.com','1234','06.05.2026','1'),
('Сапарғали','Абдулла','Асқарұлы','старший техник-технолог','test@email.com','1234','06.05.2026','1'),
('Галимов','Алибек','Кумарович','старший техник-технолог','test@email.com','1234','06.05.2026','1'),
('Шаймарданов','Акниет','Сагатович','техник-технолог','test@email.com','1234','06.05.2026','1'),
('Даненов','Нуржан','Нариманович','техник-технолог','test@email.com','1234','06.05.2026','1'),
('Таңатов','Айбар','Ілиясұлы','техник-технолог','test@email.com','1234','06.05.2026','1');

INSERT INTO model (model_name, model_code, type, brand_id)
VALUES
('Tiggo2','A13T','single','1'),
('Jolion','A01','2WD','2'),
('Jolion','A01','4WD','2'),
('Tank 300','P01','NOT ToD','2'),
('CS55','CS55','single','3');


INSERT INTO station (station_name, brand_id) VALUES
('CH-EC2-10', 1),
('CH-FF2-10', 1),
('CH-FF2-20', 1),
('CH-FF2-25', 1),
('CH-FF2-30', 1),
('CH-RF2-10', 1),
('CH-RF2-20', 1),
('CH-RF2-30', 1),
('CH-RF2-40', 1),
('CH-WH2 L-10', 1),
('CH-WH2 R-10', 1),
('CH-WH2 L-20', 1),
('CH-WH2 R-20', 1),
('CH-BS L-20', 1),
('CH-BS R-20', 1),
('CH-BS L-40', 1),
('CH-BS R-40', 1),
('CH-OTR L-10', 1),
('CH-OTR R-10', 1),
('CH-UB-20', 1),
('CH-UB-30', 1),
('CH-UB-40', 1),
('CH-UB-50', 1),
('CH-UB-60', 1),
('CH-UB-70', 1),
('CH-UB-80', 1),
('CH-UB-90', 1),
('CH-UB-100', 1),
('CH-UB-110', 1),
('CH-UB-120', 1),
('CH-UB-130', 1),
('CH-MB-140', 1),
('CH-MB-150', 1),
('CH-MB-160', 1),
('CH-MB-170', 1),
('CH-MB-180', 1),
('CH-MB-190', 1),
('CH-MB-200', 1),
('CH-MB-220', 1),
('CH-MB-230', 1),
('CH-MB-240', 1),
('CH-MB-250', 1),
('CH-MB-260', 1),
('CH-MB-270', 1),
('CH-MB-280', 1),
('CH-MB-290', 1),
('CH-MB-300', 1);


INSERT INTO station (station_name, brand_id) VALUES
-- EC1
('GW-EC1-10', 2), ('GW-EC1-20', 2), ('GW-EC1-30', 2),

-- DSH
('GW-DSH1-10',2), ('GW-DSH1-20',2),
-- HL
('GW-HL-10',2), ('GW-HL-20',2),
-- WH 1
('GW-FR WH 1-10',2),('GW-FR WH 1-15',2),

-- EC2
('GW-EC2-10', 2), ('GW-EC2-15', 2), ('GW-EC2-20', 2), ('GW-EC2-30', 2), ('GW-EC2-40', 2), ('GW-EC2-50', 2),

-- FF
('GW-FF1-10', 2), ('GW-FF1-20', 2),
('GW-FF2-10', 2), ('GW-FF2-20', 2), ('GW-FF2-30', 2), ('GW-FF2-40', 2),
-- RF
('GW-RF1-10', 2), ('GW-RF1-20', 2), ('GW-RF1-30', 2), ('GW-RF1-40', 2), ('GW-RF1-50', 2), ('GW-RF1-60', 2),
-- OTR
('GW-OTR L-10', 2), ('GW-OTR L-20', 2), ('GW-OTR R-10', 2), ('GW-OTR R-20', 2),
-- INR
('GW-INR L-10', 2), ('GW-INR R-10', 2),
-- WD
('GW-WD L-10', 2), ('GW-WD R-10', 2),
-- WH
('GW-WH L-10', 2),
('GW-WH L-30', 2),
('GW-WH L-40', 2),
('GW-WH L-50', 2),
('GW-WH L-60', 2),
('GW-WH L-70', 2),
('GW-WH R-10', 2),
('GW-WH R-30', 2),
('GW-WH R-40', 2),
('GW-WH R-50', 2),
('GW-WH R-60', 2),
('GW-WH R-70', 2),
-- BS
('GW-BS L-10', 2),
('GW-BS L-20', 2),
('GW-BS L-30', 2),
('GW-BS L-40', 2),
('GW-BS L-50', 2),
('GW-BS R-10', 2),
('GW-BS R-20', 2),
('GW-BS R-30', 2),
('GW-BS R-40', 2),
('GW-BS R-50', 2),
-- UB
('GW-UB-20', 2), ('GW-UB-30', 2), ('GW-UB-40', 2), ('GW-UB-50', 2), ('GW-UB-60', 2), ('GW-UB-70', 2), ('GW-UB-80', 2), ('GW-UB-90', 2),
-- MB
('GW-MB-100', 2), ('GW-MB-110', 2), ('GW-MB-120', 2), ('GW-MB-130', 2), ('GW-MB-140', 2),
('GW-MB-150', 2), ('GW-MB-160', 2), ('GW-MB-170', 2), ('GW-MB-180', 2), ('GW-MB-190', 2), ('GW-MB-200', 2); ('GW-MB-210', 2); 
('GW-MB-220', 2); ('GW-MB-230', 2); ('GW-MB-240', 2); ('GW-MB-250', 2); ('GW-MB-260', 2);



INSERT INTO station (station_name, brand_id) VALUES
-- RF
('CA-RF1-10', 3), ('CA-RF1-20', 3), ('CA-RF1-30', 3), ('CA-RF1-40', 3), ('CA-RF1-50', 3), ('CA-RF1-60', 3),
-- EC
('CA-EC1-10', 3), ('CA-EC1-15', 3), ('CA-EC1-20', 3), ('CA-EC1-30', 3), ('CA-EC1-40', 3),
-- FF
('CA-FF1-10', 3), ('CA-FF1-20', 3), ('CA-FF1-30', 3),
-- WH
('CA-WH L-10', 3), ('CA-WH R-10', 3),
('CA-WH L-20', 3), ('CA-WH R-20', 3),
('CA-WH L-30', 3), ('CA-WH R-30', 3),
('CA-WH L-40', 3), ('CA-WH R-40', 3),
-- HL
('CA-HL L-10', 3), ('CA-HL R-10', 3),
-- BS
('CA-BS L-10', 3), ('CA-BS R-10', 3),
('CA-BS L-20', 3), ('CA-BS R-20', 3),
('CA-BS L-30', 3), ('CA-BS R-30', 3),
-- UB
('CA-UB-20', 3), ('CA-UB-30', 3), ('CA-UB-40', 3), ('CA-UB-50', 3),
-- MB
('CA-MB-60', 3), ('CA-MB-70', 3), ('CA-MB-80', 3), ('CA-MB-90', 3), ('CA-MB-100', 3), 
('CA-MB-110', 3), ('CA-MB-120', 3), ('CA-MB-130', 3), ('CA-MB-140', 3), ('CA-MB-150', 3), 
('CA-MB-160', 3), ('CA-MB-170', 3), ('CA-MB-180', 3), ('CA-MB-190', 3);





