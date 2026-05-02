import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

export const generateMCQs = async ({ jobRole, company, jd, count, difficulty }) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const context = `Job Role: ${jobRole || "N/A"}\nCompany: ${company || "N/A"}\nJob Description: ${jd || "N/A"}`;
    
    const prompt = `Generate ${count || 5} Multiple Choice Questions (MCQs) for a candidate preparing for an interview or technical assessment.
    The questions should be relevant to the following context:
    ${context}
    
    Difficulty Level: ${difficulty || "Intermediate"}
    
    Return the response as a JSON array of objects, where each object has:
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string (the exact text from one of the options)",
      "explanation": "string explaining why the answer is correct"
    }`;

    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer and educator. You generate high-quality, relevant MCQs based on job roles and descriptions. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(res.choices[0].message.content);
    // Groq might return the array inside an object like { "questions": [...] } or just the array if asked differently.
    // To be safe, I'll check for both.
    return content.questions || content;
  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw error;
  }
};
