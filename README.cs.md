# Craft Export pro ChatGPT

Open-source doplněk pro **Chrome/Chromium, Firefox a Safari**, který pod odpovědi ChatGPT přidává dvě kompaktní akce:

- **Převést do WordCraft (.docx)** — vytvoří skutečný OOXML dokument lokálně v prohlížeči.
- **Převést do PdfCraft (.pdf)** — otevře čisté tiskové zobrazení a standardní dialog pro uložení do PDF.

Projekt neposílá obsah chatu na žádný server, nepoužívá analytiku ani externí API.

## Proč DOCX a ne starý DOC

WordCraft dnes dokumentuje nativní čtení a zápis `.docx`. Proto doplněk generuje skutečný standardní DOCX. Vytvářet HTML soubor pouze přejmenovaný na `.doc` by bylo méně spolehlivé a pro open-source projekt horší technické řešení.

## Instalace pro vývoj

```bash
git clone https://github.com/robertdominik618/chatgpt-craft-export.git
cd chatgpt-craft-export
npm test
npm run build
```

Výstupy:

- Chrome/Chromium/Edge: `dist/chromium`
- Firefox: `dist/firefox`
- Safari: převod `dist/chromium` pomocí Apple Safari Web Extension Converter, viz [docs/SAFARI.md](docs/SAFARI.md)

## Soukromí

Doplněk funguje lokálně. Export se spustí pouze po kliknutí na tlačítko u konkrétní odpovědi. Žádná telemetrie, účet ani cloud nejsou potřeba.

## Licence

MIT.
