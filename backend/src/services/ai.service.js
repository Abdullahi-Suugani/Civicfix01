const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

const REPORT_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    category: { type: "string" },
    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    recommendedAction: { type: "string" },
  },
  required: ["summary", "category", "priority", "recommendedAction"],
};

const SEARCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    search: { type: "string" },
    category: { type: "string" },
    priority: { type: "string", enum: ["", "LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    status: { type: "string", enum: ["", "PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"] },
    locationHint: { type: "string" },
  },
  required: ["search", "category", "priority", "status", "locationHint"],
};

function outputText(response) {
  if (response.output_text) return response.output_text;
  const textParts = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) textParts.push(content.text);
    }
  }
  return textParts.join("\n");
}

async function createStructuredResponse({ input, schema, name }) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error("OPENAI_API_KEY is not configured.");
    err.code = "OPENAI_NOT_CONFIGURED";
    throw err;
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema,
        },
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload.error?.message || "OpenAI request failed.";
    throw new Error(message);
  }

  return JSON.parse(outputText(payload));
}

async function analyzeReport({ title, description, categoryName, priority, address }) {
  return createStructuredResponse({
    name: "civicfix_report_analysis",
    schema: REPORT_ANALYSIS_SCHEMA,
    input: [
      {
        role: "system",
        content:
          "You analyze municipal issue reports for city staff. Be concise, practical, and classify urgency from public safety and service impact.",
      },
      {
        role: "user",
        content: JSON.stringify({ title, description, selectedCategory: categoryName, selectedPriority: priority, address }),
      },
    ],
  });
}

async function improveReportDescription({ title, description }) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error("OPENAI_API_KEY is not configured.");
    err.code = "OPENAI_NOT_CONFIGURED";
    throw err;
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content:
            "Rewrite civic issue report descriptions so they are clear, professional, specific, and ready for city staff. Preserve facts and do not invent details.",
        },
        { role: "user", content: `Title: ${title || "Untitled"}\nDescription: ${description}` },
      ],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload.error?.message || "OpenAI request failed.";
    throw new Error(message);
  }

  return outputText(payload).trim();
}

async function parseReportSearch(query) {
  return createStructuredResponse({
    name: "civicfix_report_search",
    schema: SEARCH_SCHEMA,
    input: [
      {
        role: "system",
        content:
          "Convert natural language searches for civic issue reports into simple database filters. Use empty strings for unknown filters.",
      },
      { role: "user", content: query },
    ],
  });
}

module.exports = {
  analyzeReport,
  improveReportDescription,
  parseReportSearch,
};
