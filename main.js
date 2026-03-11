import Handlebars from "handlebars";

const sectionOrder = [
  "personal",
  "profile",
  "techSkills",
  "experience",
  "achievements",
  "softSkills",
  "education",
  "certifications",
  "projects"
];

const templateIdFor = (section) => `tpl-${section}`;

const renderSection = (section, data, target) => {
  const templateEl = document.getElementById(templateIdFor(section));
  if (!templateEl) {
    return;
  }
  const template = Handlebars.compile(templateEl.innerHTML);
  const html = template(data || {});
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();

  while (wrapper.firstElementChild) {
    target.appendChild(wrapper.firstElementChild);
  }
};

const init = async () => {
  const response = await fetch("./data.json");
  if (!response.ok) {
    throw new Error(`Failed to load data.json: ${response.status}`);
  }
  const data = await response.json();
  const page = document.getElementById("page") || document.getElementById("root");

  sectionOrder.forEach((section) => {
    renderSection(section, data[section], page);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error(error);
  });
});
