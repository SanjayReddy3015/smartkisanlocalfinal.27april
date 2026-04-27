import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const chatbotApiKey = process.env.CHATBOT_GEMINI_API_KEY || apiKey;

const genAI = new GoogleGenerativeAI(apiKey);
const chatbotAI = new GoogleGenerativeAI(chatbotApiKey);

// --- 1. SESSION MANAGEMENT ---
// This stores active conversations.
const sessions = new Map<string, ChatSession>();

const LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
  bn: "Bengali",
  ml: "Malayalam",
};

const GLOBAL_SYSTEM_INSTRUCTION = (langName: string) => `Act as SmartKisan, a Senior AI Agricultural Scientist and specialized consultant for Indian farmers. 
Your goal is to provide comprehensive, scientifically-grounded, and highly informative advice.

Guidelines:
1. Always understand the user's intent before answering.
2. Provide in-depth explanations instead of short answers.
3. Break answers into sections (headings, bullet points, steps).
4. If the question is technical, include:
   - Explanation
   - Code (if applicable)
   - Use cases
5. If the question is general:
   - Give simple explanation first
   - Then detailed explanation
6. Avoid vague answers. Be specific and informative.
7. If unsure, say "Based on available knowledge..." and provide the best possible explanation.
8. Maintain a helpful, professional, and friendly tone.
9. Never provide harmful, illegal, or unsafe instructions.
10. STRICT LANGUAGE RULE: Respond ONLY in ${langName}. If the user communicates in another language, translate and reply in ${langName}.

Response Format:
- Start with a short direct answer
- Then give detailed explanation
- Use bullet points or steps
- Add examples if useful`;

/**
 * Main function to run the Chatbot with Memory (Sessions)
 * @param userId - A unique ID for the user (session ID or UUID)
 * @param message - The farmer's question
 * @param language - ISO code (en, hi, etc.)
 */
export async function askFarmingQuestion(message: string, language = "en", userId = "default-user"): Promise<string> {
  const langName = LANGUAGE_MAP[language] || "English";
  const systemInstruction = GLOBAL_SYSTEM_INSTRUCTION(langName);

  try {
    // RETRIEVE OR CREATE SESSION
    let chat = sessions.get(userId);

    if (!chat) {
      console.log(`DEBUG: Starting chat session with model 'gemini-1.5-flash' using key starting with ${chatbotApiKey.substring(0, 5)}...`);
      const model = chatbotAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      } as any);

      chat = model.startChat({
        history: [], // Memory stored here
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });
      sessions.set(userId, chat);
    }

    // EXECUTE CHAT
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text() || "I apologize, I could not process that request.";

  } catch (error: any) {
    console.error("CRITICAL: Gemini API Chat Failure:", {
      message: error.message,
      stack: error.stack,
      status: error.status,
      details: error.details
    });
    return getChatFallback(message, language);
  }
}

/**
 * Cleanly clears a session when a farmer wants to start a new topic 
 */
export function clearUserSession(userId: string) {
  sessions.delete(userId);
}

/**
 * Enhanced Keyword-based fallback system for SmartKisan Chatbot
 */
