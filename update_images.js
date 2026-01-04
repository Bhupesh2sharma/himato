
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/data/seoTopics.ts');

const IMAGE_MAP = {
    'lake': 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&q=80',
    'monastery': 'https://images.unsplash.com/photo-1544634076-a90160ccd682?auto=format&fit=crop&q=80',
    'gompa': 'https://images.unsplash.com/photo-1544634076-a90160ccd682?auto=format&fit=crop&q=80',
    'spiritual': 'https://images.unsplash.com/photo-1544634076-a90160ccd682?auto=format&fit=crop&q=80',
    'buddha': 'https://images.unsplash.com/photo-1605649487215-285f33880695?auto=format&fit=crop&q=80',
    'tea': 'https://images.unsplash.com/photo-1565120130276-dfbd9a7a3ad7?auto=format&fit=crop&q=80',
    'food': 'https://images.unsplash.com/photo-1625167359766-1514a586b614?auto=format&fit=crop&q=80',
    'cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80',
    'thukpa': 'https://images.unsplash.com/photo-1625167359766-1514a586b614?auto=format&fit=crop&q=80',
    'dining': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80',
    'work': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80',
    'internet': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80',
    'wifi': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80',
    'road': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80',
    'drive': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80',
    'car': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80',
    'taxi': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80',
    'snow': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80',
    'winter': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80',
    'zero point': 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80',
    'forest': 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80',
    'green': 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80',
    'trek': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80',
    'hike': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80',
    'panda': 'https://images.unsplash.com/photo-1543158023-40e947117e3f?auto=format&fit=crop&q=80',
    'waterfall': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80',
    'rafting': 'https://images.unsplash.com/photo-1530866495561-eb8fbd97e3ab?auto=format&fit=crop&q=80',
    'paragliding': 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80',
    'cherry': 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80',
    'flower': 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80',
    'family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80',
    'kids': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80',
    'permit': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80',
    'ruins': 'https://images.unsplash.com/photo-1599309927653-b0a8bb36ffec?auto=format&fit=crop&q=80',
    'history': 'https://images.unsplash.com/photo-1599309927653-b0a8bb36ffec?auto=format&fit=crop&q=80',
    'view': 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&q=80', // General mountain view
    'kanchenjunga': 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&q=80'; // Himalaya general

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    let updatedData = data;

    // We will parse the file using regex to find each object and replace the image line based on the id/title found in that block.
    // This is a bit complex with regex. A simpler way for this task:
    // Iterate through lines. preserve state "currentId" "currentTitle". When hitting "image:", replace it.

    const lines = data.split('\n');
    let currentId = '';
    let currentTitle = '';

    const newLines = lines.map(line => {
        // Capture ID
        const idMatch = line.match(/^\s*id:\s*'([^']+)'/);
        if (idMatch) {
            currentId = idMatch[1].toLowerCase();
            return line;
        }

        // Capture Title
        const titleMatch = line.match(/^\s*title:\s*"([^"]+)"/);
        if (titleMatch) {
            currentTitle = titleMatch[1].toLowerCase();
            return line;
        }

        // Replace Image
        if (line.trim().startsWith('image:')) {
            let newImage = DEFAULT_IMAGE;
            const searchString = (currentId + ' ' + currentTitle).toLowerCase();

            // Find best match
            for (const [key, url] of Object.entries(IMAGE_MAP)) {
                if (searchString.includes(key)) {
                    newImage = url;
                    break; // Use the first match
                }
            }
            // Preserve indentation
            const indentation = line.match(/^\s*/)[0];
            return `${indentation}image: '${newImage}',`;
        }

        return line;
    });

    updatedData = newLines.join('\n');

    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('Successfully updated images in seoTopics.ts');
        }
    });
});
