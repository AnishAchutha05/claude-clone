import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  const apiKey = "AIzaSyAcWvcMb-EPT5mxMxZXlU5IFl3yWj7hsLA";
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const chat = genModel.startChat({ history: [] });
    const result = await chat.sendMessageStream("Hello, world!");
    for await (const chunk of result.stream) {
      console.log(chunk.text());
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
