import Quill from "quill";
import Handlebars from "handlebars";

const quill = new Quill("#editor", {
  theme: "snow"
});
const LOCAL_KEY = "quill_ct";
const TEMPLATE_URL = "./template.json";
let templates = [];
let activeTemplateId = "";

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function getTemplateJsonField() {
  return document.getElementById("templateJSON");
}

function getTemplateIdField() {
  return document.getElementById("templateID");
}

function getTemplateTitleField() {
  return document.getElementById("templateTitle");
}

function updateTemplateJsonField() {
  getTemplateJsonField().value = JSON.stringify(quill.getContents());
}

function loadStoredContent() {
  const quillContent = localStorage.getItem(LOCAL_KEY);
  if (!quillContent) {
    updateTemplateJsonField();
    return;
  }

  try {
    const contentJson = JSON.parse(quillContent);
    quill.setContents(contentJson);
    updateTemplateJsonField();
  } catch (error) {
    console.error(error.message);
    localStorage.removeItem(LOCAL_KEY);
    alert("Failed to load content. Removed current source in storage.");
  }
}

function save() {
  try {
    const quillContent = JSON.stringify(quill.getContents());
    localStorage.setItem(LOCAL_KEY, quillContent);
    updateTemplateJsonField();
    console.log("saved to storage.");
  } catch (error) {
    console.error(error.message);
  }
}

function parseAndInsertHtml() {
  const company = document.getElementById("company");
  const role = document.getElementById("role");
  const content = document.getElementById("content");
  const data = {
    company: company.value || "{{company}}",
    role: role.value || "{{role}}",
  };
  const source = quill.getSemanticHTML().replace(/&nbsp;/g, " ");
  const template = Handlebars.compile(source);
  const result = template(data);
  content.innerHTML = result;
}

function setEditorContents(delta) {
  quill.setContents(delta);
  save();
  parseAndInsertHtml();
}

function normalizeTemplateJson(templateJSON) {
  if (!templateJSON) {
    return null;
  }

  if (typeof templateJSON === "string") {
    return JSON.parse(templateJSON);
  }

  return templateJSON;
}

function renderTemplateList() {
  const templateList = document.getElementById("templateList");
  const templateEmpty = document.getElementById("templateEmpty");

  templateList.innerHTML = "";
  templateEmpty.style.display = templates.length ? "none" : "block";

  const newTemplateItem = document.createElement("li");
  const newTemplateButton = document.createElement("button");
  newTemplateButton.type = "button";
  newTemplateButton.textContent = "New Template";
  newTemplateButton.dataset.action = "new-template";
  newTemplateItem.appendChild(newTemplateButton);
  templateList.appendChild(newTemplateItem);

  templates.forEach((item) => {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.templateTitle || "Untitled template";
    button.dataset.templateId = item.templateID;
    if (item.templateID === activeTemplateId) {
      button.classList.add("is-active");
    }
    listItem.appendChild(button);
    templateList.appendChild(listItem);
  });
}

function applyTemplate(template) {
  const parsedTemplate = normalizeTemplateJson(template.templateJSON);
  if (!parsedTemplate) {
    return;
  }

  activeTemplateId = template.templateID || "";
  getTemplateIdField().value = activeTemplateId;
  getTemplateTitleField().value = template.templateTitle || "";
  setEditorContents(parsedTemplate);
  renderTemplateList();
}

