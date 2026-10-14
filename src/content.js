(() => {
  "use strict";

  const ASSISTANT_SELECTOR = '[data-markdown-text-style="assistant-message"]';
  const ACTION_CLASS = "craft-export-actions";
  const BUTTON_CLASS = "craft-export-button";
  const INJECTED_ATTR = "data-craft-export-injected";
  const actionHandlers = new WeakMap();
  let hoverTooltip = null;

  const browserApi = typeof browser !== "undefined" ? browser : chrome;

  function msg(key, fallback) {
    try {
      return browserApi?.i18n?.getMessage?.(key) || fallback;
    } catch {
      return fallback;
    }
  }

  const labels = {
    word: msg("wordButton", "Convert to WordCraft (.docx)"),
    pdf: msg("pdfButton", "Convert to PdfCraft (.pdf)"),
    wordTooltip: msg("wordTooltip", "Export this response as DOCX for WordCraft."),
    pdfTooltip: msg("pdfTooltip", "Open a clean print view for saving as PDF and opening in PdfCraft.")
  };

  function sanitizeFilename(input) {
    const cleaned = (input || "chatgpt-response")
      .replace(/[\\/:*?"<>|\u0000-\u001F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    return cleaned || "chatgpt-response";
  }

  function titleFromMessage(message) {
    const turn = message.closest("[data-talvt-turn-state]") || message.closest("article");
    const prompt = turn?.querySelector('[data-user-message-bubble="true"]')
      || turn?.querySelector('[data-content-search-unit-key$=":user"]');
    const promptText = normalizeText(prompt?.textContent || "");
    if (promptText) return sanitizeFilename(promptText);

    const heading = message.querySelector("h1,h2,h3");
    const source = heading?.textContent || message.textContent || "ChatGPT response";
    return sanitizeFilename(source);
  }

  function cleanClone(message) {
    const clone = message.cloneNode(true);
    clone.querySelectorAll("button,svg,[role='button'],.craft-export-actions").forEach((node) => node.remove());
    return clone;
  }

  function escapeXml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function normalizeText(value) {
    return String(value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function textRun(text, options = {}) {
    if (!text) return "";
    const props = [];
    if (options.bold) props.push("<w:b/>");
    if (options.italic) props.push("<w:i/>");
    if (options.code) {
      props.push('<w:rFonts w:ascii="Menlo" w:hAnsi="Menlo"/>');
      props.push('<w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/>');
    }
    return `<w:r>${props.length ? `<w:rPr>${props.join("")}</w:rPr>` : ""}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  }

  function inlineRuns(node, inherited = {}) {
    if (node.nodeType === Node.TEXT_NODE) {
      return textRun(node.nodeValue, inherited);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    const next = { ...inherited };
    if (tag === "strong" || tag === "b") next.bold = true;
    if (tag === "em" || tag === "i") next.italic = true;
    if (tag === "code") next.code = true;

    if (tag === "br") {
      return "<w:r><w:br/></w:r>";
    }

    if (tag === "a") {
      const label = normalizeText(node.textContent);
      const href = node.getAttribute("href");
      const combined = href && href !== label ? `${label} (${href})` : label;
      return textRun(combined, next);
    }

    return Array.from(node.childNodes).map((child) => inlineRuns(child, next)).join("");
  }

  function paragraphXml(node, style = null, prefix = "") {
    const runs = prefix ? textRun(prefix, { bold: true }) + inlineRuns(node) : inlineRuns(node);
    const pPr = [];
    if (style) pPr.push(`<w:pStyle w:val="${style}"/>`);
    return `<w:p>${pPr.length ? `<w:pPr>${pPr.join("")}</w:pPr>` : ""}${runs || textRun(" ")}</w:p>`;
  }

  function codeParagraphXml(text) {
    const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
    return lines
      .map((line) =>
        `<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/><w:spacing w:before="0" w:after="0"/></w:pPr>${textRun(line || " ", { code: true })}</w:p>`
      )
      .join("");
  }

  function tableXml(table) {
    const rows = Array.from(table.querySelectorAll(":scope > thead > tr, :scope > tbody > tr, :scope > tr"));
    if (!rows.length) return paragraphXml(table);
    const body = rows.map((row) => {
      const cells = Array.from(row.children).filter((el) => /^(TD|TH)$/.test(el.tagName));
      const cellXml = cells.map((cell) => {
        const isHeader = cell.tagName === "TH";
        const content = textRun(normalizeText(cell.textContent) || " ", { bold: isHeader });
        return `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr><w:p>${content}</w:p></w:tc>`;
      }).join("");
      return `<w:tr>${cellXml}</w:tr>`;
    }).join("");
    return `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D1D5DB"/><w:left w:val="single" w:sz="4" w:color="D1D5DB"/><w:bottom w:val="single" w:sz="4" w:color="D1D5DB"/><w:right w:val="single" w:sz="4" w:color="D1D5DB"/><w:insideH w:val="single" w:sz="4" w:color="E5E7EB"/><w:insideV w:val="single" w:sz="4" w:color="E5E7EB"/></w:tblBorders></w:tblPr><w:tblGrid/>${body}</w:tbl>`;
  }

  function blockXml(root) {
    const blocks = [];
    const top = Array.from(root.children);

    const emit = (node, listPrefix = "") => {
      if (!(node instanceof Element)) return;
      const tag = node.tagName.toLowerCase();

      if (/^h[1-6]$/.test(tag)) {
        const level = Math.min(Number(tag[1]), 3);
        blocks.push(paragraphXml(node, `Heading${level}`));
        return;
      }
      if (tag === "p") {
        blocks.push(paragraphXml(node));
        return;
      }
      if (tag === "pre") {
        blocks.push(codeParagraphXml(node.textContent));
        return;
      }
      if (tag === "blockquote") {
        blocks.push(`<w:p><w:pPr><w:ind w:left="720"/><w:color w:val="4B5563"/></w:pPr>${inlineRuns(node)}</w:p>`);
        return;
      }
      if (tag === "table") {
        blocks.push(tableXml(node));
        return;
      }
      if (tag === "ul" || tag === "ol") {
        Array.from(node.children).filter((el) => el.tagName === "LI").forEach((li, index) => {
          const prefix = tag === "ul" ? "• " : `${index + 1}. `;
          blocks.push(paragraphXml(li, null, prefix));
        });
        return;
      }
      if (tag === "hr") {
        blocks.push('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="D1D5DB"/></w:pBdr></w:pPr></w:p>');
        return;
      }

      const meaningfulChildren = Array.from(node.children).filter((child) =>
        ["H1","H2","H3","H4","H5","H6","P","PRE","BLOCKQUOTE","TABLE","UL","OL","HR","DIV","SECTION"].includes(child.tagName)
      );
      if (meaningfulChildren.length) {
        meaningfulChildren.forEach((child) => emit(child, listPrefix));
      } else {
        const text = normalizeText(node.textContent);
        if (text) blocks.push(paragraphXml(node));
      }
    };

    top.forEach((node) => emit(node));
    if (!blocks.length && normalizeText(root.textContent)) {
      blocks.push(paragraphXml(root));
    }
    return blocks.join("");
  }

  function utf8Bytes(text) {
    return new TextEncoder().encode(text);
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function u16(value) {
    return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
  }

  function u32(value) {
    return new Uint8Array([
      value & 0xff,
      (value >>> 8) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 24) & 0xff
    ]);
  }

  function concatBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      out.set(part, offset);
      offset += part.length;
    }
    return out;
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { dosTime, dosDate };
  }

  function zipStore(entries) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const { dosTime, dosDate } = dosDateTime();

    for (const entry of entries) {
      const name = utf8Bytes(entry.name);
      const data = entry.data instanceof Uint8Array ? entry.data : utf8Bytes(entry.data);
      const crc = crc32(data);

      const local = concatBytes([
        u32(0x04034b50),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        name,
        data
      ]);
      localParts.push(local);

      const central = concatBytes([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        name
      ]);
      centralParts.push(central);
      offset += local.length;
    }

    const central = concatBytes(centralParts);
    const end = concatBytes([
      u32(0x06054b50),
      u16(0),
      u16(0),
      u16(entries.length),
      u16(entries.length),
      u32(central.length),
      u32(offset),
      u16(0)
    ]);

    return concatBytes([...localParts, central, end]);
  }

  function buildDocxBlob(message) {
    const clean = cleanClone(message);
    const title = titleFromMessage(clean);
    const body = blockXml(clean);
    const created = new Date().toISOString();

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/></w:rPr>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/>
    <w:rPr><w:b/><w:sz w:val="34"/></w:rPr><w:pPr><w:spacing w:before="260" w:after="140"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/>
    <w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:pPr><w:spacing w:before="220" w:after="120"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/><w:basedOn w:val="Normal"/>
    <w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:pPr><w:spacing w:before="180" w:after="100"/></w:pPr>
  </w:style>
</w:styles>`;

    const entries = [
      {
        name: "[Content_Types].xml",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
      },
      {
        name: "_rels/.rels",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
      },
      {
        name: "word/document.xml",
        data: documentXml
      },
      {
        name: "word/styles.xml",
        data: stylesXml
      },
      {
        name: "word/_rels/document.xml.rels",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
      },
      {
        name: "docProps/core.xml",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Craft Export for ChatGPT</dc:creator>
  <cp:lastModifiedBy>Craft Export for ChatGPT</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${created}</dcterms:modified>
</cp:coreProperties>`
      },
      {
        name: "docProps/app.xml",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Craft Export for ChatGPT</Application>
</Properties>`
      }
    ];

    const bytes = zipStore(entries);
    return {
      blob: new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
      title
    };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function printFallback(title, html) {
    const iframe = document.createElement("iframe");
    iframe.className = "craft-export-print-frame";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";

    iframe.addEventListener("load", () => {
      try {
        const win = iframe.contentWindow;
        if (!win) throw new Error("Print frame unavailable");
        win.document.title = title;
        setTimeout(() => {
          win.focus();
          win.print();
          setTimeout(() => iframe.remove(), 1500);
        }, 150);
      } catch (error) {
        iframe.remove();
        console.error("[Craft Export] PDF fallback print failed", error);
        alert("PDF export failed. Please try again.");
      }
    }, { once: true });

    document.body.appendChild(iframe);
    iframe.srcdoc = html;
  }

  function sendPdfToNativeBridge(title, html) {
    const payload = { type: "craft-export-pdf", title, html };

    if (typeof browser !== "undefined" && browser.runtime?.sendMessage) {
      return browser.runtime.sendMessage(payload);
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(payload, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(response);
      });
    });
  }

  function openPdfPrintView(message) {
    const clean = cleanClone(message);
    clean.querySelectorAll("img").forEach((img) => {
      img.removeAttribute("srcset");
      img.removeAttribute("loading");
    });
    const title = titleFromMessage(message);

    const style = `
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #fff;
        color: #111827;
        font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main { max-width: 820px; margin: 0 auto; padding: 48px 56px 72px; }
      h1,h2,h3,h4 { line-height: 1.2; margin: 1.35em 0 .55em; }
      p,ul,ol,pre,blockquote,table { margin: 0 0 1em; }
      pre { padding: 14px 16px; overflow-wrap: anywhere; white-space: pre-wrap; background: #f3f4f6; border-radius: 10px; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: #f3f4f6; padding: .08em .28em; border-radius: 4px; }
      pre code { padding: 0; }
      blockquote { margin-left: 0; padding-left: 16px; border-left: 3px solid #d1d5db; color: #4b5563; }
      table { width: 100%; border-collapse: collapse; }
      th,td { border: 1px solid #d1d5db; padding: 8px 10px; vertical-align: top; }
      img { max-width: 100%; height: auto; }
      a { color: inherit; text-decoration: underline; }
      .craft-print-meta { margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      @page { size: A4; margin: 18mm; }
      @media print {
        main { max-width: none; padding: 0; }
        .craft-print-meta { color: #555; }
      }
    `;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeXml(title)}</title><style>${style}</style></head><body><main><div class="craft-print-meta">Exported from ChatGPT with Craft Export for ChatGPT</div>${clean.innerHTML}</main></body></html>`;

    sendPdfToNativeBridge(title, html)
      .then((response) => {
        if (response?.ok && response?.openedInPdfCraft) return;
        console.warn("[Craft Export] PdfCraft bridge unavailable", response);
        printFallback(title, html);
      })
      .catch((error) => {
        console.warn("[Craft Export] PdfCraft bridge failed; using browser print", error);
        printFallback(title, html);
      });
  }

  function icon(kind) {
    const src = kind === "word"
      ? browserApi.runtime.getURL("assets/apps/wordcraft-32.png")
      : browserApi.runtime.getURL("assets/apps/pdfcraft-32.png");
    const alt = kind === "word" ? "WordCraft" : "PdfCraft";
    return `<img class="craft-export-app-icon" src="${src}" alt="${alt}" width="20" height="20">`;
  }

  function makeButton(kind, label, tooltip, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.setAttribute("aria-label", label);
    button.setAttribute("data-craft-kind", kind);
    button.removeAttribute("title");
    button.setAttribute("data-craft-tooltip", tooltip);
    button.innerHTML = `${icon(kind)}<span class="craft-export-label">${escapeXml(label)}</span>`;
    actionHandlers.set(button, onClick);
    return button;
  }

  function runCraftAction(button, event) {
    const handler = actionHandlers.get(button);
    if (!handler) return;

    const now = Date.now();
    const lastRun = Number(button.dataset.craftLastRun || 0);
    if (now - lastRun < 1200) return;
    button.dataset.craftLastRun = String(now);

    event?.preventDefault();
    event?.stopImmediatePropagation();
    button.classList.add("craft-export-button--active");
    setTimeout(() => button.classList.remove("craft-export-button--active"), 350);

    try {
      handler();
    } catch (error) {
      console.error("[Craft Export] action failed", error);
    }
  }

  function craftButtonFromEvent(event) {
    const node = event.target instanceof Element ? event.target.closest(`.${BUTTON_CLASS}`) : null;
    return node instanceof HTMLButtonElement ? node : null;
  }

  // Run on pointerdown, before ChatGPT/React can replace the toolbar node between
  // pointerdown and click. A click fallback keeps keyboard activation accessible.
  window.addEventListener("pointerdown", (event) => {
    const button = craftButtonFromEvent(event);
    if (!button) return;
    runCraftAction(button, event);
  }, true);

  window.addEventListener("click", (event) => {
    const button = craftButtonFromEvent(event);
    if (!button) return;
    runCraftAction(button, event);
  }, true);

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const button = craftButtonFromEvent(event);
    if (!button) return;
    runCraftAction(button, event);
  }, true);

  function ensureHoverTooltip() {
    if (hoverTooltip?.isConnected) return hoverTooltip;
    hoverTooltip = document.createElement("div");
    hoverTooltip.className = "craft-export-hover-tooltip";
    hoverTooltip.setAttribute("role", "tooltip");
    document.body.appendChild(hoverTooltip);
    return hoverTooltip;
  }

  function showCraftHover(button) {
    const tooltip = ensureHoverTooltip();
    const text = button.getAttribute("data-craft-tooltip") || button.getAttribute("aria-label") || "";
    tooltip.textContent = text;
    button.classList.add("craft-export-button--hover");

    const rect = button.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.bottom + 10}px`;
    tooltip.classList.add("craft-export-hover-tooltip--visible");

    requestAnimationFrame(() => {
      const tr = tooltip.getBoundingClientRect();
      const pad = 10;
      let x = rect.left + rect.width / 2;
      if (tr.left < pad) x += pad - tr.left;
      if (tr.right > window.innerWidth - pad) x -= tr.right - (window.innerWidth - pad);
      tooltip.style.left = `${x}px`;
    });
  }

  function hideCraftHover(button) {
    button?.classList.remove("craft-export-button--hover");
    hoverTooltip?.classList.remove("craft-export-hover-tooltip--visible");
  }

  window.addEventListener("pointerover", (event) => {
    const button = craftButtonFromEvent(event);
    if (!button) return;
    showCraftHover(button);
  }, true);

  window.addEventListener("pointerout", (event) => {
    const button = craftButtonFromEvent(event);
    if (!button) return;
    const next = event.relatedTarget;
    if (next instanceof Node && button.contains(next)) return;
    hideCraftHover(button);
  }, true);

  window.addEventListener("focusin", (event) => {
    const button = craftButtonFromEvent(event);
    if (button) showCraftHover(button);
  }, true);

  window.addEventListener("focusout", (event) => {
    const button = craftButtonFromEvent(event);
    if (button) hideCraftHover(button);
  }, true);

  function scoreActionBarCandidate(element) {
    const buttons = element.querySelectorAll(":scope > button, :scope > div > button");
    const text = (element.getAttribute("class") || "").toLowerCase();
    let score = Math.min(buttons.length, 8);
    if (text.includes("flex")) score += 1;
    if (text.includes("gap")) score += 1;
    return score;
  }

  function findAdobePdfAction(message) {
    const article = message.closest("[data-talvt-turn-state]") || message.closest("article") || message.parentElement?.parentElement || message.parentElement;
    if (!article) return null;

    const adobeLabels = [
      "Převést do PDF",
      "Převést chat na PDF",
      "Convert to PDF",
      "Convert chat to PDF"
    ];

    const candidates = Array.from(article.querySelectorAll("button,[role='button'],a"));
    return candidates.find((el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      const aria = (el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      const title = (el.getAttribute("title") || "").replace(/\s+/g, " ").trim();
      return adobeLabels.some((label) => text === label || aria === label || title === label);
    }) || null;
  }

  function findNativeActionRow(message) {
    const article = message.closest("[data-talvt-turn-state]") || message.closest("article") || message.parentElement?.parentElement || message.parentElement;
    if (!article) return null;

    const buttons = Array.from(article.querySelectorAll("button,[role='button']"));
    const knownActionLabels = ["Copy", "Kopírovat", "Read aloud", "Přečíst nahlas", "Regenerate", "Znovu vygenerovat", "More", "Více"];

    for (const button of buttons) {
      const label = [button.getAttribute("aria-label"), button.getAttribute("title"), button.textContent]
        .filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      if (!knownActionLabels.some((needle) => label.includes(needle))) continue;

      let node = button.parentElement;
      for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
        const count = node.querySelectorAll("button,[role='button']").length;
        if (count >= 3 && node.getBoundingClientRect().height < 72) return node;
      }
    }
    return null;
  }

  function injectForMessage(message) {
    if (!(message instanceof Element)) return;

    const article = message.closest("[data-talvt-turn-state]") || message.closest("article") || message.parentElement?.parentElement || message.parentElement;
    if (!article) return;

    const existing = article.querySelector(`.${ACTION_CLASS}[data-craft-export-for="assistant"]`);
    if (existing) {
      const adobe = findAdobePdfAction(message);
      const adobeGroup = adobe?.parentElement;
      if (adobeGroup && adobeGroup.nextElementSibling !== existing) {
        adobeGroup.insertAdjacentElement("afterend", existing);
      }
      message.setAttribute(INJECTED_ATTR, "true");
      return;
    }

    const actions = document.createElement("span");
    actions.className = ACTION_CLASS;
    actions.setAttribute("data-craft-export-for", "assistant");
    actions.setAttribute("role", "group");
    actions.setAttribute("aria-label", "Craft export actions");

    const divider = document.createElement("span");
    divider.className = "craft-export-divider";
    divider.setAttribute("aria-hidden", "true");
    actions.appendChild(divider);

    actions.append(
      makeButton("word", labels.word, labels.wordTooltip, () => {
        try {
          const { blob, title } = buildDocxBlob(message);
          downloadBlob(blob, `${title}.docx`);
        } catch (error) {
          console.error("[Craft Export] DOCX export failed", error);
          alert("DOCX export failed. Please refresh ChatGPT and try again.");
        }
      }),
      makeButton("pdf", labels.pdf, labels.pdfTooltip, () => {
        try {
          openPdfPrintView(message);
        } catch (error) {
          console.error("[Craft Export] PDF print view failed", error);
          alert("PDF export failed. Please refresh ChatGPT and try again.");
        }
      })
    );

    // Preferred anchor: place our controls immediately beside the Adobe PDF control.
    const adobe = findAdobePdfAction(message);
    if (adobe?.parentElement) {
      adobe.parentElement.insertAdjacentElement("afterend", actions);
      message.setAttribute(INJECTED_ATTR, "true");
      return;
    }

    // Fallback: keep the controls inside the native ChatGPT response-action row.
    const nativeRow = findNativeActionRow(message);
    if (nativeRow) {
      nativeRow.appendChild(actions);
      message.setAttribute(INJECTED_ATTR, "true");
      return;
    }

    // Last resort: keep controls visible directly below the response.
    message.insertAdjacentElement("afterend", actions);
    message.setAttribute(INJECTED_ATTR, "true");
  }

  function scan() {
    document.querySelectorAll(ASSISTANT_SELECTOR).forEach(injectForMessage);
  }

  let scheduled = false;
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan, { once: true });
  } else {
    scan();
  }
})();
