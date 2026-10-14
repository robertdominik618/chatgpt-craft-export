const HOST = "cz.urgentsolution.craftexport.pdfcraft";
const CHATGPT_URLS = ["https://chatgpt.com/*", "https://chat.openai.com/*"];

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

const api = typeof browser !== "undefined" ? browser : chrome;
const runtimeApi = api.runtime;

runtimeApi.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !["craft-export-pdf", "craft-export-word"].includes(message.type)) return undefined;

  const payload = message.type === "craft-export-word"
    ? { action: "wordcraft.open", title: message.title, base64: message.base64 }
    : { action: "pdfcraft.open", title: message.title, html: message.html };

  const task = sendToNative(payload)
    .then((result) => ({ ok: true, ...result }))
    .catch((error) => ({ ok: false, error: String(error?.message || error) }));

  if (typeof browser !== "undefined") {
    return task;
  }

  task.then(sendResponse);
  return true;
});

async function reinjectIntoOpenChatGPTTabs() {
  if (!api.tabs || !api.scripting) return;

  try {
    const tabs = await api.tabs.query({ url: CHATGPT_URLS });
    await Promise.all(tabs.map(async (tab) => {
      if (!tab.id) return;

      try {
        await api.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["content.css"]
        });
      } catch {
        // CSS may already be present; script injection below is the important part.
      }

      try {
        await api.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
      } catch (error) {
        console.debug("[Craft Export] reinjection skipped for tab", tab.id, error);
      }
    }));
  } catch (error) {
    console.debug("[Craft Export] ChatGPT tab reinjection unavailable", error);
  }
}

// An unpacked-extension Reload invalidates already-running content-script contexts.
// Run immediately whenever the background context starts so open ChatGPT tabs receive
// a fresh content script without requiring the user to hard-refresh the page.
void reinjectIntoOpenChatGPTTabs();

runtimeApi.onInstalled?.addListener(() => {
  void reinjectIntoOpenChatGPTTabs();
});

runtimeApi.onStartup?.addListener(() => {
  void reinjectIntoOpenChatGPTTabs();
});
