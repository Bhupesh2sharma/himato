
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/data/seoTopics.ts');
const outputPath = path.join(__dirname, 'seo_titles.json');

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Regex to capture the title string. 
    // Matches: title: "Some Title",
    const regex = /title:\s*"([^"]+)"/g;
    let match;
    const titles = [];

    while ((match = regex.exec(data)) !== null) {
        titles.push(match[1]);
    }

    const jsonContent = JSON.stringify({ titles }, null, 2);

    fs.writeFile(outputPath, jsonContent, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log(`Successfully extracted ${titles.length} titles to seo_titles.json`);
        }
    });
});
