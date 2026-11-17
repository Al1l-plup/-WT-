"""Скрипты развёртывания (deploy/*.ps1): защиты, на которые опирается восстановление сервера.

Случай 2026-11-17: обновление Windows на сервере снесло Git и службу WeldTeamMES; установщик
должен восстанавливать стек, не трогая базу, а update.ps1 — находить Git и требовать админа.
"""
import re
import shutil
import subprocess
from pathlib import Path

import pytest

DEPLOY = Path(__file__).resolve().parents[1] / 'deploy'
SCRIPTS = sorted(DEPLOY.glob('*.ps1'))


@pytest.mark.parametrize('path', SCRIPTS, ids=lambda p: p.name)
def test_scripts_are_ascii(path):
    """Сообщения на английском и только ASCII: под кодировкой консоли сервера кириллица в
    PowerShell 5.1 без BOM превращается в «кракозябры» и ломает строки."""
    bad = [i for i, line in enumerate(path.read_bytes().splitlines(), 1) if re.search(rb'[^\x00-\x7f]', line)]
    assert not bad, f'{path.name}: не-ASCII в строках {bad}'


def test_installer_keeps_data_and_rebuilds_broken_venv():
    src = (DEPLOY / 'install.ps1').read_text(encoding='ascii')
    assert "Test-Path $db) { Info 'Database present - not touched.'" in src         # базу не трогает
    assert '$script:Existing -and -not $FreshDb' in src                              # без БД на старой установке — стоп
    assert 'virtualenv is broken or too old' in src and 'Remove-Item "$Dir\\.venv"' in src
    assert "$PyOk = 'Python 3\\.(1[2-9]|[2-9]\\d)'" in src                          # Python 3.12+, как CI
    assert 'safe.directory' in src                                                  # смена владельца папки


def test_update_finds_git_and_requires_admin():
    src = (DEPLOY / 'update.ps1').read_text(encoding='ascii')
    assert 'Get-Command git' in src and r'Git\cmd' in src                             # git вне PATH — ищем сами
    assert 'IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)' in src
    # всё проверяется ДО первой команды, меняющей код
    assert src.index('Run as administrator') < src.index('Git-Do -C $Dir fetch')
    assert src.index('Git not found') < src.index('Git-Do -C $Dir fetch')


@pytest.mark.skipif(not (shutil.which('powershell') or shutil.which('pwsh')), reason='нет PowerShell')
@pytest.mark.parametrize('path', SCRIPTS, ids=lambda p: p.name)
def test_scripts_parse(path):
    ps = shutil.which('powershell') or shutil.which('pwsh')
    cmd = ('$e=$null;$t=$null;[void][System.Management.Automation.Language.Parser]::ParseFile('
           f"'{path}',[ref]$t,[ref]$e);$e.Count")
    r = subprocess.run([ps, '-NoProfile', '-NonInteractive', '-Command', cmd], capture_output=True, text=True, timeout=60)
    assert r.returncode == 0 and r.stdout.strip() == '0', r.stdout + r.stderr
