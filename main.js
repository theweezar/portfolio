"use strict";

import Handlebars from "handlebars";
import data from "./data.json" with { type: "json" };
import { Paginator } from "./page";

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
  if (!templateEl || !data) {
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

const init = () => {
  const page = document.getElementById("page") || document.getElementById("root");

  sectionOrder.forEach((section) => {
    renderSection(section, data[section], page);
  });

  setTimeout(() => {
    Paginator.run({}, ".page");
  }, 1);
};

document.addEventListener("DOMContentLoaded", init);
