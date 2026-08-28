import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LegalTopic {
  keywords: string[];
  info: string;
  advice: string[];
}

const LEGAL_KNOWLEDGE: Record<string, LegalTopic> = {
  property: {
    keywords: ["property", "buy", "sell", "land", "house", "real estate", "rental", "lease", "tenant", "landlord", "ownership", "title", "deed"],
    info: "Property law governs the ownership, transfer, and use of real estate. Key documents include sale deeds, title documents, encumbrance certificates, and property tax receipts. Always verify the title chain and check for any encumbrances before purchasing.",
    advice: [
      "Always verify the property title chain and check for existing loans or liens.",
      "Ensure the sale deed is registered and stamp duty is paid.",
      "Check the encumbrance certificate for at least the past 15 years.",
      "Verify approved building plans and occupancy certificate for constructed properties.",
    ],
  },
  marriage: {
    keywords: ["marriage", "divorce", "child custody", "alimony", "maintenance", "spouse", "wedding", "separation"],
    info: "Family law covers marriage registration, divorce, child custody, and maintenance. Marriage registration provides legal recognition and is important for visa, insurance, and property rights. Divorce can be mutual or contested, with different procedures for each.",
    advice: [
      "Register your marriage to obtain legal proof of the relationship.",
      "Understand the difference between mutual consent and contested divorce.",
      "Child custody decisions are based on the best interests of the child.",
      "Maintenance amounts depend on the spouse's income and the standard of living.",
    ],
  },
  traffic: {
    keywords: ["traffic", "fine", "challan", "driving", "license", "vehicle", "accident", "speeding", "pollution"],
    info: "Traffic laws regulate vehicle operation, licensing, and road safety. Common violations include speeding, not wearing a helmet or seatbelt, drunk driving, and using a phone while driving. Fines and penalties vary by offense, and serious violations can lead to license suspension.",
    advice: [
      "Always carry your driving license, registration certificate, and insurance.",
      "Pay traffic fines through official channels and keep the receipt.",
      "Drunk driving is a serious offense that can lead to imprisonment.",
      "In case of an accident, file an FIR and inform your insurance company promptly.",
    ],
  },
  rights: {
    keywords: ["rights", "human rights", "fundamental rights", "constitution", "freedom", "equality", "discrimination"],
    info: "Fundamental rights are guaranteed by the Constitution and include the right to equality, freedom of speech, protection of life and liberty, freedom of religion, and constitutional remedies. Human rights are broader and include rights to education, health, and a clean environment.",
    advice: [
      "Know your fundamental rights as a citizen — they are enforceable in court.",
      "If your rights are violated, you can approach the High Court or Supreme Court.",
      "Right to information allows you to request information from public authorities.",
      "Discrimination based on religion, race, caste, or sex is prohibited.",
    ],
  },
  court: {
    keywords: ["court", "case", "hearing", "judge", "lawsuit", "litigation", "summons", "warrant", "bail", "fir", "police"],
    info: "Court proceedings involve filing a case, presenting evidence, and receiving a judgment. The hierarchy includes district courts, high courts, and the Supreme Court. Different types of cases follow different procedures — civil, criminal, and family courts have distinct processes.",
    advice: [
      "Understand the difference between civil and criminal cases before proceeding.",
      "Keep all court documents, notices, and hearing dates organized.",
      "An advocate can represent you, or you can appear as 'party in person'.",
      "File an FIR at the nearest police station for criminal complaints.",
    ],
  },
  contract: {
    keywords: ["contract", "agreement", "terms", "clause", "breach", "party", "obligation", "signing"],
    info: "Contract law governs agreements between parties. A valid contract requires an offer, acceptance, consideration, and mutual consent. Breach of contract can result in damages or specific performance. Always read and understand all clauses before signing.",
    advice: [
      "Read every clause carefully before signing any contract.",
      "Ensure all terms are in writing — verbal agreements are harder to enforce.",
      "Check for termination clauses, penalty clauses, and dispute resolution mechanisms.",
      "Keep a signed copy of the contract for your records.",
    ],
  },
  consumer: {
    keywords: ["consumer", "refund", "warranty", "defective", "product", "service", "complaint", "shop"],
    info: "Consumer protection law allows you to seek redress for defective products or deficient services. You can file a complaint with consumer forums at district, state, and national levels depending on the claim amount.",
    advice: [
      "Keep bills, receipts, and warranty cards as proof of purchase.",
      "First approach the seller or service provider with a written complaint.",
      "If unresolved, file a complaint with the appropriate consumer forum.",
      "Consumer complaints can often be filed without a lawyer.",
    ],
  },
};

