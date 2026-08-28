import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FilePayload {
  name: string;
  mimeType: string;
  data: string;
}

// ─── Type definitions (edge functions can't import from src/) ───
interface CaseInformation { caseName: string; court: string; caseNumber: string; date: string; parties: string; judgeBench: string; documentType: string; }
interface RiskAssessment { level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; reason: string; factors: string[]; }
interface EvidenceItem { claim: string; page: string; excerpt: string; }
interface KeyDate { label: string; date: string; }
interface ImportantProvision { name: string; meaning: string; }
interface LegalIssue { issue: string; explanation: string; }
interface DocumentAnalysis {
  documentSummary: string;
  caseInformation: CaseInformation;
  riskAssessment: RiskAssessment;
  simpleMeaning: string;
  legalIssues: LegalIssue[];
  courtDecision: string;
  importantProvisions: ImportantProvision[];
  evidence: EvidenceItem[];
  keyDates: KeyDate[];
  actionItems: string[];
}

// ─── Constants ───
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB

const RESPONSE_SCHEMA = `{
  "documentSummary": "short summary of what the document is about",
  "caseInformation": {
    "caseName": "case name or title",
    "court": "court name",
    "caseNumber": "case number",
    "date": "date of judgment or order",
    "parties": "parties involved",
    "judgeBench": "judge or bench",
    "documentType": "type of document"
  },
  "riskAssessment": {
    "level": "LOW | MEDIUM | HIGH | CRITICAL",
    "reason": "why this risk level was assigned",
    "factors": ["important clauses, orders, or issues causing the risk"]
  },
  "simpleMeaning": "explain the document in simple language that an ordinary person can understand, avoiding legal jargon",
  "legalIssues": [
    {
      "issue": "major legal issue or question",
      "explanation": "short explanation of the issue"
    }
  ],
  "courtDecision": "what the court decided, who succeeded, what relief was granted or denied, important directions, deadlines or obligations",
  "importantProvisions": [
    {
      "name": "article, section, act, rule, clause, order, or legal provision",
      "meaning": "its meaning in simple language"
    }
  ],
  "evidence": [
    {
      "claim": "AI conclusion",
      "page": "page number if available, or 'Source location could not be determined.'",
      "excerpt": "short relevant excerpt from the uploaded document"
    }
  ],
  "keyDates": [
    {
      "label": "filing date, hearing date, judgment date, etc.",
      "date": "the date as found in the document"
    }
  ],
  "actionItems": ["specific obligations, deadlines, payments, appearances, filings, or other actions"]
}`;

const SYSTEM_PROMPT = `You are JurisGuide, a careful legal-document analysis assistant. You analyze legal and court documents uploaded by users and explain them in simple language.

CRITICAL RULES:
1. Analyze ONLY the content actually visible in the uploaded document.
2. Do NOT invent, fabricate, or hallucinate any names, dates, case numbers, clauses, amounts, quotations, page numbers, or legal facts.
3. If information is not present in the document, use the exact text "Not found in document" for that field.
4. For every important conclusion, provide traceable evidence from the document (claim + source + excerpt).
5. If a source location (page number) cannot be determined, say "Source location could not be determined."
6. The risk level is an AI-generated assessment, NOT an official court/legal determination. It must be labeled as "AI-generated document risk assessment — not legal advice."
7. Write the complete result in the user's preferred language.
8. The user is an ordinary person with no legal background. Explain everything in simple, everyday language.
9. Return ONLY valid JSON. No markdown, no code fences, no extra text.`;

// ─── JSON parsing & validation ───

function safeJsonParse(text: string): unknown {
  let cleaned = text.trim();
  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  // Find the outermost JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("AI response did not contain valid JSON.");
  }
  const jsonStr = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Attempt basic repair: trailing commas
    try {
      const repaired = jsonStr.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(repaired);
    } catch {
      throw new Error("AI response contained malformed JSON that could not be repaired.");
    }
  }
}

