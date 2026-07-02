"""Константы предметной области WeldTeam MES."""

# Справочник кодов дефектов точечной сварки (код → название EN / RU).
# Используется миграцией для наполнения таблицы ``defect_code``.
DEFECT_DICTIONARY = {
    'CR': 'Crack / Трещина',
    'SN': 'Small Nugget / Малое ядро',
    'LP': 'Lack of Penetration / Непровар',
    'BN': 'Burnt Nugget / Выжженное ядро',
    'SW': 'Stick Weld / Склейка (тонкое ядро)',
    'P':  'Porosity / Поры',
    'MI': 'Metal Inclusion / Металлические включения',
    'BT': 'Burn-through / Прожог',
    'IE': 'Excessive Indentation / Чрезмерная усадка',
    'MS': 'Metal Spatter / Брызги металла',
    'ME': 'Metal Extrusion / Выдавливание металла',
    'EMU': 'Excess Metal Upset / Избыточный наплыв',
    'MN': 'Missing Nugget / Отсутствует точка',
    'NA': 'No Access / Нет доступа',
    'EO': 'Weld Spot Edge Offset / Смещение от края',
    'BE': 'Loss of backwall echo / Потеря донного сигнала',
}
