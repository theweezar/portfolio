"use strict";

import express from "express";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const templateFilePath = path.join(__dirname, "coverletter", "template.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));
app.use(cors());

async function readTemplates() {
  try {
    const content = await fs.readFile(templateFilePath, "utf8");
    if (!content.trim()) {
      return [];
    }

    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeTemplates(templates) {
  await fs.writeFile(templateFilePath, JSON.stringify(templates, null, 2));
}

app.post("/coverletter/templates", async (req, res) => {
  const { templateID, templateTitle, templateJSON } = req.body ?? {};

  if (!templateTitle || !String(templateTitle).trim()) {
    return res.status(400).json({ error: "templateTitle is required." });
  }

  if (!templateJSON) {
    return res.status(400).json({ error: "templateJSON is required." });
  }

  let parsedTemplateJson;
  try {
    parsedTemplateJson = typeof templateJSON === "string" ? JSON.parse(templateJSON) : templateJSON;
  } catch (error) {
    return res.status(400).json({ error: "templateJSON must be valid JSON." });
  }

  try {
    const templates = await readTemplates();
    const normalizedTitle = String(templateTitle).trim();
    const normalizedId = String(templateID || "").trim();

    let savedTemplate;

    if (normalizedId) {
      const existingIndex = templates.findIndex((item) => item.templateID === normalizedId);
      if (existingIndex === -1) {
        return res.status(404).json({ error: "Template not found." });
      }

      savedTemplate = {
        templateID: normalizedId,
        templateTitle: normalizedTitle,
        templateJSON: parsedTemplateJson
      };
      templates[existingIndex] = savedTemplate;
    } else {
      savedTemplate = {
        templateID: randomUUID(),
        templateTitle: normalizedTitle,
        templateJSON: parsedTemplateJson
      };
      templates.push(savedTemplate);
    }

    await writeTemplates(templates);
    return res.json(savedTemplate);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to save template." });
  }
});

app.listen(port, () => {
  console.log(`Cover letter server running at http://localhost:${port}`);
});
