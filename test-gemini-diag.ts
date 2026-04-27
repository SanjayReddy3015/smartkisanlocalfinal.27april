import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function testFinalModel() {
    try {
        console.log("Testing gemini-2.0-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello, are you active?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error: any) {
        console.error("Test failed:", error.message || error);
    }
}

testFinalModel();
