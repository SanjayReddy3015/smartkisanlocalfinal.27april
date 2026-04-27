import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "AIzaSyD6xUp_S7laWPD3y2AAteoL6eGyHrQMApg",
});

async function run() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hello",
        });
        console.log("Success:", response.text);
    } catch (error: any) {
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.status) console.error("Status:", error.status);
    }
}
run();
