import { PartialBusinessIntake } from "../types/contracts";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const DEFAULT_MODEL = "openai/gpt-oss-20b";

export function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY || "";
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  return { apiKey, model };
}

export const ONBOARDING_SYSTEM_PROMPT = `You are the Branvidia AI Business Advisor for Google Business Profile Optimization.
Your tone is professional, warm, concise, and editorial. You represent Branvidia Solutions.

YOUR CORE MISSION:
Act as a guided Business Advisor to discover the customer's business context and collect 5 key pieces of business information to prepare their Google Business Profile optimization audit:
1. Business Name
2. Business Category (e.g., Clothing Store, Specialty Coffee Roaster, Pediatric Dental Clinic, Boutique Digital Agency)
3. Products & Services offered
4. Target Customers (who they serve best)
5. Primary Business Goals (e.g., increase foot traffic, boost high-ticket inquiries, improve review rating, dominate local search)

CONVERSATION GUIDELINES:
- Keep your messages concise and professional (2-4 sentences max per turn).
- Collect details naturally through conversation.
- If the customer introduces multiple details in one message (for example: their brand name, category, and services), extract ALL of them into the INTAKE tag immediately, acknowledge what they shared, and ask follow-up questions ONLY for the remaining missing fields.
- NEVER ask the customer to enter or repeat information they have already provided.
- Once all 5 fields are gathered, summarize their profile warmly and invite them to review their captured business profile card below and proceed to Google integration.
- At the very end of your response, ALWAYS output an intake extraction tag in this exact format:
<!--INTAKE:{"businessName": "...", "category": "...", "productsServices": ["..."], "targetCustomers": "...", "businessGoals": ["..."]}-->
Only include fields that the customer has actually mentioned or confirmed. If a field is unknown, omit it or set it to null.`;

/**
 * Creates a stream from the Groq Chat Completions API.
 * Uses standard fetch with Authorization Bearer header.
 */
export async function createGroqChatStream(
  messages: GroqMessage[],
  currentIntake?: PartialBusinessIntake
): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, model } = getGroqConfig();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  // Inject system prompt if not present
  const fullMessages: GroqMessage[] = [
    { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
  ];

  if (currentIntake && Object.keys(currentIntake).length > 0) {
    fullMessages.push({
      role: "system",
      content: `CURRENT VERIFIED BUSINESS DATA SO FAR: ${JSON.stringify(currentIntake)}. Only inquire about missing fields.`,
    });
  }

  fullMessages.push(...messages);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: fullMessages,
      temperature: 0.3,
      max_tokens: 600,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API returned ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    throw new Error("Groq API response body is empty.");
  }

  return response.body;
}

/**
 * Rule-based fallback conversational advisor used when Groq is unreachable or rate-limited.
 * Ensures the user experience NEVER breaks.
 */