function getChatFallback(message: string, lang = "en"): string {
  const msg = message.toLowerCase();

  const fallbacks: Record<string, Record<string, string>> = {
    wheat: {
      en: "## Wheat (Rabi Crop) Cultivation\n- **Sowing Period:** November to December is ideal.\n- **Preparation:** Soil should be well-pulverized. Use heavy pre-sowing irrigation.\n- **Key Phase:** The CRI (Crown Root Initiation) stage @ 21 days is critical for irrigation.\n- **Fertilizer:** Standard N:P:K ratio of 120:60:40 kg/ha is generally recommended for high yield.",
      hi: "## गेहूँ (रबी फसल) की खेती\n- **बुवाई का समय:** नवंबर से दिसंबर आदर्श है।\n- **तैयारी:** मिट्टी अच्छी तरह से भुरभुरी होनी चाहिए। भारी बुवाई पूर्व सिंचाई का उपयोग करें।\n- **महत्वपूर्ण चरण:** 21 दिनों पर CRI (क्राउन रूट इनिशिएशन) चरण सिंचाई के लिए महत्वपूर्ण है।",
    },
    rice: {
      en: "## Rice/Paddy (Kharif Staple)\n- **Water Management:** Maintain 2-5 cm of standing water during the vegetative phase.\n- **Fertilizer:** Apply Nitrogen in 3 splits: Basal, Tillering, and Panicle initiation.\n- **Protection:** Watch for Brown Plant Hopper (BPH). Use Neem-based sprays for early organic control.\n- **Harvesting:** Harvest when 80% of grains in the panicle turn golden yellow.",
      hi: "## चावल/धान (खरीफ मुख्य फसल)\n- **जल प्रबंधन:** वानस्पतिक चरण के दौरान 2-5 सेमी खड़े पानी को बनाए रखें।\n- **उर्वरक:** नाइट्रोजन को split खुराक में दें: बेसल, टिलरिंग और पैनिकल दीक्षा।",
    },
    cotton: {
      en: "## Cotton (White Gold) Management\n- **Soil Type:** Best suited for Black Cotton Soil (Regur) which retains moisture.\n- **Pests:** Bt Cotton helps against Bollworm, but watch for Sucking Pests (Aphids, Jassids).\n- **Growth:** Ensure zero waterlogging during the flowering and square formation stages.\n- **Yield Tip:** Judicious use of Growth Regulators like NAA can reduce flower drop.",
      hi: "## कपास प्रबंधन\n- **मिट्टी का प्रकार:** काली कपास मिट्टी (रेगुर) के लिए सबसे उपयुक्त।\n- **कीट:** बीटी कपास बोलवर्म के खिलाफ मदद करता है, लेकिन चूसने वाले कीटों (एफिड्स) पर नज़र रखें।",
    },
    pest: {
      en: "## Integrated Pest Management (IPM)\n1. **Cultural:** Use crop rotation and trap crops (like Marigold with Tomato).\n2. **Biological:** Use Pheromone traps and Trichogramma cards.\n3. **Chemical:** Use only as a last resort. For sucking pests, use Imidacloprid but follow dosage strictly.\n4. **Organic:** Spray 5% Neem Seed Kernel Extract (NSKE).",
      hi: "## एकीकृत कीट प्रबंधन (IPM)\n1. **सांस्कृतिक:** फसल चक्र और ट्रैप फसलों का उपयोग करें।\n2. **जैविक:** फेरोमोन ट्रैप और ट्राइकोग्रामा कार्ड का उपयोग करें।\n3. **जैविक:** 5% नीम बीज गिरी अर्क (NSKE) का छिड़काव करें।",
    },
    msp: {
      en: "## MSP (Minimum Support Price) Guidance\n- **What it is:** A guaranteed price at which the government buys crops from farmers.\n- **Usage:** It protects farmers from market price volatility. \n- **Key Crops:** MSP is announced for 23 mandated crops including Wheat, Paddy, Pulses, and Oilseeds.\n- **Tip:** Always check the latest Kharif/Rabi MSP notification on the Agmarknet portal.",
      hi: "## MSP (न्यूनतम समर्थन मूल्य) मार्गदर्शन\n- **यह क्या है:** एक गारंटीकृत मूल्य जिस पर सरकार किसानों से फसल खरीदती है।\n- **उपयोग:** यह किसानों को बाजार मूल्य की अस्थिरता से बचाता है।",
    },
    loan: {
      en: "## KCC & Farm Credit Systems\n- **KCC:** The Kisan Credit Card offers low-interest loans (3-4% with timely repayment).\n- **Application:** Carry your Land Records (Pahani/7-12 extract) and ID proof to your bank.\n- **Insurance:** KCC is often linked with PM Fasal Bima Yojana for crop security.",
      hi: "## KCC और कृषि ऋण प्रणाली\n- **KCC:** किसान क्रेडिट कार्ड कम ब्याज वाले ऋण (समय पर पुनर्भुगतान के साथ 3-4%) प्रदान करता है।",
    },
    default: {
      en: "I am SmartKisan AI, currently in specialized Consultant Mode. I can provide detailed reports on **Wheat, Rice, Cotton, IPM/Pests, Loans, and government schemes like MSP**.\n\nTo give you the best possible data, please ensure your internet connection is stable so I can access my real-time Gemini knowledge base.",
      hi: "मैं स्मार्टकिसान एआई हूँ, वर्तमान में विशेष सलाहकार मोड में हूँ। मैं **गेहूँ, चावल, कपास, कीट प्रबंधन, ऋण और एमएसपी** जैसी सरकारी योजनाओं पर विस्तृत रिपोर्ट दे सकता हूँ।",
    }
  };

  const l = (lang === "en" || lang === "hi") ? lang : "en";

  if (msg.includes("wheat") || msg.includes("gehu")) return fallbacks.wheat[l];
  if (msg.includes("rice") || msg.includes("dhan") || msg.includes("paddy")) return fallbacks.rice[l];
  if (msg.includes("cotton") || msg.includes("kapas")) return fallbacks.cotton[l];
  if (msg.includes("pest") || msg.includes("insect") || msg.includes("keeda")) return fallbacks.pest[l];
  if (msg.includes("msp") || msg.includes("price") || msg.includes("rate")) return fallbacks.msp[l];
  if (msg.includes("loan") || msg.includes("karz") || msg.includes("credit")) return fallbacks.loan[l];

  return fallbacks.default[l];
}

