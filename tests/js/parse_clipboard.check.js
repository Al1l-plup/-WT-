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

if (fail) { console.error(`\n${fail} FAILED`); process.exit(1); }
console.log('\nparser OK');