export function generateFallbackChatResponse(
  userMessage: string,
  currentIntake: PartialBusinessIntake = {}
): { reply: string; extracted: PartialBusinessIntake } {
  const lower = userMessage.toLowerCase();
  const updated: PartialBusinessIntake = { ...currentIntake };

  // Rule-based heuristic extraction
  if (!updated.businessName) {
    // Try to extract business name
    const match = userMessage.match(/(?:called|name is|i run|we are|my business is)\s+["']?([^,"'.]+)["']?/i);
    if (match && match[1]) {
      updated.businessName = match[1].trim();
    } else if (userMessage.length < 50 && !lower.includes("cafe") && !lower.includes("help") && !lower.includes("hello")) {
      updated.businessName = userMessage.trim();
    }
  }

  if (!updated.category) {
    if (lower.includes("cloth") || lower.includes("boutique") || lower.includes("fashion") || lower.includes("apparel") || lower.includes("wear")) {
      updated.category = "Clothing Store";
    } else if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("roaster")) {
      updated.category = "Specialty Coffee Roastery & Cafe";
    } else if (lower.includes("dental") || lower.includes("dentist") || lower.includes("clinic")) {
      updated.category = "Dental Clinic";
    } else if (lower.includes("agency") || lower.includes("marketing") || lower.includes("software")) {
      updated.category = "Digital Marketing Agency";
    } else if (lower.includes("restaurant") || lower.includes("bakery") || lower.includes("food")) {
      updated.category = "Restaurant & Food Service";
    }
  }

  if (!updated.productsServices || updated.productsServices.length === 0) {
    if (lower.includes("dress") || lower.includes("jacket") || lower.includes("shirt") || lower.includes("fashion") || lower.includes("cloth") || lower.includes("styling")) {
      updated.productsServices = ["Curated women's designer apparel", "Seasonal outerwear", "Handcrafted fashion accessories", "Personal styling consultations"];
    } else if (lower.includes("espresso") || lower.includes("pastries") || lower.includes("beans") || lower.includes("coffee")) {
      updated.productsServices = ["Single-origin pour-overs", "Artisan pastries", "House-roasted whole bean retail", "Barista training workshops"];
    } else if (lower.includes("teeth") || lower.includes("cleaning") || lower.includes("implants") || lower.includes("invisalign") || lower.includes("dental")) {
      updated.productsServices = ["Comprehensive cleanings", "Invisalign aligners", "Teeth whitening", "Family dental checkups"];
    } else if (lower.includes("seo") || lower.includes("web") || lower.includes("branding")) {
      updated.productsServices = ["Local SEO optimization", "Web development", "Brand strategy"];
    }
  }

  if (!updated.targetCustomers) {
    if (lower.includes("fashion") || lower.includes("wardrobe") || lower.includes("boutique") || lower.includes("cloth")) {
      updated.targetCustomers = "Fashion-conscious shoppers, local residents, and professionals seeking curated wardrobe pieces";
    } else if (lower.includes("local") || lower.includes("commuters") || lower.includes("coffee lovers") || lower.includes("cafe")) {
      updated.targetCustomers = "Specialty coffee lovers, neighborhood regulars, and remote workers looking for a refined cafe atmosphere";
    } else if (lower.includes("families") || lower.includes("patients") || lower.includes("dental")) {
      updated.targetCustomers = "Local families and working professionals seeking gentle, modern aesthetic dentistry";
    } else if (lower.includes("businesses") || lower.includes("b2b") || lower.includes("startups")) {
      updated.targetCustomers = "Growth-stage SMBs and regional service businesses";
    }
  }

  if (!updated.businessGoals || updated.businessGoals.length === 0) {
    if (lower.includes("reviews") || lower.includes("traffic") || lower.includes("google") || lower.includes("grow") || lower.includes("customers") || lower.includes("maps") || lower.includes("discovery")) {
      updated.businessGoals = ["Improve Google Maps local search discoverability", "Boost 5-star customer review volume", "Increase qualified customer visits"];
    }
  }

  // Determine what is still missing
  const missing: string[] = [];
  if (!updated.businessName) missing.push("business name");
  if (!updated.category) missing.push("business category or industry");
  if (!updated.productsServices || updated.productsServices.length === 0) missing.push("main products or services");
  if (!updated.targetCustomers) missing.push("target customers");
  if (!updated.businessGoals || updated.businessGoals.length === 0) missing.push("primary business goals for your Google presence");

  let reply = "";
  if (missing.length === 0) {
    reply = `Excellent. I have captured your business profile: **${updated.businessName}**, operating as **${updated.category}**. You offer ${updated.productsServices?.join(", ")}, serving ${updated.targetCustomers}, aiming to ${updated.businessGoals?.join(" and ")}. Please review your confirmation card below to proceed to Google profile integration.`;
  } else if (missing.length >= 4) {
    reply = `Welcome to Branvidia! I am your AI Business Advisor. To audit and optimize your Google Business Profile effectively, could you share your **business name** and what **industry or category** you operate in?`;
  } else {
    reply = `Thank you. I have updated your profile details. To complete our business picture, could you tell me more about your **${missing[0]}**?`;
  }

  return { reply, extracted: updated };
}
