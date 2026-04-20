import { getATSScore } from './services/atsService.js';
import fs from 'fs';
import path from 'path';

async function testATS() {
  try {
    console.log("Testing ATS scoring...");
    
    // Create a dummy PDF file content (just text for testing if possible, but pdf-parse needs a real PDF)
    // Wait, I see there are already files in uploads/ from the terminal log.
    // uploads\5e62a403b33de43151e42bf5010022fb
    
    const uploadsDir = './uploads';
    const files = fs.readdirSync(uploadsDir);
    if (files.length === 0) {
      console.log("No files in uploads/ to test with.");
      return;
    }
    
    const testFile = path.join(uploadsDir, files[0]);
    console.log(`Testing with file: ${testFile}`);
    
    const jd = "Software Engineer with experience in React and Node.js";
    const score = await getATSScore(testFile, jd);
    
    console.log(`Score: ${score}`);
    process.exit(0);
  } catch (err) {
    console.error("ATS Test failed:", err);
    process.exit(1);
  }
}

testATS();
