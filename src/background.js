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
  if (!message || message.type !== "craft-export-pdf") return undefined;

  sendToNative({
    action: "pdfcraft.open",
    title: message.title,
    html: message.html
  })
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));

  return true;
});
