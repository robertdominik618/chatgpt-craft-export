# Craft Export pro ChatGPT

**Craft Export pro ChatGPT** je open-source doplněk pro prohlížeče, který přímo do lišty akcí pod odpovědí ChatGPT přidává vlastní tlačítka pro **WordCraft** a **PdfCraft**.

Projekt vytvořil a spravuje **[robertdominik618](https://github.com/robertdominik618)**.

> Jde o komunitní projekt. Není oficiálně přidružený k OpenAI, Adobe, ArtCraft, WordCraft ani PdfCraft a tyto společnosti jej neschválily ani nesponzorují.

## Co jednotlivá tlačítka dělají

Doplněk přidává vedle standardních akcí ChatGPT dvě vlastní akce s ikonami aplikací, oddělovači, zvýrazněním při najetí myší a vysvětlujícím tooltipem.

### WordCraft — Převést do DOC

Tlačítko **WordCraft · Převést do DOC** převede vybranou odpověď ChatGPT do skutečného standardního dokumentu OOXML `.docx`.

- DOCX se vytvoří lokálně.
- Název souboru se automaticky odvodí z uživatelského promptu, ke kterému odpověď patří.
- Nepovolené znaky v názvu souboru se odstraní a příliš dlouhý název se zkrátí.
- Soubor se rovnou stáhne do běžného umístění pro stahované soubory.
- WordCraft se po stažení **automaticky neotevírá**.
- Export zachovává běžnou strukturu dokumentu, například nadpisy, odstavce, zvýraznění, seznamy, bloky kódu, citace, tabulky, odkazy a Unicode/češtinu.

### PdfCraft — Převést do PDF

Tlačítko **PdfCraft · Převést do PDF** vytvoří z vybrané odpovědi skutečný PDF soubor a při nainstalovaném lokálním macOS bridge jej rovnou otevře v desktopové aplikaci **PdfCraft**.

- Název PDF se automaticky odvodí ze souvisejícího uživatelského promptu.
- PDF se uloží lokálně, standardně do složky `Downloads`.
- Na macOS volitelný Native Messaging bridge otevře vytvořený soubor přímo v `PdfCraft.app`.
- Dialogové okno PdfCraftu pro tisk se **automaticky neotevírá**.
- Pokud lokální bridge není dostupný, doplněk použije záložní lokální tiskový/PDF workflow prohlížeče.
- Není potřeba žádná cloudová konverzní služba.

## Vzhled a ovládání

Tlačítka jsou navržena tak, aby přirozeně zapadla do stejné lišty jako ostatní akce ChatGPT a Adobe.

Obsahují:

- originální ikony aplikací WordCraft a PdfCraft;
- kompaktní vzhled odpovídající liště ChatGPT;
- oddělovače ve stylu Adobe;
- zvýraznění tlačítka po najetí myší;
- vysvětlující text, který se zobrazí pouze při najetí myší nebo při focusu daného tlačítka.

## Proč DOCX a ne starý DOC

WordCraft nativně pracuje s formátem `.docx`. Proto doplněk vytváří skutečný OOXML dokument namísto HTML souboru pouze přejmenovaného na `.doc`. Výsledný soubor je spolehlivější pro WordCraft, Microsoft Word, LibreOffice a další kompatibilní editory.

## Podporované prohlížeče

| Prohlížeč | Stav | Poznámka |
| --- | --- | --- |
| Chrome / Chromium / Edge | Připraveno | Manifest V3; na macOS podporován lokální PdfCraft bridge |
| Firefox | Připraveno | Manifest V3 + Gecko ID; macOS Native Messaging installer je součástí projektu |
| Safari | Xcode wrapper součástí | Safari Web Extension projekt je v `safari-xcode/`; pro běžnou distribuci je nutné Apple podepsání |

## Instalační manuály

- [Český instalační manuál — Chrome, Firefox, Safari](docs/INSTALLATION.cs.md)
- [English installation guide — Chrome, Firefox, Safari](docs/INSTALLATION.en.md)

## Rychlá instalace pro vývoj

### Chrome / Chromium / Edge

```bash
git clone https://github.com/robertdominik618/chatgpt-craft-export.git
cd chatgpt-craft-export
npm run build
```

Potom otevřete `chrome://extensions`, zapněte **Režim pro vývojáře**, zvolte **Načíst rozbalený doplněk** a vyberte `dist/chromium`.

Na macOS můžete přímé otevírání PDF v PdfCraftu aktivovat pomocí:

```bash
./native/install_macos.sh
```

Poté rozšíření znovu načtěte a proveďte tvrdý refresh ChatGPT.

### Firefox

```bash
npm run build
```

Otevřete `about:debugging#/runtime/this-firefox`, vyberte **Načíst dočasný doplněk / Load Temporary Add-on** a zvolte `dist/firefox/manifest.json`.

Na macOS skript `./native/install_macos.sh` zároveň nainstaluje Firefox Native Messaging host pro přímé otevírání souborů v PdfCraftu.

### Safari

Postupujte podle [docs/SAFARI.md](docs/SAFARI.md). Safari používá Safari Web Extension projekt v Xcode a pro standardní distribuci vyžaduje Apple signing.

## Architektura

Rozšíření sleduje vykreslené odpovědi asistenta a vkládá WordCraft a PdfCraft akce do lišty odpovědi ChatGPT.

**DOCX cesta** vytváří standardní OOXML balíček lokálně přímo v prohlížeči.

**PDF cesta** při dostupném Native Messaging bridge předá tiskovou reprezentaci lokálnímu procesu na stejném počítači. Na macOS bridge lokálně vytvoří PDF, uloží ho a otevře v nainstalované aplikaci PdfCraft. Nepoužívá vzdálenou konverzní službu.

Technické podrobnosti jsou v [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Soukromí

Craft Export pro ChatGPT je navržen jako lokální řešení.

- žádná analytika;
- žádná reklama ani tracking;
- žádná vlastní cloudová konverzní služba projektu;
- DOCX se vytváří lokálně v prohlížeči;
- integrace PdfCraftu používá volitelný lokální Native Messaging bridge na počítači uživatele.

Doplněk musí přečíst vykreslený obsah odpovědi ChatGPT, kterou uživatel zvolil k exportu. Je-li aktivní PdfCraft bridge, tisková reprezentace se předá pouze lokálně z rozšíření do procesu bridge na stejném počítači.

Více viz [PRIVACY.md](PRIVACY.md).

## Vývoj

```bash
npm test
npm run build
```

Projekt obsahuje browser buildy a volitelný lokální macOS bridge pro PdfCraft.

## Autor projektu

Tento projekt vytvořil **[robertdominik618](https://github.com/robertdominik618)**.

Cílem projektu je co nejrychleji a lokálně převádět užitečné výstupy ChatGPT do otevřených dokumentových nástrojů.

## Komunikace s ArtCraft / Storytold

Součástí repozitáře je anglický informační materiál pro vývojáře ArtCraft/Storytold v [docs/STORYTOLD_OUTREACH.md](docs/STORYTOLD_OUTREACH.md).

Názvy a ikony WordCraft a PdfCraft slouží k identifikaci cílových aplikací. Příslušné značky zůstávají vlastnictvím jejich majitelů; podrobnosti jsou v [ATTRIBUTION.md](ATTRIBUTION.md).

## Licence

MIT. Viz [LICENSE](LICENSE).