async function loadTemplates(selectedTemplateId = activeTemplateId) {
  try {
    const response = await fetch(TEMPLATE_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load templates: ${response.status}`);
    }

    const data = await response.json();
    templates = Array.isArray(data) ? data : [];
    activeTemplateId = selectedTemplateId || activeTemplateId;
    renderTemplateList();
  } catch (error) {
    templates = [];
    console.error(error.message);
    renderTemplateList();
  }
}

async function handleReplacementSubmit(event) {
  event.preventDefault();

  const templateID = getTemplateIdField().value.trim();
  const templateTitle = getTemplateTitleField().value.trim();
  const templateJSON = JSON.stringify(quill.getContents());

  getTemplateJsonField().value = templateJSON;

  try {
    const response = await fetch("http://localhost:3000/coverletter/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        templateID,
        templateTitle,
        templateJSON
      })
    });

    if (!response.ok) {
      throw new Error("Failed to save template.");
    }

    const savedTemplate = await response.json();
    activeTemplateId = savedTemplate.templateID;
    getTemplateIdField().value = savedTemplate.templateID;
    getTemplateTitleField().value = savedTemplate.templateTitle;
    getTemplateJsonField().value = JSON.stringify(savedTemplate.templateJSON);
    await loadTemplates(savedTemplate.templateID);
    alert("Template saved.");
  } catch (error) {
    console.error(error.message);
    alert("Failed to save template.");
  }
}

function initQuillEvents() {
  const handleQuillTextChange = debounce((delta, oldDelta, source) => {
    if (source === "user") {
      save();
    }
    parseAndInsertHtml();
  });
  quill.on("text-change", handleQuillTextChange);
  document.getElementById("company").addEventListener("input", parseAndInsertHtml);
  document.getElementById("role").addEventListener("input", parseAndInsertHtml);
}

function copyToClipboard() {
  const notification = document.getElementById("notification");
  const content = document.getElementById("content");
  const text = content.innerText;
  navigator.clipboard.writeText(text).then(() => {
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 1500);
  }).catch(err => {
    console.error("Failed to copy:", err);
    alert("Failed to copy to clipboard");
  });
}

function initController() {
  document.getElementById("boxSwitch").addEventListener("change", (event) => {
    const target = event.target;
    const switchTo = (token) => {
      document.querySelectorAll(".switch-item").forEach(el => (el.style.display = "none"));
      document.querySelector(`.switch-item.${token}`).style.display = "block";
      const action = document.getElementById("action");
      action.classList.remove(...String(action.classList.value).split(" "));
      action.classList.add(...["action", token]);
    };
    if (target.checked) {
      switchTo("content");
    } else {
      switchTo("editor");
    }
  });
}

function initSidebarControls() {
  const appShell = document.getElementById("appShell");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const templateSidebar = document.getElementById("templateSidebar");
  const templateList = document.getElementById("templateList");
  const sidebarToggles = document.querySelectorAll(".sidebar-toggle-btn");

  const toggleSidebar = (isOpen) => {
    sidebarToggles.forEach(el => el.setAttribute("aria-expanded", String(isOpen)))
    templateSidebar.setAttribute("aria-hidden", String(!isOpen));
  };

  sidebarToggles.forEach(el => el.addEventListener("click", () => {
    const isOpen = appShell.classList.toggle("sidebar-open");
    toggleSidebar(isOpen);
  }));

  templateList.addEventListener("click", (event) => {
    const newTemplateButton = event.target.closest("button[data-action='new-template']");
    if (newTemplateButton) {
      activeTemplateId = "";
      getTemplateIdField().value = "";
      renderTemplateList();

      if (window.innerWidth <= 900) {
        appShell.classList.remove("sidebar-open");
        toggleSidebar(false);
      }

      return;
    }

    const button = event.target.closest("button[data-template-id]");
    if (!button) {
      return;
    }

    const template = templates.find((item) => item.templateID === button.dataset.templateId);
    if (!template) {
      return;
    }

    applyTemplate(template);

    if (window.innerWidth <= 900) {
      appShell.classList.remove("sidebar-open");
      toggleSidebar(false);
    }
  });
}

(function () {
  initQuillEvents();
  loadStoredContent();
  initController();
  initSidebarControls();
  parseAndInsertHtml();
  updateTemplateJsonField();
  loadTemplates();
  document.getElementById("replacementForm").addEventListener("submit", handleReplacementSubmit);
  document.getElementById("copyBtn").addEventListener("click", copyToClipboard);
})();
