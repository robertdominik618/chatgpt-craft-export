const HOST = "cz.urgentsolution.craftexport.pdfcraft";

function sendToNative(payload) {
  if (typeof browser !== "undefined" && browser.runtime?.sendNativeMessage) {
    return browser.runtime.sendNativeMessage(HOST, payload);
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(HOST, payload, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });
}

const runtimeApi = typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

runtimeApi.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !["craft-export-pdf", "craft-export-word"].includes(message.type)) return undefined;

  const payload = message.type === "craft-export-word"
    ? { action: "wordcraft.open", title: message.title, base64: message.base64 }
    : { action: "pdfcraft.open", title: message.title, html: message.html };

  sendToNative(payload)
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));

  return true;
});
