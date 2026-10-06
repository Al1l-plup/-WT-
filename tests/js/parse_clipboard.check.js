/* Регрессионная проверка Sheet._parseClipboard (разбор буфера Excel/TSV с кавычками)
   без браузера: грузим app/static/sheet.js со стабами window/document и прогоняем
   кейсы. Вызывается из tests/test_sheet_js_paste.py. Выход 0 — ок, 1 — провал. */
const path = require('path');
global.window = {};
global.document = {
  head: { appendChild() {} },
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
  getElementById: () => null,
  addEventListener() {},
};
require(path.join(__dirname, '..', '..', 'app', 'static', 'sheet.js'));
const Sheet = global.window.Sheet;

let fail = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { console.error('FAIL', name, '\n  got ', a, '\n  want', b); fail++; }
  else console.log('ok  ', name);
};

if (typeof Sheet?._parseClipboard !== 'function') { console.error('Sheet._parseClipboard не найден'); process.exit(1); }

// обычный TSV
eq('plain row', Sheet._parseClipboard('a\tb\tc'), [['a', 'b', 'c']]);
// CRLF между строк + хвостовой перевод строки отбрасывается
eq('crlf + trailing', Sheet._parseClipboard('a\tb\r\nc\td\r\n'), [['a', 'b'], ['c', 'd']]);
// ГЛАВНОЕ: ячейка с переводом строки внутри (в кавычках) НЕ рвёт строку и не сдвигает колонки
const clip = '1\t2\t"L1\r\nL2"\tx\r\n3\t4\t"M1\r\nM2"\ty\r\n';
const g = Sheet._parseClipboard(clip);
eq('multiline → 2 rows (не 4)', g.length, 2);
eq('multiline cell intact', g[0][2], 'L1\nL2');
eq('cols aligned r0', g[0], ['1', '2', 'L1\nL2', 'x']);
eq('cols aligned r1', g[1], ['3', '4', 'M1\nM2', 'y']);
// удвоенные кавычки → одна; кавычка-разделитель только в начале ячейки
eq('escaped quotes', Sheet._parseClipboard('"a ""b"" c"\tz'), [['a "b" c', 'z']]);
eq('mid-field quote literal', Sheet._parseClipboard('6" pipe\tz'), [['6" pipe', 'z']]);
// пустые ячейки сохраняются (выравнивание)
eq('empty cells preserved', Sheet._parseClipboard('a\t\t\tb'), [['a', '', '', 'b']]);

// ── Ctrl+стрелка: край блока данных (_jumpEdge) ──────────────────────────────
function grid(rows2d) {
  const nc = Math.max(...rows2d.map(r => r.length));
  const cols = Array.from({ length: nc }, (_, i) => ({ name: 'c' + i }));
  const rows = rows2d.map(r => { const o = {}; for (let i = 0; i < nc; i++) o['c' + i] = r[i] ?? ''; return o; });
  const self = { rows, cols, view: rows.map((_, i) => i) };
  self._isBlank = Sheet.prototype._isBlank.bind(self);
  self._jumpEdge = Sheet.prototype._jumpEdge.bind(self);
  return self;
}
// вертикаль: a,b,<пусто>,c,d,d  (колонка 0)
const gv = grid([['a'], ['b'], [''], ['c'], ['d'], ['d']]);
eq('edge down: блок до пустой', gv._jumpEdge(0, 0, 1, 0), { r: 1, c: 0 });   // a→b (row2 пусто)
eq('edge down: через пропуск', gv._jumpEdge(1, 0, 1, 0), { r: 3, c: 0 });   // b→(пропуск)→c
eq('edge down: сплошной блок', gv._jumpEdge(3, 0, 1, 0), { r: 5, c: 0 });   // c,d,d → последняя
eq('edge down: у края', gv._jumpEdge(5, 0, 1, 0), { r: 5, c: 0 });
eq('edge up from blank', gv._jumpEdge(2, 0, -1, 0), { r: 1, c: 0 });        // пусто → первая заполненная вверх
eq('edge up: у края', gv._jumpEdge(0, 0, -1, 0), { r: 0, c: 0 });
// горизонталь: x,y,<пусто>,z
const gh = grid([['x', 'y', '', 'z']]);
eq('edge right: блок до пустой', gh._jumpEdge(0, 0, 0, 1), { r: 0, c: 1 });
eq('edge right: через пропуск', gh._jumpEdge(0, 1, 0, 1), { r: 0, c: 3 });
eq('edge right: у края', gh._jumpEdge(0, 3, 0, 1), { r: 0, c: 3 });

if (fail) { console.error(`\n${fail} FAILED`); process.exit(1); }
console.log('\nparser + edge-jump OK');
