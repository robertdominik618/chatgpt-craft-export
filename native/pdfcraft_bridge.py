#!/usr/bin/env python3
import html
import json
import os
import pathlib
import re
import shutil
import socket
import struct
import subprocess
import sys
import tempfile
import time
import traceback

HOST_NAME = "cz.urgentsolution.craftexport.pdfcraft"
PDFCRAFT = pathlib.Path("/Applications/PdfCraft.app/Contents/MacOS/PdfCraft")
CHROME_CANDIDATES = [
    pathlib.Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    pathlib.Path("/Applications/Chromium.app/Contents/MacOS/Chromium"),
    pathlib.Path("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
]
LOG_DIR = pathlib.Path.home() / "Library" / "Logs" / "Craft Export for ChatGPT"
LOG_PATH = LOG_DIR / "pdfcraft-bridge.log"

def log(message):
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        with LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(time.strftime("%Y-%m-%d %H:%M:%S ") + message + "\n")
    except Exception:
        pass

def read_message():
    raw = sys.stdin.buffer.read(4)
    if not raw:
        return None
    if len(raw) != 4:
        raise RuntimeError("invalid native-message header")
    length = struct.unpack("<I", raw)[0]
    if length > 32 * 1024 * 1024:
        raise RuntimeError("native message too large")
    data = sys.stdin.buffer.read(length)
    if len(data) != length:
        raise RuntimeError("truncated native message")
    return json.loads(data.decode("utf-8"))

def send_message(payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(data)))
    sys.stdout.buffer.write(data)
    sys.stdout.buffer.flush()

def safe_name(value):
    value = re.sub(r'[\\/:*?"<>|\x00-\x1f]', " ", str(value or "ChatGPT export"))
    value = re.sub(r"\s+", " ", value).strip().strip(".")
    return (value[:120] or "ChatGPT export")

def unique_pdf_path(title):
    downloads = pathlib.Path.home() / "Downloads"
    downloads.mkdir(parents=True, exist_ok=True)
    stem = safe_name(title)
    candidate = downloads / f"{stem}.pdf"
    i = 2
    while candidate.exists():
        candidate = downloads / f"{stem} ({i}).pdf"
        i += 1
    return candidate

def chrome_binary():
    for path in CHROME_CANDIDATES:
        if path.exists():
            return path
    raise RuntimeError("No supported Chromium browser found for local PDF rendering")

def render_pdf(html_text, title):
    out = unique_pdf_path(title)
    with tempfile.TemporaryDirectory(prefix="craft-export-pdf-") as td:
        td_path = pathlib.Path(td)
        source = td_path / "document.html"
        source.write_text(html_text, encoding="utf-8")
        profile = td_path / "chrome-profile"
        cmd = [
            str(chrome_binary()),
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--user-data-dir={profile}",
            f"--print-to-pdf={out}",
            source.as_uri(),
        ]
        run = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=45)
        if run.returncode != 0 or not out.exists() or out.stat().st_size == 0:
            raise RuntimeError(f"PDF rendering failed: {run.stderr[-1000:]}")
    return out

def rpc(file_obj, ident, method, params):
    request = {"jsonrpc": "2.0", "id": ident, "method": method, "params": params}
    file_obj.write((json.dumps(request) + "\n").encode("utf-8"))
    file_obj.flush()
    line = file_obj.readline()
    if not line:
        raise RuntimeError(f"PdfCraft closed control connection during {method}")
    reply = json.loads(line.decode("utf-8"))
    if "error" in reply:
        raise RuntimeError(f"PdfCraft {method}: {reply['error'].get('message', reply['error'])}")
    return reply.get("result", {})

def open_in_pdfcraft(pdf_path):
    if not PDFCRAFT.exists():
        raise RuntimeError("PdfCraft.app is not installed in /Applications")

    with tempfile.TemporaryDirectory(prefix="craft-export-pdfcraft-") as td:
        control = pathlib.Path(td) / "control.json"
        subprocess.Popen(
            [str(PDFCRAFT), "--new-window", "--control", str(control), str(pdf_path)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )

        deadline = time.time() + 12
        while time.time() < deadline and not control.exists():
            time.sleep(0.1)
        if not control.exists():
            raise RuntimeError("PdfCraft did not create its control channel")

        endpoint = json.loads(control.read_text(encoding="utf-8"))
        sock = socket.create_connection(("127.0.0.1", int(endpoint["port"])), timeout=5)
        file_obj = sock.makefile("rwb", buffering=0)
        rpc(file_obj, 1, "auth", {"token": endpoint["token"]})

        opened = False
        for i in range(2, 42):
            state = rpc(file_obj, i, "ui.state", {})
            docs = state.get("documents") or []
            if any(pathlib.Path(d.get("path", "")) == pdf_path for d in docs if d.get("path")):
                opened = True
                break
            time.sleep(0.15)
        if not opened:
            raise RuntimeError("PdfCraft started but the generated PDF did not become active")

        file_obj.close()
        sock.close()

def handle(message):
    if message.get("action") != "pdfcraft.open":
        raise RuntimeError("unsupported action")
    title = safe_name(message.get("title"))
    html_text = message.get("html")
    if not isinstance(html_text, str) or not html_text.strip():
        raise RuntimeError("empty printable document")
    pdf_path = render_pdf(html_text, title)
    open_in_pdfcraft(pdf_path)
    return {"path": str(pdf_path), "openedInPdfCraft": True}

def main():
    while True:
        message = read_message()
        if message is None:
            return
        try:
            result = handle(message)
            send_message({"ok": True, **result})
        except Exception as exc:
            log(traceback.format_exc())
            send_message({"ok": False, "error": str(exc)})

if __name__ == "__main__":
    main()
