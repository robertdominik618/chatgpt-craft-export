# Instalační manuál — Craft Export pro ChatGPT

Tento návod popisuje instalaci **Craft Export for ChatGPT** pro Chrome/Chromium, Firefox a Safari.

Aktuální release najdete vždy zde:

https://github.com/robertdominik618/chatgpt-craft-export/releases/latest

> Poznámka: Chrome a Firefox lze nyní instalovat jako vývojové rozšíření. Safari používá Safari Web Extension projekt v Xcode a pro běžnou distribuci vyžaduje Apple signing.

---

## 1. Chrome / Chromium / Edge

### Stažení

1. Otevřete stránku Releases:
   https://github.com/robertdominik618/chatgpt-craft-export/releases/latest
2. Stáhněte balíček pro Chromium, například:
   `craft-export-chromium-vX.Y.Z.zip`
3. ZIP rozbalte do samostatné složky.

Ve složce musí být přímo soubor:

`manifest.json`

### Instalace

1. Otevřete v Chromu:
   `chrome://extensions`
2. Zapněte **Režim pro vývojáře / Developer mode**.
3. Klikněte na **Načíst rozbalený doplněk / Load unpacked**.
4. Vyberte rozbalenou složku, ve které je `manifest.json`.
5. Zkontrolujte, že se zobrazí **Craft Export for ChatGPT**.
6. Otevřete nebo obnovte:
   https://chatgpt.com
7. Pro jistotu proveďte tvrdý refresh:
   - macOS: `⌘ + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

### Aktualizace

Pokud jste pouze nahradili soubory novější verzí:

1. otevřete `chrome://extensions`,
2. u **Craft Export for ChatGPT** klikněte na **Obnovit / Reload**,
3. obnovte ChatGPT tvrdým refreshem.

### Jak poznáte, že rozšíření funguje

Pod odpovědí ChatGPT se mají zobrazit exportní akce WordCraft a PdfCraft, typicky v blízkosti ostatních akcí odpovědi a Adobe PDF tlačítka.

---

## 2. Firefox

### Stažení

1. Otevřete:
   https://github.com/robertdominik618/chatgpt-craft-export/releases/latest
2. Stáhněte:
   `craft-export-firefox-vX.Y.Z.zip`
3. ZIP rozbalte.

### Dočasná instalace pro vývoj/testování

1. Ve Firefoxu otevřete:
   `about:debugging#/runtime/this-firefox`
2. Klikněte na:
   **Načíst dočasný doplněk / Load Temporary Add-on**
3. Vyberte soubor:
   `manifest.json`
   z rozbalené Firefox složky.
4. Otevřete:
   https://chatgpt.com
5. Proveďte tvrdý refresh:
   - macOS: `⌘ + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

### Důležité omezení

Takto načtený Firefox doplněk je **dočasný**. Po úplném restartu Firefoxu jej může být nutné načíst znovu přes `about:debugging`.

Pro trvalou instalaci bez tohoto omezení musí být rozšíření podepsáno a publikováno přes Mozilla Add-ons (AMO).

---

## 3. Safari

Safari Web Extension se neinstaluje jako „Load unpacked“. Safari vyžaduje malou hostitelskou aplikaci v Xcode.

### Varianta A — použít připravený Safari Xcode projekt

V repozitáři je připravený Safari wrapper:

`safari-xcode/Craft Export for ChatGPT/`

1. Naklonujte repozitář nebo stáhněte zdrojové soubory.
2. Otevřete v Xcode:
   `Craft Export for ChatGPT.xcodeproj`
3. V Xcode vyberte scheme:
   **Craft Export for ChatGPT (macOS)**
4. Otevřete projekt a zvolte:
   **Signing & Capabilities**
5. U targetu:
   **Craft Export for ChatGPT (macOS)**
   nastavte váš **Team**.
6. Zkontrolujte také target:
   **Craft Export for ChatGPT Extension (macOS)**
7. Spusťte projekt přes **Run ▶**.
8. Po spuštění otevřete:
   **Safari → Nastavení → Rozšíření**
9. Zapněte:
   **Craft Export for ChatGPT**
10. Povolte rozšíření přístup k:
    `chatgpt.com`
11. Otevřete ChatGPT a obnovte stránku.

### Varianta B — znovu vygenerovat Safari wrapper

Pokud chcete wrapper vytvořit z aktuálního Chromium buildu:

```bash
npm run build