function validateAnalysis(raw: unknown): DocumentAnalysis {
  if (!raw || typeof raw !== "object") throw new Error("AI response was not a valid object.");
  const obj = raw as Record<string, unknown>;

  const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
  const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
  const orNotFound = (v: unknown): string => {
    const s = str(v);
    return s || "Not found in document";
  };

  const caseInfo = (obj.caseInformation ?? {}) as Record<string, unknown>;
  const risk = (obj.riskAssessment ?? {}) as Record<string, unknown>;

  const validLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
  const rawLevel = str(risk.level, "LOW").toUpperCase();
  const level = validLevels.includes(rawLevel as (typeof validLevels)[number])
    ? (rawLevel as (typeof validLevels)[number])
    : "LOW";

  const legalIssuesRaw = Array.isArray(obj.legalIssues) ? obj.legalIssues : [];
  const legalIssues: LegalIssue[] = legalIssuesRaw.map((item) => {
    const i = item as Record<string, unknown>;
    return { issue: str(i.issue), explanation: str(i.explanation) };
  });

  const provisionsRaw = Array.isArray(obj.importantProvisions) ? obj.importantProvisions : [];
  const importantProvisions: ImportantProvision[] = provisionsRaw.map((item) => {
    const i = item as Record<string, unknown>;
    return { name: str(i.name), meaning: str(i.meaning) };
  });

  const evidenceRaw = Array.isArray(obj.evidence) ? obj.evidence : [];
  const evidence: EvidenceItem[] = evidenceRaw.map((item) => {
    const i = item as Record<string, unknown>;
    return {
      claim: str(i.claim),
      page: str(i.page, "Source location could not be determined."),
      excerpt: str(i.excerpt),
    };
  });

  const datesRaw = Array.isArray(obj.keyDates) ? obj.keyDates : [];
  const keyDates: KeyDate[] = datesRaw.map((item) => {
    const i = item as Record<string, unknown>;
    return { label: str(i.label), date: str(i.date) };
  });

  return {
    documentSummary: str(obj.documentSummary),
    caseInformation: {
      caseName: orNotFound(caseInfo.caseName),
      court: orNotFound(caseInfo.court),
      caseNumber: orNotFound(caseInfo.caseNumber),
      date: orNotFound(caseInfo.date),
      parties: orNotFound(caseInfo.parties),
      judgeBench: orNotFound(caseInfo.judgeBench),
      documentType: orNotFound(caseInfo.documentType),
    },
    riskAssessment: {
      level,
      reason: str(risk.reason),
      factors: strArr(risk.factors),
    },
    simpleMeaning: str(obj.simpleMeaning),
    legalIssues,
    courtDecision: str(obj.courtDecision, "Not found in document"),
    importantProvisions,
    evidence,
    keyDates,
    actionItems: strArr(obj.actionItems),
  };
}

// ─── Provider error class ───

class ProviderError extends Error {
  provider: string;
  status: number;
  providerMessage: string;
  retriable: boolean;

  constructor(provider: string, status: number, providerMessage: string, retriable: boolean) {
    super(providerMessage);
    this.provider = provider;
    this.status = status;
    this.providerMessage = providerMessage;
    this.retriable = retriable;
  }
}

// ─── Gemini ───

async function callGemini(file: FilePayload, language: string): Promise<DocumentAnalysis> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new ProviderError("gemini", 0, "Gemini API key is not configured in the Supabase Edge Function.", false);

  const langNames: Record<string, string> = {
    en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu", mr: "Marathi",
  };
  const targetLang = langNames[language] || "English";

  const userPrompt = `Analyze the uploaded legal document. It may be a PDF, a scanned page, a photograph, or a text document. Use your vision and OCR abilities when needed. Never treat binary file bytes as text — read the actual document content.

Write the complete result in ${targetLang}.

Return ONLY valid JSON matching this exact structure (no markdown, no code fences):
${RESPONSE_SCHEMA}

Remember: if any field's information is not present in the document, use "Not found in document". For evidence, trace claims to specific excerpts. For page numbers you cannot determine, use "Source location could not be determined." The risk assessment must be labeled as AI-generated, not an official court determination.`;

  const requestBody = {
    contents: [{
      parts: [
        { inline_data: { mime_type: file.mimeType, data: file.data } },
        { text: userPrompt },
      ],
    }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
  };

  console.log("[ai-analyze] Gemini request:", {
    model: GEMINI_MODEL,
    endpoint: GEMINI_ENDPOINT,
    mimeType: file.mimeType,
    dataLength: file.data.length,
  });

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  console.log("[ai-analyze] Gemini HTTP status:", response.status);

  if (!response.ok) {
    const details = await response.text();
    console.error("[ai-analyze] Gemini error body:", details.slice(0, 1000));
    let providerMsg = `Gemini API error (HTTP ${response.status})`;
    try {
      const parsed = JSON.parse(details);
      if (parsed.error?.message) providerMsg = parsed.error.message;
    } catch {
      // not JSON
    }
    // 429 = rate limit, 500/503 = server error → retriable
    const retriable = response.status === 429 || response.status >= 500;
    throw new ProviderError("gemini", response.status, providerMsg, retriable);
  }

  const data = await response.json();
  console.log("[ai-analyze] Gemini response keys:", Object.keys(data));

  // Check for blocked content
  if (data.candidates?.[0]?.finishReason === "SAFETY") {
    throw new ProviderError("gemini", 200, "Gemini blocked the document for safety reasons. Please try a different document.", false);
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    console.error("[ai-analyze] Gemini returned no text content. Full response:", JSON.stringify(data).slice(0, 1000));
    throw new ProviderError("gemini", 200, "Gemini returned an empty response with no text content.", true);
  }

  console.log("[ai-analyze] Gemini content length:", content.length);

  const parsed = safeJsonParse(content);
  console.log("[ai-analyze] Gemini JSON parsed successfully");
  return validateAnalysis(parsed);
}