// --- STRUCTURED DATA TOOLS ---

export async function getIrrigationAdvice(cropType: string, soilType: string, temperature: number): Promise<{ recommendation: string; waterLitersPerAcre: number }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `As SmartKisan AI, provide irrigation advice for ${cropType} in ${soilType} soil at ${temperature}°C. 
    Reply in JSON format: { "recommendation": "...", "waterLitersPerAcre": <number> }`;

    const result = await model.generateContent(prompt);
    // Helper to strip markdown JSON blocks
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid format");
  } catch (err: any) {
    console.error("Gemini API Error for irrigation:", err.message || err);
    // Algorithmic Mock-AI fallback
    const crop = (cropType || "").toLowerCase();
    const soil = (soilType || "").toLowerCase();
    const isDry = soil.includes('sand') || temperature > 30;
    const baseWater = crop.includes('rice') ? 5000 : (crop.includes('wheat') ? 3000 : 2000);
    const adjustment = isDry ? 1.4 : 1.0;

    return {
      recommendation: `Based on your ${soilType} soil and ${temperature}°C temperature, we recommend a ${isDry ? 'frequent' : 'moderate'} irrigation schedule typical for ${cropType} in this climate.`,
      waterLitersPerAcre: Math.round(baseWater * adjustment)
    };
  }
}

export async function getFertilizerAdvice(cropType: string, soilType: string, stage: string): Promise<{ recommendation: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `As SmartKisan AI, recommend fertilizer for ${cropType} in ${soilType} at ${stage} stage.
Be specific to Indian market availability and farmer budget.`;

    const result = await model.generateContent(prompt);
    return { recommendation: result.response.text() || "" };
  } catch (err: any) {
    console.error("Gemini API Error for fertilizer:", err.message || err);
    const crop = (cropType || "").toLowerCase();
    const phase = (stage || "").toLowerCase();

    let advice = `For ${cropType} at ${stage} stage: `;
    if (phase.includes('sow') || phase.includes('basal')) {
      advice += "Apply a Basal dose of NPK (12:32:16) or DAP with Muriate of Potash.";
    } else if (phase.includes('vegetative') || phase.includes('growth')) {
      advice += "Top dress with Urea (Nitrogen) to encourage foliage and height.";
    } else {
      advice += "Ensure sufficient Potassium and Micronutrients for grain filling and quality.";
    }
    return { recommendation: advice };
  }
}

