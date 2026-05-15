const {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, BorderStyle,
  WidthType, ShadingType, convertInchesToTwip
} = require('docx');
const fs = require('fs');
const path = require('path');
const Database = require('./backend/node_modules/better-sqlite3');

const db = new Database(path.join(__dirname, 'BD/WeldTeam_DataBase.db'));

// ─── helpers ────────────────────────────────────────────────────────────────
const h1 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
const h3 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
const p  = (text) => new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after: 120 } });
const br = () => new Paragraph({ text: '' });

const bold = (text) => new TextRun({ text, bold: true, size: 22 });
const mono = (text) => new TextRun({ text, font: 'Courier New', size: 20 });

const pMixed = (...runs) => new Paragraph({ children: runs, spacing: { after: 120 } });

const codeBlock = (lines) => lines.map(line =>
  new Paragraph({
    children: [mono(line)],
    spacing: { after: 0 },
    indent: { left: convertInchesToTwip(0.4) },
    shading: { type: ShadingType.SOLID, color: 'F3F4F6' },
  })
);

const headerCell = (text) => new TableCell({
  children: [new Paragraph({ children: [bold(text)], alignment: AlignmentType.CENTER })],
  shading: { type: ShadingType.SOLID, color: '1E3A5F' },
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
});

const cell = (text, shade = 'FFFFFF') => new TableCell({
  children: [new Paragraph({ children: [new TextRun({ text: String(text ?? '—'), size: 20 })], alignment: AlignmentType.LEFT })],
  shading: { type: ShadingType.SOLID, color: shade },
  margins: { top: 40, bottom: 40, left: 100, right: 100 },
});

const makeTable = (headers, rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: headers.map(h => headerCell(h)), tableHeader: true }),
    ...rows.map((row, i) => new TableRow({
      children: row.map(v => cell(v, i % 2 === 0 ? 'FFFFFF' : 'F8FAFC')),
    })),
  ],
});

// ─── данные из БД ────────────────────────────────────────────────────────────
const counts = {};
['brand','worker','gun','trans','station','model','spot','parameters',
 'maintenance','defects','gun_transformer_assignment',
 'transformer_station_assignment','welding_setup'].forEach(t => {
  counts[t] = db.prepare(`SELECT COUNT(*) as n FROM ${t}`).get().n;
});

const sampleWS = db.prepare(`
  SELECT sp.spot_number, g.g_num, g.model as gun_model,
         t.transID, t.type, s.station_name, b.brand,
         p.pressure, p.heat_2, p.mode
  FROM welding_setup ws
  JOIN spot sp ON ws.spot_id=sp.UniqueID
  JOIN gun g ON ws.gun_id=g.UniqueID
  JOIN gun_transformer_assignment gta ON gta.gun_id=g.UniqueID AND gta.is_active=1
  JOIN trans t ON gta.transformer_id=t.UniqueID
  JOIN transformer_station_assignment tsa ON tsa.transformer_id=t.UniqueID AND tsa.is_active=1
  JOIN station s ON tsa.station_id=s.UniqueID
  JOIN brand b ON s.brand_id=b.UniqueID
  JOIN parameters p ON ws.parameter_id=p.UniqueID
  LIMIT 5
`).all();