xcrun safari-web-extension-converter dist/chromium \
  --project-location safari-xcode \
  --app-name "Craft Export for ChatGPT" \
  --bundle-identifier "cz.urgentsolution.craftexport" \
  --copy-resources \
  --no-open
```

Poté otevřete vygenerovaný Xcode projekt a pokračujte signingem podle předchozí části.

### Distribuce Safari verze

Pro běžné použití bez Xcode je potřeba aplikaci podepsat a distribuovat například přes:

- Mac App Store,
- Developer ID,
- případně interní firemní distribuci.

---

## 4. Oprávnění a soukromí

Rozšíření potřebuje přístup pouze k ChatGPT webovým doménám, aby mohlo vložit exportní ovládací prvky do rozhraní.

Projekt:

- nepoužívá vlastní cloudový backend pro konverzi,
- nepoužívá analytiku ani telemetry SDK,
- DOCX vytváří lokálně,
- na macOS může použít volitelný lokální Native Messaging bridge pro uložení/otevření DOCX ve WordCraftu a PDF v PdfCraftu,
- při nedostupném bridge použije běžný download/print fallback prohlížeče.

Více viz:
- [PRIVACY.md](../PRIVACY.md)
- [SECURITY.md](../SECURITY.md)

---

## 5. Řešení problémů

### Tlačítka se nezobrazují

Chrome:
- otevřete `chrome://extensions`,
- klikněte u rozšíření na **Reload**,
- obnovte ChatGPT pomocí `⌘/Ctrl + Shift + R`.

Firefox:
- zkontrolujte `about:debugging#/runtime/this-firefox`,
- případně dočasný doplněk načtěte znovu,
- obnovte ChatGPT.

Safari:
- ověřte, že je rozšíření zapnuté v **Safari → Nastavení → Rozšíření**,
- ověřte povolení pro `chatgpt.com`,
- znovu spusťte hostitelskou aplikaci z Xcode, pokud testujete vývojovou verzi.

### Přímé otevření ve WordCraftu/PdfCraftu na macOS

Pro přímé otevírání desktopových aplikací spusťte v kořeni repozitáře:

```bash
./native/install_macos.sh
```

Poté znovu načtěte doplněk a proveďte tvrdý refresh ChatGPT.

Očekávané chování s nainstalovaným bridge:

- **WordCraft — Převést do DOC**: vytvoří DOCX, uloží ho do `~/Downloads`, otevře ho ve WordCraftu a WordCraft přenese do popředí.
- **PdfCraft — Převést do PDF**: vytvoří PDF, uloží ho do `~/Downloads` a otevře ho v PdfCraftu. Tiskový dialog se automaticky neotevírá.

Pokud bridge není dostupný, WordCraft použije běžné stažení DOCX a PdfCraft fallback na tisk/PDF v prohlížeči.

### Stabilní umístění rozbaleného doplňku

Pro dlouhodobé vývojové použití nedoporučujeme nechávat rozbalený doplněk v dočasné složce Downloads, která může být později smazána. Lepší je stabilní adresář v uživatelském profilu nebo ve workspace projektu. Pokud se zdrojová složka přesune nebo zmizí, Chrome může mít část starého kódu ještě v paměti, ale ikony a další web-accessible resources přestanou fungovat.

### Název exportovaného souboru

Rozšíření se snaží vytvořit název souboru podle uživatelského promptu, ke kterému daná odpověď ChatGPT patří. Neplatné znaky názvu souboru jsou automaticky odstraněny a velmi dlouhý název je zkrácen.

---

## 6. Bezpečnostní doporučení

Instalujte vývojový build pouze z tohoto repozitáře nebo z jeho Releases. Před instalací můžete zkontrolovat zdrojový kód, manifest a SHA-256 release artefaktů, pokud jsou u daného vydání publikovány.
