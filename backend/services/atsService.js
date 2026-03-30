import Groq from "groq-sdk";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const getATSScore = async (filePath, jd) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const data = await pdfParse(fs.readFileSync(filePath));

    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert HR application evaluator. You calculate a Criteria Match Score (CRI Score) between 0 and 100 based on how well a candidate's resume matches the Job Description. Return *ONLY* a number between 0 and 100. Do not write any other explanation."
        },
        {
          role: "user",
          content: `Calculate the CRI Score (0-100).\nResume:\n${data.text}\n\nJD:\n${jd}`
        }
      ]
    });

    const score = res.choices[0].message.content.trim();
    // Ensure we extract just the number if AI added any text
    const match = score.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  } catch (error) {
    console.error("Error in getATSScore using Groq:", error);
    return null;
  }
};