// ─── документ ────────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    paragraphStyles: [{
      id: 'Heading1', name: 'Heading 1',
      run: { color: '1E3A5F', size: 32, bold: true },
    },{
      id: 'Heading2', name: 'Heading 2',
      run: { color: '2563EB', size: 26, bold: true },
    },{
      id: 'Heading3', name: 'Heading 3',
      run: { color: '374151', size: 24, bold: true },
    }],
  },
  sections: [{
    properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
    children: [

      // ── ТИТУЛ ──────────────────────────────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: 'WeldTeam', bold: true, size: 56, color: '1E3A5F' })],
        alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Техническая документация системы', size: 28, color: '374151' })],
        alignment: AlignmentType.CENTER, spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Управление сварочным производством — Chery · GWM · Changan', size: 24, color: '6B7280' })],
        alignment: AlignmentType.CENTER, spacing: { after: 600 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Дата: 15.05.2026    Версия БД: 2.0', size: 22, color: '9CA3AF' })],
        alignment: AlignmentType.CENTER, spacing: { after: 800 },
      }),
      br(),

      // ── 1. АРХИТЕКТУРА ─────────────────────────────────────────────────────
      h1('1. Архитектура системы'),
      p('WeldTeam — веб-приложение с трёхзвенной архитектурой:'),
      makeTable(
        ['Уровень', 'Технология', 'Порт', 'Назначение'],
        [
          ['Frontend', 'React + Vite', '5173 (dev)', 'Интерфейс пользователя в браузере'],
          ['Backend', 'Node.js + Express', '3001', 'REST API, бизнес-логика'],
          ['Database', 'SQLite (better-sqlite3)', 'файл', 'Хранение всех данных'],
        ]
      ),
      br(),
      p('Файл базы данных: BD/WeldTeam_DataBase.db'),
      p('Backend читает и пишет в БД напрямую через библиотеку better-sqlite3 (без ORM).'),
      p('Frontend обращается к backend через HTTP запросы на /api/... эндпоинты.'),
      br(),

      // ── 2. БАЗА ДАННЫХ ─────────────────────────────────────────────────────
      h1('2. База данных — структура таблиц'),
      p(`Всего таблиц: 13 рабочих. Размер БД: ~15 МБ. СУБД: SQLite 3.`),
      br(),

      // brand
      h2('2.1 brand — Бренды производителей'),
      makeTable(['Поле','Тип','Ограничение','Описание'],[
        ['UniqueID','INTEGER','PK AUTOINCREMENT','Первичный ключ'],
        ['brand','VARCHAR(10)','NOT NULL','Название: Chery, GWM, Changan'],
      ]),
      pMixed(bold('Данные: '), new TextRun({ text: `${counts.brand} записи — Chery (1), GWM (2), Changan (3)`, size: 22 })),
      br(),

      // worker
      h2('2.2 worker — Сотрудники'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['surname','VARCHAR(20)','Фамилия'],
        ['name','VARCHAR(255)','Имя'],
        ['father_name','VARCHAR(255)','Отчество'],
        ['position','VARCHAR(30)','Должность (начальник участка / старший техник / техник)'],
        ['email','VARCHAR(50)','Email'],
        ['password','VARCHAR(10)','Пароль'],
        ['start_date','DATE','Дата приёма на работу'],
        ['end_date','DATE','Дата увольнения (NULL = работает)'],
        ['is_active','BOOL','1 = активен, 0 = уволен'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.worker}`, size: 22 })),
      pMixed(bold('Паттерн: '), new TextRun({ text: 'Мягкое удаление — при увольнении is_active=0, end_date=дата, запись не удаляется', size: 22 })),
      br(),

      // gun
      h2('2.3 gun — Сварочные пистолеты'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['g_num','INTEGER NOT NULL','Номер пистолета (G.001, G.002, ...)'],
        ['model','VARCHAR(20)','Модель пистолета (UCH-C12071, UXH-C6447, ...)'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.gun}`, size: 22 })),
      br(),

      // trans
      h2('2.4 trans — Трансформаторы'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['transID','VARCHAR(20)','ID трансформатора (CH-EC2-10-T1, GW-A01-10-T1, ...)'],
        ['type','VARCHAR(2)','Тип: AC или DC'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.trans}`, size: 22 })),
      br(),

      // station
      h2('2.5 station — Сварочные станции'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['station_name','VARCHAR(20)','Название станции (CH-EC2-10, GW-A01-10, ...)'],
        ['brand_id','INTEGER FK','→ brand.UniqueID'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.station} (Chery: 47, GWM: 100+, Changan: 34)`, size: 22 })),
      br(),

      // model
      h2('2.6 model — Модели автомобилей'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['model_name','VARCHAR(20)','Название (Tiggo2, Jolion, Tank 300, CS55, ...)'],
        ['model_code','VARCHAR(10)','Код модели'],
        ['type','VARCHAR(10)','Тип кузова'],
        ['brand_id','INTEGER FK','→ brand.UniqueID'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.model} (Tiggo2, Jolion 2WD/4WD, Tank 300, CS55, ...)`, size: 22 })),
      br(),

      // spot
      h2('2.7 spot — Точки сварки'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['spot_number','INTEGER NOT NULL','Номер точки'],
        ['model_id','INTEGER FK','→ model.UniqueID'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.spot.toLocaleString()} (Chery: 2189, GWM: 12033, Changan: 2458)`, size: 22 })),
      br(),

      // parameters
      h2('2.8 parameters — Параметры сварки'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['pressure','INTEGER','Давление сжатия (даН)'],
        ['squeeze_time','INTEGER','Время сжатия (мс)'],
        ['up_slope_time','INTEGER','Время нарастания тока (мс)'],
        ['weld_1','INTEGER','Импульс сварки 1'],
        ['heat_1','INTEGER','Ток 1 (А)'],
        ['cool_1','INTEGER','Пауза 1 (мс)'],
        ['weld_2','INTEGER','Импульс сварки 2 (мс)'],
        ['heat_2','INTEGER','Ток 2 (А) — основной'],
        ['hold','INTEGER','Время удержания (мс)'],
        ['turn_R','DECIMAL(3,1)','Радиус электрода (мм)'],
        ['mode','VARCHAR','Режим сварки (A, B, ...)'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.parameters}`, size: 22 })),
      br(),

      // maintenance
      h2('2.9 maintenance — Техническое обслуживание'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueId','INTEGER PK','Первичный ключ'],
        ['first_weld / second_weld / third_weld','INTEGER','3 замера силы тока (А)'],
        ['first_pressure / second_pressure / third_pressure','INTEGER','3 замера давления (даН/бар)'],
        ['to_date','DATE','Дата проведения ТО'],
        ['worker_id','INTEGER FK','→ worker.UniqueID'],
        ['gun_id','INTEGER FK','→ gun.UniqueID'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.maintenance}`, size: 22 })),
      br(),

      // defects
      h2('2.10 defects — Дефекты'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['problem_code','VARCHAR(3)','Код проблемы (до 3 символов)'],
        ['root_cause','TEXT','Первопричина дефекта'],
        ['solution','TEXT','Принятое решение'],
        ['df_date','DATE','Дата выявления'],
        ['worker_name','INTEGER FK','→ worker.UniqueID (ответственный)'],
        ['spot_id','INTEGER FK','→ spot.UniqueID'],
        ['gun_id','INTEGER FK','→ gun.UniqueID'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.defects}`, size: 22 })),
      br(),

      // gun_transformer_assignment
      h2('2.11 gun_transformer_assignment — Привязка пистолет → трансформатор'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['gun_id','INTEGER FK','→ gun.UniqueID'],
        ['transformer_id','INTEGER FK','→ trans.UniqueID'],
        ['start_date','DATE','Дата назначения'],
        ['end_date','DATE','Дата снятия (NULL = действует)'],
        ['is_active','BOOL','1 = активная привязка'],
        ['comments','TEXT','Комментарий'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.gun_transformer_assignment} (все активны)`, size: 22 })),
      br(),

      // transformer_station_assignment
      h2('2.12 transformer_station_assignment — Привязка трансформатор → станция'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['transformer_id','INTEGER FK','→ trans.UniqueID'],
        ['station_id','INTEGER FK','→ station.UniqueID'],
        ['start_date','DATE','Дата назначения'],
        ['end_date','DATE','Дата снятия'],
        ['is_active','BOOL','1 = активная привязка'],
        ['comment','TEXT','Комментарий'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.transformer_station_assignment}`, size: 22 })),
      br(),

      // welding_setup
      h2('2.13 welding_setup — Установка точки на пистолет'),
      makeTable(['Поле','Тип','Описание'],[
        ['UniqueID','INTEGER PK','Первичный ключ'],
        ['spot_id','INTEGER FK','→ spot.UniqueID'],
        ['gun_id','INTEGER FK','→ gun.UniqueID'],
        ['parameter_id','INTEGER FK','→ parameters.UniqueID'],
        ['start_date','DATE','Дата установки'],
        ['end_date','DATE','Дата снятия (NULL = действует)'],
        ['is_active','BOOL','1 = активная установка'],
        ['comments','TEXT','Комментарий'],
      ]),
      pMixed(bold('Записей: '), new TextRun({ text: `${counts.welding_setup.toLocaleString()} — КЛЮЧЕВАЯ ТАБЛИЦА`, size: 22 })),
      p('Именно через welding_setup система знает какой пистолет варит какую точку с какими параметрами.'),
      br(),

      // ── 3. СХЕМА СВЯЗЕЙ ────────────────────────────────────────────────────
      h1('3. Схема связей между таблицами'),
      ...codeBlock([
        'brand ──< station ──< transformer_station_assignment >── trans',
        '                                                          |',
        '                                               gun_transformer_assignment',
        '                                                          |',
        'brand ──< model ──< spot ──< welding_setup >────────── gun',
        '                              welding_setup >── parameters',
        '                                                          |',
        '                   worker ──< maintenance >──────────── gun',
        '                   worker ──< defects >── spot',
        '                              defects >── gun',
      ]),
      br(),
      p('Полная цепочка от точки до участка:'),
      ...codeBlock([
        'spot → model → brand (участок)',
        'spot → welding_setup → gun → gun_transformer_assignment → trans',
        '                              trans → transformer_station_assignment → station → brand',
      ]),
      br(),

      // ── 4. API ЭНДПОИНТЫ ───────────────────────────────────────────────────
      h1('4. API эндпоинты (backend REST API)'),
      p('Все эндпоинты начинаются с /api/. Backend запущен на порту 3001.'),
      br(),

      makeTable(['Метод','URL','Описание','SQL операция'],[
        ['GET','/api/brands','Все бренды','SELECT * FROM brand'],
        ['GET','/api/guns','Все пистолеты + трансформатор + станция','SELECT + 4 JOIN'],
        ['GET','/api/guns?brand_id=1','Пистолеты по бренду','SELECT + WHERE station.brand_id'],
        ['POST','/api/guns','Добавить пистолет','INSERT INTO gun'],
        ['GET','/api/workers','Все работники','SELECT * FROM worker'],
        ['POST','/api/workers','Добавить работника','INSERT INTO worker'],
        ['PATCH','/api/workers/:id/deactivate','Уволить работника','UPDATE worker SET is_active=0, end_date'],
        ['GET','/api/stations?brand_id=','Станции (с фильтром)','SELECT + JOIN brand'],
        ['GET','/api/models?brand_id=','Модели авто','SELECT + JOIN brand'],
        ['GET','/api/spots','Все точки сварки','SELECT + JOIN model'],
        ['GET','/api/spots?model_id=','Точки по модели','SELECT + WHERE'],
        ['POST','/api/spots','Добавить точку','INSERT INTO spot'],
        ['GET','/api/spots/:id/gun-info','Полная инфо по точке','SELECT + 6 JOIN через welding_setup'],
        ['GET','/api/transformers','Все трансформаторы','SELECT * FROM trans'],
        ['POST','/api/transformers','Добавить трансформатор','INSERT INTO trans'],
        ['GET','/api/parameters','Параметры сварки','SELECT * FROM parameters'],
        ['GET','/api/maintenance','Все записи ТО','SELECT + JOIN worker + gun'],
        ['POST','/api/maintenance','Добавить ТО','INSERT INTO maintenance'],
        ['DELETE','/api/maintenance/:id','Удалить запись ТО','DELETE FROM maintenance'],
        ['GET','/api/defects','Все дефекты','SELECT + JOIN worker + spot + gun'],
        ['POST','/api/defects','Добавить дефект','INSERT INTO defects'],
        ['DELETE','/api/defects/:id','Удалить дефект','DELETE FROM defects'],
        ['GET','/api/welding-setup','Установки точек на пистолеты','SELECT + JOIN'],
        ['POST','/api/welding-setup','Назначить точку на пистолет','INSERT INTO welding_setup'],
        ['POST','/api/welding-setup/transfer','Перенести точку на другой пистолет','TRANSACTION: UPDATE + INSERT'],
        ['GET','/api/gun-assignments','Привязки пистолет→трансформатор','SELECT + JOIN'],
        ['GET','/api/transformer-assignments','Привязки трансформатор→станция','SELECT + JOIN'],
      ]),
      br(),

      // ── 5. SQL ЗАПРОСЫ ─────────────────────────────────────────────────────
      h1('5. Ключевые SQL запросы'),
      br(),

      h2('5.1 Полная информация по точке сварки'),
      p('Используется при добавлении дефекта — автоматически заполняет пистолет, трансформатор, станцию и параметры сварки:'),
      ...codeBlock([
        'SELECT',
        '  sp.spot_number, m.model_name, m.model_code, b.brand,',
        '  g.g_num, g.model AS gun_model,',
        '  t.transID, t.type AS trans_type,',
        '  s.station_name,',
        '  p.pressure, p.heat_2, p.turn_R, p.mode',
        'FROM spot sp',
        'JOIN model m ON sp.model_id = m.UniqueID',
        'JOIN brand b ON m.brand_id  = b.UniqueID',
        'LEFT JOIN welding_setup ws',
        '       ON ws.spot_id = sp.UniqueID AND ws.is_active = 1',
        'LEFT JOIN gun g   ON ws.gun_id = g.UniqueID',
        'LEFT JOIN gun_transformer_assignment gta',
        '       ON gta.gun_id = g.UniqueID AND gta.is_active = 1',
        'LEFT JOIN trans t ON gta.transformer_id = t.UniqueID',
        'LEFT JOIN transformer_station_assignment tsa',
        '       ON tsa.transformer_id = t.UniqueID AND tsa.is_active = 1',
        'LEFT JOIN station s ON tsa.station_id = s.UniqueID',
        'LEFT JOIN parameters p ON ws.parameter_id = p.UniqueID',
        'WHERE sp.UniqueID = ?',
      ]),
      br(),

      h2('5.2 Пример результата запроса по точке №21'),
      makeTable(
        ['spot_number','model_name','brand','g_num','gun_model','transID','type','station_name','pressure','heat_2','mode'],
        sampleWS.map(r => [r.spot_number, r.model_name, r.brand, r.g_num, r.gun_model, r.transID, r.type, r.station_name, r.pressure, r.heat_2, r.mode])
      ),
      br(),

      h2('5.3 Добавление дефекта'),
      ...codeBlock([
        'INSERT INTO defects',
        '  (problem_code, root_cause, solution, df_date, worker_name, spot_id, gun_id)',
        'VALUES (?, ?, ?, ?, ?, ?, ?)',
      ]),
      p('Поле worker_name хранит UniqueID работника (FK → worker.UniqueID).'),
      br(),

      h2('5.4 Добавление ТО'),
      ...codeBlock([
        'INSERT INTO maintenance',
        '  (first_weld, second_weld, third_weld,',
        '   first_pressure, second_pressure, third_pressure,',
        '   to_date, worker_id, gun_id)',
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ]),
      br(),

      h2('5.5 Перенос точки на другой пистолет (транзакция)'),
      p('При переносе точки на другой пистолет выполняется атомарная транзакция из двух операций:'),
      ...codeBlock([
        '-- Шаг 1: деактивируем текущую установку',
        'UPDATE welding_setup',
        '  SET is_active = 0, end_date = ?',
        '  WHERE UniqueID = ?;',
        '',
        '-- Шаг 2: создаём новую установку с новым пистолетом',
        'INSERT INTO welding_setup',
        '  (comments, start_date, is_active, spot_id, gun_id, parameter_id)',
        '  VALUES (?, ?, 1, ?, ?, ?);',
      ]),
      p('Старая запись не удаляется — сохраняется история перемещений.'),
      br(),

      h2('5.6 Увольнение работника'),
      ...codeBlock([
        'UPDATE worker',
        '  SET end_date = ?, is_active = 0',
        '  WHERE UniqueID = ?',
      ]),
      br(),

      h2('5.7 Все пистолеты с данными трансформатора и станции'),
      ...codeBlock([
        'SELECT g.UniqueID, g.g_num, g.model,',
        '       t.transID, t.type AS trans_type,',
        '       s.station_name, b.brand',
        'FROM gun g',
        'LEFT JOIN gun_transformer_assignment gta',
        '       ON gta.gun_id = g.UniqueID AND gta.is_active = 1',
        'LEFT JOIN trans t ON gta.transformer_id = t.UniqueID',
        'LEFT JOIN transformer_station_assignment tsa',
        '       ON tsa.transformer_id = t.UniqueID AND tsa.is_active = 1',
        'LEFT JOIN station s ON tsa.station_id = s.UniqueID',
        'LEFT JOIN brand b   ON s.brand_id = b.UniqueID',
        'WHERE s.brand_id = ?   -- фильтр по участку',
        'ORDER BY g.g_num',
      ]),
      br(),

      // ── 6. АВТОМАТИЗАЦИЯ ───────────────────────────────────────────────────
      h1('6. Автоматизация — что происходит при изменениях'),
      br(),

      h2('6.1 При выборе точки сварки (форма дефекта)'),
      p('Последовательность автоматических действий:'),
      makeTable(['Шаг','Действие','Источник данных'],[
        ['1','Пользователь вводит номер точки','Ввод в поле поиска'],
        ['2','Фильтрация точек по введённым цифрам','spot (16 680 записей)'],
        ['3','Пользователь выбирает точку','—'],
        ['4','GET /api/spots/:id/gun-info','welding_setup → gun → trans → station'],
        ['5','Показывается зелёная карточка: модель, участок, параметры сварки','parameters (давление, ток, режим, электрод)'],
        ['6','Пистолет заполняется автоматически','welding_setup.gun_id'],
        ['7','Показывается синяя карточка пистолета','gun + trans + station'],
      ]),
      br(),

      h2('6.2 При замене пистолета (перенос точки)'),
      p('Если пистолет физически заменяется или точка переносится на другой пистолет:'),
      makeTable(['Шаг','Что происходит в БД'],[
        ['1','Старая запись welding_setup: is_active=0, end_date=дата замены'],
        ['2','Новая запись welding_setup: is_active=1, новый gun_id, start_date=сегодня'],
        ['3','История сохраняется — можно видеть все прошлые пистолеты на точке'],
        ['4','gun_transformer_assignment и transformer_station_assignment НЕ меняются'],
      ]),
      br(),

      h2('6.3 При подсчёте средних в форме ТО'),
      p('Прямо при вводе замеров система в реальном времени вычисляет:'),
      ...codeBlock([
        'Ср. ток = (замер_1 + замер_2 + замер_3) / 3',
        'Ср. давление = (давление_1 + давление_2 + давление_3) / 3',
      ]),
      p('Вычисление происходит в браузере (JavaScript), в БД сохраняются все три исходных замера.'),
      br(),

      h2('6.4 При деактивации работника'),
      makeTable(['Шаг','Что происходит'],[
        ['1','UPDATE worker SET is_active=0, end_date=дата'],
        ['2','Работник исчезает из списка выбора при создании ТО и дефектов'],
        ['3','Исторические записи ТО и дефектов за этим работником сохраняются'],
      ]),
      br(),

      // ── 7. ИЕРАРХИЯ ДАННЫХ ─────────────────────────────────────────────────
      h1('7. Иерархия и устройство данных'),
      br(),
      ...codeBlock([
        'УЧАСТОК (brand)',
        '├── МОДЕЛИ АВТО (model)',
        '│   └── ТОЧКИ СВАРКИ (spot)',
        '│       └── УСТАНОВКА (welding_setup)  ←── ПАРАМЕТРЫ (parameters)',
        '│               └── ПИСТОЛЕТ (gun)',
        '│                       └── ТРАНСФОРМАТОР (trans)',
        '│                               └── СТАНЦИЯ (station)',
        '│',
        '├── РАБОТНИКИ (worker)',
        '│   ├── записывают ТО (maintenance) → на пистолет',
        '│   └── фиксируют ДЕФЕКТЫ (defects) → на точку + пистолет',
        '│',
        '└── СТАНЦИИ (station)',
        '    └── привязаны к трансформаторам (transformer_station_assignment)',
      ]),
      br(),

      // ── 8. СТАТИСТИКА ──────────────────────────────────────────────────────
      h1('8. Статистика базы данных'),
      makeTable(['Таблица','Записей','Описание'],[
        ['brand', counts.brand, 'Производители автомобилей'],
        ['model', counts.model, 'Модели авто'],
        ['station', counts.station, 'Сварочные станции'],
        ['trans', counts.trans, 'Трансформаторы'],
        ['gun', counts.gun, 'Сварочные пистолеты'],
        ['spot', counts.spot.toLocaleString(), 'Точки сварки'],
        ['parameters', counts.parameters, 'Наборы параметров сварки'],
        ['welding_setup', counts.welding_setup.toLocaleString(), 'Привязки точка→пистолет→параметры'],
        ['gun_transformer_assignment', counts.gun_transformer_assignment, 'Привязки пистолет→трансформатор'],
        ['transformer_station_assignment', counts.transformer_station_assignment, 'Привязки трансформатор→станция'],
        ['worker', counts.worker, 'Сотрудники'],
        ['maintenance', counts.maintenance, 'Записи ТО'],
        ['defects', counts.defects, 'Записи дефектов'],
      ]),
      br(),

      new Paragraph({
        children: [new TextRun({ text: 'Документ сгенерирован автоматически системой WeldTeam · 15.05.2026', size: 18, color: '9CA3AF' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('WeldTeam_Documentation.docx', buf);
  console.log('Файл создан: WeldTeam_Documentation.docx');
});
