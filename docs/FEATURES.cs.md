# Přehled funkcí — Craft Export pro ChatGPT

Projekt vytvořil a spravuje **[robertdominik618](https://github.com/robertdominik618)**.

Tento dokument popisuje aktuálně implementované funkce Craft Export pro ChatGPT.

## 1. Integrace do lišty ChatGPT

Doplněk přidává do lišty akcí u odpovědí ChatGPT dvě vlastní akce:

- **WordCraft — Převést do DOC**
- **PdfCraft — Převést do PDF**

Ovládací prvky jsou navržené tak, aby vizuálně zapadly vedle standardních akcí ChatGPT a Adobe.

Aktuálně je implementováno:

- originální ikony aplikací WordCraft a PdfCraft;
- samostatný vertikální oddělovač ve stylu Adobe před každou Craft akcí;
- kompaktní ovládací prvky o výšce 32 px;
- zvýraznění při najetí myší;
- vysvětlující tooltip zobrazený pouze při najetí na příslušné tlačítko;
- podpora focusu z klávesnice;
- zpracování `pointerdown` v capture fázi, aby ChatGPT/React nepohltil kliknutí při překreslení lišty;
- fallback na click/klávesnici a ochrana proti dvojímu spuštění.

## 2. Automatický název souboru podle promptu

DOCX i PDF získávají název automaticky podle **uživatelského promptu, ke kterému patří exportovaná odpověď**.

Logika názvu:

- pokud je dostupný prompt, použije jeho text;
- odstraní znaky neplatné pro název souboru;
- sjednotí nadbytečné mezery;
- příliš dlouhý název zkrátí;
- při nemožnosti získat prompt použije bezpečný fallback;
- při ukládání přes native bridge nepřepíše existující soubor a přidá číselný suffix.

Příklad:

`Vysvětli ocenění výrobní firmy metodou DCF`

může vytvořit:

`Vysvětli ocenění výrobní firmy metodou DCF.docx`

nebo:

`Vysvětli ocenění výrobní firmy metodou DCF.pdf`

## 3. WordCraft — Převést do DOC

Tlačítko WordCraft vytváří skutečný standardní dokument **OOXML DOCX**.

### Lokální generování DOCX

DOCX vzniká lokálně v prohlížeči. Doplněk vytváří ZIP/OOXML strukturu bez cloudové konverzní služby.

Aktuální exporter zachovává čitelnou podobu:

- nadpisů;
- odstavců;
- tučného a kurzívního textu;
- inline kódu;
- bloků kódu;
- číslovaných seznamů;
- odrážkových seznamů;
- citací/blockquotes;
- základních tabulek;
- horizontálních oddělovačů;
- odkazů;
- Unicode textu včetně češtiny.

### Automatické otevření ve WordCraftu na macOS

Je-li nainstalovaný volitelný lokální Native Messaging bridge:

1. doplněk vytvoří DOCX;
2. data DOCX předá lokálně native bridge;
3. bridge uloží soubor do `~/Downloads`;
4. bridge otevře dokument pomocí bundle identifieru WordCraftu `ai.storyteller.wordcraft`;
5. WordCraft se explicitně aktivuje a přenese do popředí.

Pokud WordCraft nebo native bridge není dostupný, použije se fallback na běžné stažení DOCX v prohlížeči.

## 4. PdfCraft — Převést do PDF

Tlačítko PdfCraft vytvoří skutečný PDF soubor z vybrané odpovědi ChatGPT.

### Automatické otevření v PdfCraftu na macOS

Je-li nainstalovaný Native Messaging bridge:

1. odpověď se převede do čistého HTML určeného pro tisk;
2. lokální Chromium engine toto HTML vykreslí do PDF v headless režimu;
3. PDF se uloží do `~/Downloads`;
4. bridge spustí PdfCraft s vytvořeným PDF;
5. PdfCraft dokument otevře.

Doplněk **automaticky neotevírá tiskové dialogové okno PdfCraftu**.

Pokud native bridge není dostupný, doplněk použije fallback na běžný tiskový/PDF workflow prohlížeče.

## 5. Native Messaging bridge

Volitelný macOS bridge se nachází v:

- `native/pdfcraft_bridge.py`
- `native/install_macos.sh`

Historický název souboru obsahuje PdfCraft, ale bridge nyní obsluhuje **WordCraft i PdfCraft**.

Instalační skript registruje Native Messaging host pro:

- Google Chrome / Chromium-compatible instalaci;
- Firefox.

Bridge:

- běží pouze lokálně na Macu uživatele;
- neposkytuje veřejnou síťovou službu;
- přijímá pouze explicitní požadavky na export z doplňku;
- ukládá soubory lokálně;
- otevírá WordCraft/PdfCraft přes nainstalované desktopové aplikace;
- chyby loguje lokálně do `~/Library/Logs/Craft Export for ChatGPT/`.

## 6. Soukromí

Projekt je navržen jako local-first.

Neobsahuje:

- vlastní cloudovou konverzní službu;
- analytické SDK;
- reklamní tracking;
- upload telemetrie;
- vzdálenou službu pro zpracování dokumentů.

Doplněk čte pouze vykreslenou odpověď asistenta vybranou k exportu a související uživatelský prompt pro vytvoření názvu souboru.

Při použití native bridge se příslušná reprezentace dokumentu předává pouze lokálně mezi rozšířením a Native Messaging procesem na stejném počítači.

## 7. Podporované prohlížeče

### Chrome / Chromium / Edge

- Manifest V3.
- Vývojová instalace přes `Load unpacked`.
- Native Messaging na macOS.
- Přímé otevření WordCraftu i PdfCraftu, pokud je bridge nainstalovaný.

### Firefox

- Manifest V3 + Gecko extension ID.
- Dočasná vývojová instalace přes `about:debugging`.
- macOS installer registruje také Firefox Native Messaging host.

### Safari

- Safari Web Extension Xcode wrapper v `safari-xcode/`.
- Pro standardní Safari instalaci/distribuci je nutné Xcode podepsání.
- UI doplňku vychází ze stejné WebExtension codebase.
- Pro produkční přímé otevírání desktopových aplikací může být nutné doplnit Safari-specific signing/entitlements.

## 8. Odolnost vůči změnám ChatGPT

Lišta akcí ChatGPT není veřejné extension API a může se měnit.

Doplněk proto:

- používá sémantické markery odpovědi asistenta, pokud jsou dostupné;
- sleduje DOM přes `MutationObserver`;
- dynamicky hledá nativní action row;
- rozpoznává Adobe PDF akci, pokud je přítomná;
- při překreslení ChatGPT znovu umístí Craft akce;
- používá capture-phase pointer handling, aby nedocházelo ke ztrátě kliknutí.

## 9. Aktuální omezení

DOCX exporter zatím dokonale nezachovává:

- složité vnořené číslování;
- rovnice jako nativní Word equations;
- složité rowspan/colspan tabulky;
- strukturované citace a footnotes;
- všechny vložené obrázky;
- plné syntax highlighting.

Přímé otevírání desktopových aplikací je aktuálně zaměřené na macOS instalace WordCraftu a PdfCraftu.

## 10. Autor projektu

Craft Export pro ChatGPT vytvořil **[robertdominik618](https://github.com/robertdominik618)**.