export async function getTransportEstimate(from: string, to: string, cropType: string, weight: number): Promise<{ cost: number; distance: string; tips: string }> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: GLOBAL_SYSTEM_INSTRUCTION("English")
    } as any);
    const prompt = `Estimate transport cost for ${weight} quintals of ${cropType} from ${from} to ${to} in India.
Reply in JSON: { "cost": <number in rupees>, "distance": "<km range>", "tips": "..." }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid json format");
  } catch (err: any) {
    console.error("Gemini API Error for transport:", err.message || err);
    // Algorithmic Mock-AI fallback
    const startStr = (from || "A").toLowerCase();
    const destStr = (to || "B").toLowerCase();
    const distanceVal = (startStr.length + destStr.length) * 15 + (weight * 5);
    const costPerKm = weight > 5 ? 12 : 8;

    return {
      cost: distanceVal * costPerKm,
      distance: `${distanceVal} km (estimated)`,
      tips: "Compare rates between local transporters and apps like Vahak/BlackBuck. Ensure proper tarp cover for monsoon transport."
    };
  }
}

export async function getYieldEstimate(cropType: string, acres: number, expectedPrice: number): Promise<{ estimatedYieldQuintals: number; estimatedProfit: number }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Estimate yield and profit for ${acres} acres of ${cropType} with expected price ${expectedPrice}/quintal in India.
Reply in JSON format exactly: { "estimatedYieldQuintals": <number>, "estimatedProfit": <number> }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid json format");
  } catch (err: any) {
    console.error("Gemini API Error for yield:", err.message || err);
    // Fallback logic
    const estimatedYield = acres * (cropType.toLowerCase().includes('rice') ? 22 : 15);
    const estimatedProfit = estimatedYield * expectedPrice;
    return { estimatedYieldQuintals: estimatedYield, estimatedProfit: estimatedProfit };
  }
}

export async function getCropWeatherAlert(crop: string, weatherData: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: GLOBAL_SYSTEM_INSTRUCTION("English")
    } as any);

    const prompt = `
      As a Senior Agricultural Scientist, provide a scientific, weather-aware advisory for a ${crop} farmer based on this real-time weather data:
      - Current Temperature: ${weatherData.temp}°C
      - Humidity: ${weatherData.humidity}%
      - Rainfall: ${weatherData.rain}mm
      - Wind Speed: ${weatherData.windspeed} km/h
      - Weather Condition: ${weatherData.condition}
      - 7-Day Forecast: ${JSON.stringify(weatherData.forecast || [])}

      Focus on:
      1. Immediate risks (pest/disease outbreaks, heat/cold stress, irrigation needs).
      2. Actionable steps (spraying schedule, soil management, drainage).
      3. Short-term forecast-based planning.
      
      Structure the response with:
      - **Current Risk Level:** (Low/Moderate/High)
      - **Key Observation:** (Scientific explanation of how weather affects ${crop})
      - **Top Recommendations:** (Numbered list of 2-3 precise actions)
      
      Keep it informative and scientifically grounded.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text() || "Monitoring conditions. Ensure proper drainage and watch for pest symptoms.";
  } catch (err: any) {
    console.error("AI Weather Alert Error:", err);
    return `### **Current Advisory for ${crop}**\n\n**Risk Level:** Moderate\n\n**Observation:** Local environmental conditions are changing. \n\n**Recommendations:**\n1. Ensure proper drainage to avoid waterlogging.\n2. Monitor your crops regularly for any signs of pest activity or heat stress. \n3. Maintain optimal soil moisture based on the recent rainfall patterns.`;
  }
}