// ─── OpenAI ───

async function callOpenAi(file: FilePayload, language: string): Promise<DocumentAnalysis> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new ProviderError("openai", 0, "OpenAI API key is not configured.", false);

  const langNames: Record<string, string> = {
    en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu", mr: "Marathi",
  };
  const targetLang = langNames[language] || "English";

  const userPrompt = `Analyze the uploaded legal document using OCR or vision if necessary. Write the complete result in ${targetLang}. Return ONLY valid JSON matching this structure:\n${RESPONSE_SCHEMA}\nIf information is not present, use "Not found in document". Label the risk assessment as AI-generated, not legal advice.`;

  const isImage = file.mimeType.startsWith("image/");
  const content = isImage
    ? [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: `data:${file.mimeType};base64,${file.data}` } },
      ]
    : [
        { type: "text", text: userPrompt },
        { type: "file", file: { filename: file.name, file_data: `data:${file.mimeType};base64,${file.data}` } },
      ];

  console.log("[ai-analyze] OpenAI request:", {
    model: OPENAI_MODEL,
    mimeType: file.mimeType,
    dataLength: file.data.length,
    isImage,
  });

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  console.log("[ai-analyze] OpenAI HTTP status:", response.status);

  if (!response.ok) {
    const details = await response.text();
    console.error("[ai-analyze] OpenAI error body:", details.slice(0, 1000));
    let providerMsg = `OpenAI API error (HTTP ${response.status})`;
    try {
      const parsed = JSON.parse(details);
      if (parsed.error?.message) providerMsg = parsed.error.message;
    } catch {
      // not JSON
    }
    const retriable = response.status === 429 || response.status >= 500;
    throw new ProviderError("openai", response.status, providerMsg, retriable);
  }

  const data = await response.json();
  console.log("[ai-analyze] OpenAI response keys:", Object.keys(data));

  const output = data.choices?.[0]?.message?.content;
  if (!output) {
    console.error("[ai-analyze] OpenAI returned no content. Full response:", JSON.stringify(data).slice(0, 1000));
    throw new ProviderError("openai", 200, "OpenAI returned an empty response with no content.", true);
  }

  console.log("[ai-analyze] OpenAI content length:", output.length);

  const parsed = safeJsonParse(output);
  console.log("[ai-analyze] OpenAI JSON parsed successfully");
  return validateAnalysis(parsed);
}

