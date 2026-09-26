"""Собирает lite/index.html — версию без рекламы платформы — из index.html.

Блоки <!--AD-->…<!--/AD--> удаляются, блоки <!--LITE:…:LITE--> раскомментируются.
Запуск: python3 build.py
"""
import re
from pathlib import Path

root = Path(__file__).parent
src = (root / "index.html").read_text(encoding="utf-8")

lite = re.sub(r"<!--AD-->.*?<!--/AD-->", "", src, flags=re.S)
lite = re.sub(r"<!--LITE:(.*?):LITE-->", r"\1", lite, flags=re.S)
lite = lite.replace('src="app.js"', 'src="../app.js"')
for attr in ("src", "href", "poster", "content"):
    lite = lite.replace(f'{attr}="media/', f'{attr}="../media/').replace(f'{attr}="vendor/', f'{attr}="../vendor/')
lite = lite.replace("<title>Сравнительные предложения в немецком — Stellas</title>",
                    "<title>Сравнительные предложения в немецком</title>")

assert "lava.top" not in lite, "в lite-версии осталась ссылка на платформу"
(root / "lite").mkdir(exist_ok=True)
(root / "lite" / "index.html").write_text(lite, encoding="utf-8")
print("lite/index.html:", len(lite), "bytes")
