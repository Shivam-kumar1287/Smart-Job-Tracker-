import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';

async function testParse() {
  try {
    const filePath = 'uploads/183caac218bab7823a36e2d285be3af8';
    const buffer = fs.readFileSync(filePath);
    const pdf = new PDFParse(buffer);
    const data = await pdf.parse(); // Let's guess the method or check if it's auto-parsed
    console.log("Keys in data:", Object.keys(data));
    console.log("Text snippet:", (data.text || "").substring(0, 100));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testParse();
