import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_API_KEY;

async function checkModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", JSON.stringify(data, null, 2));
        } else {
            console.log("Available Models:");
            data.models.forEach(m => console.log(m.name));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

checkModels();