const DISCLAIMER =
  "\n\n---\n*This is general legal information, not professional legal advice. For your specific situation, please consult a qualified lawyer.*";

function findRelevantTopic(question: string): LegalTopic | null {
  const lower = question.toLowerCase();
  let best: { topic: LegalTopic; score: number } | null = null;
  for (const topic of Object.values(LEGAL_KNOWLEDGE)) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic, score };
    }
  }
  return best?.topic ?? null;
}

function generateResponse(
  question: string,
  documentContext?: string | null
): string {
  const topic = findRelevantTopic(question);
  let response = "";

  if (documentContext && documentContext.trim().length > 0) {
    response =
      "Based on your uploaded document, here is what I can tell you:\n\n";
    const excerpt = documentContext.slice(0, 500);
    response += `"${excerpt}${documentContext.length > 500 ? "..." : ""}"\n\n`;
    if (topic) {
      response += `**Regarding your question about ${topic.keywords[0]}:**\n${topic.info}\n\n`;
      response += "**Key points to consider:**\n";
      for (const a of topic.advice) {
        response += `- ${a}\n`;
      }
    } else {
      response +=
        "I've referenced the relevant portion of your document above. Please review it carefully. ";
      response +=
        "If you have a specific question about a clause or term, please ask and I'll explain it in simple language.";
    }
    response += DISCLAIMER;
    return response;
  }

  if (topic) {
    response = `${topic.info}\n\n**Here are some important things to know:**\n`;
    for (const a of topic.advice) {
      response += `- ${a}\n`;
    }
    response += DISCLAIMER;
    return response;
  }

  // Generic response for unmatched questions
  response =
    "I can help you understand legal documents and provide general legal information. Here are some areas I can assist with:\n\n";
  response += "- **Property law** — buying, selling, renting, and property documents\n";
  response += "- **Family law** — marriage, divorce, child custody, and maintenance\n";
  response += "- **Traffic laws** — violations, fines, and procedures\n";
  response += "- **Fundamental rights** — your constitutional rights and protections\n";
  response += "- **Court proceedings** — how to file cases, what to expect in court\n";
  response += "- **Contracts** — understanding agreements, clauses, and your obligations\n";
  response += "- **Consumer protection** — refunds, warranties, and filing complaints\n\n";
  response +=
    "You can also upload a legal document and I'll analyze it clause by clause, explaining everything in simple language.";
  response += DISCLAIMER;
  return response;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { message, chatId, documentId, language = "en" } = body;

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let activeChatId = chatId;
    if (!activeChatId) {
      const title =
        message.slice(0, 40) + (message.length > 40 ? "..." : "");
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: userData.user.id,
          title,
          document_id: documentId || null,
        })
        .select()
        .single();
      if (chatError) throw new Error(chatError.message);
      activeChatId = newChat.id;
    }

    // Save user message
    await supabase.from("messages").insert({
      chat_id: activeChatId,
      role: "user",
      content: message,
    });

    // Fetch document context if linked
    let documentContext: string | null = null;
    if (documentId) {
      const { data: doc } = await supabase
        .from("documents")
        .select("extracted_text")
        .eq("id", documentId)
        .maybeSingle();
      if (doc?.extracted_text) {
        documentContext = doc.extracted_text;
      }
    }

    // Generate response
    const responseText = generateResponse(message, documentContext);

    // Save assistant message
    await supabase.from("messages").insert({
      chat_id: activeChatId,
      role: "assistant",
      content: responseText,
    });

    return new Response(
      JSON.stringify({
        chatId: activeChatId,
        response: responseText,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Chat failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