// ─── Main handler ───

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // ─── Diagnostic GET endpoint ───
  if (req.method === "GET") {
    const geminiConfigured = !!Deno.env.get("GEMINI_API_KEY");
    const openaiConfigured = !!Deno.env.get("OPENAI_API_KEY");
    return new Response(JSON.stringify({
      geminiConfigured,
      openaiConfigured,
      geminiModel: GEMINI_MODEL,
      openaiModel: OPENAI_MODEL,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    console.log("[ai-analyze] ═══ Request received ═══");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      console.error("[ai-analyze] Auth failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("[ai-analyze] Authenticated user:", userData.user.id);

    const body = await req.json();
    const file = body.file as FilePayload | undefined;
    const language = typeof body.language === "string" ? body.language : "en";
    const documentId = typeof body.documentId === "string" ? body.documentId : null;

    // ─── File validation ───
    if (!file?.data || !file.mimeType || !file.name) {
      throw new Error("Please upload a document file.");
    }

    const mimeType = file.mimeType.toLowerCase();
    const fileExt = file.name.toLowerCase().split(".").pop() || "";
    const isAllowed = ALLOWED_MIME.has(mimeType) || ["pdf", "txt", "png", "jpg", "jpeg"].includes(fileExt);
    if (!isAllowed) {
      throw new Error("Unsupported file type. Please upload a PDF, TXT, PNG, or JPG file.");
    }

    const approxBytes = Math.floor(file.data.length * 0.75);
    if (approxBytes > MAX_FILE_BYTES) {
      throw new Error("This file is too large. Please upload a file smaller than 15 MB.");
    }
    if (file.data.length < 10) {
      throw new Error("The uploaded file appears to be empty or corrupted. Please try a different file.");
    }

    console.log("[ai-analyze] File validated:", {
      name: file.name,
      mimeType,
      approxBytes,
      documentId,
    });

    // ─── Provider selection ───
    const hasGemini = !!Deno.env.get("GEMINI_API_KEY");
    const hasOpenAi = !!Deno.env.get("OPENAI_API_KEY");

    console.log("[ai-analyze] Provider config:", { hasGemini, hasOpenAi });

    if (!hasGemini && !hasOpenAi) {
      throw new Error("No AI service is configured. Please add GEMINI_API_KEY or OPENAI_API_KEY as a secret in your project settings.");
    }

    let analysis: DocumentAnalysis;
    let usedProvider: string;

    if (hasGemini) {
      console.log("[ai-analyze] Using Gemini as primary provider");
      try {
        analysis = await callGemini(file, language);
        usedProvider = "gemini";
      } catch (err) {
        if (err instanceof ProviderError) {
          console.error(`[ai-analyze] Gemini failed: status=${err.status}, retriable=${err.retriable}, msg=${err.providerMessage}`);
          // Only fall back for retriable errors (rate limit, server error) AND when OpenAI is available
          if (err.retriable && hasOpenAi) {
            console.log("[ai-analyze] Falling back to OpenAI");
            try {
              analysis = await callOpenAi(file, language);
              usedProvider = "openai";
            } catch (fallbackErr) {
              if (fallbackErr instanceof ProviderError) {
                console.error(`[ai-analyze] OpenAI fallback also failed: status=${fallbackErr.status}, msg=${fallbackErr.providerMessage}`);
                throw new Error(`Both AI providers failed. Gemini: ${err.providerMessage}. OpenAI: ${fallbackErr.providerMessage}`);
              }
              throw fallbackErr;
            }
          } else if (!err.retriable && hasOpenAi) {
            // Non-retriable Gemini error but OpenAI available — don't silently fall back, report the real error
            throw new Error(`Gemini API error: ${err.providerMessage}`);
          } else {
            // No OpenAI fallback
            throw new Error(`Gemini analysis failed: ${err.providerMessage}. OpenAI fallback is not configured.`);
          }
        } else {
          throw err;
        }
      }
    } else {
      console.log("[ai-analyze] Using OpenAI as primary provider (Gemini not configured)");
      try {
        analysis = await callOpenAi(file, language);
        usedProvider = "openai";
      } catch (err) {
        if (err instanceof ProviderError) {
          throw new Error(`OpenAI API error: ${err.providerMessage}`);
        }
        throw err;
      }
    }

    console.log("[ai-analyze] Analysis complete via", usedProvider);

    // ─── Save to database ───
    if (documentId) {
      console.log("[ai-analyze] Saving analysis to database, documentId:", documentId);
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          analysis,
          language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .eq("user_id", userData.user.id);
      if (updateError) {
        console.error("[ai-analyze] Database save error:", updateError.message);
      } else {
        console.log("[ai-analyze] Analysis saved to database successfully");
      }
    }

    console.log("[ai-analyze] ═══ Returning success ═══");
    return new Response(JSON.stringify({ analysis, provider: usedProvider }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = (err as Error).message || "Document analysis failed.";
    console.error("[ai-analyze] ═══ ERROR ═══", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
