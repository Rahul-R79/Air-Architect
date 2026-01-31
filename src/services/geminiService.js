import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
    constructor() {
        this.genAI = null;
        this.model = null;
    }

    initialize() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("Gemini API Key missing in .env");
            return false;
        }

        try {
            this.genAI = new GoogleGenerativeAI(apiKey);

            // 1. Layout Generation Model
            this.layoutModel = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
            });

            // 2. Voice Transcription Model
            this.voiceModel = this.genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
            });

            return true;
        } catch (error) {
            console.error("Failed to init Gemini:", error);
            return false;
        }
    }

    async generateLayout(transcript, imageBase64 = null) {
        if (!this.layoutModel) {
            this.initialize();
            if (!this.layoutModel) {
                throw new Error("Gemini Layout Model not initialized.");
            }
        }

        const promptText = `
You are an Expert UI/UX Designer.

**YOUR TASK:**
Analyze the attached wireframe image and voice instructions to create a modern, full-screen HTML/Tailwind page.

**INPUTS:**
1. **IMAGE**: A wireframe showing cyan rectangles labeled "BOX 1", "BOX 2", etc.
2. **VOICE TRANSCRIPT**: "${transcript || "No voice instructions provided."}"

**INSTRUCTIONS:**
1. **Look** at the image to understand the layout structure
2. **Read** the voice transcript to understand what each box should contain
3. **Generate** beautiful, modern HTML with Tailwind CSS

**CRITICAL RULES:**
- The wireframe is a schematic. YOU MUST EXPAND it to fill the entire screen (\`min-h-screen\`)
- Do not create a small card in the center. Make it a full website.
- Use modern design: rounded corners (xl/2xl), soft shadows, premium typography (Inter/Onest)
- Include \`<script src="https://cdn.tailwindcss.com"></script>\`
- Include \`<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">\`
- Font: 'Onest', 'Inter', sans-serif
- **IMAGES**: 
  * **CRITICAL**: Read the voice transcript to extract image keywords
  * Use Pexels format: \`https://images.pexels.com/photos/{photo-id}/pexels-photo-{photo-id}.jpeg?auto=compress&cs=tinysrgb&w=800\`
  * Choose photo IDs contextually:
    - If transcript mentions specific subjects: Match photo content to that subject
    - For generic hero sections: Use landscape/abstract photo IDs
- **RESPONSIVE DESIGN (CRITICAL)**:
  * **Mobile-First**: Design works on phones (320px+), tablets (768px+), and desktops (1024px+)
  * **NO CONTENT HIDING**: All content must be visible on all screen sizes. Use \`overflow-x-hidden\` on body, never hide sections
  * **Flexible Layouts**: Use \`flex\`, \`grid\`, and responsive utilities (\`md:\`, \`lg:\`, \`xl:\`)
  * **Typography**: Scale text with \`text-sm md:text-base lg:text-lg\` patterns
  * **Spacing**: Use responsive padding/margins (\`px-4 md:px-8 lg:px-16\`)
  * **Images**: Always use \`w-full h-auto object-cover\` or \`object-contain\` for proper scaling
  * **Navigation**: Use hamburger menu on mobile (\`md:hidden\` / \`hidden md:flex\`)
  * **Buttons/CTAs**: Stack vertically on mobile (\`flex-col md:flex-row\`)
  * **Test mentally**: Would this work on an iPhone SE (375px) AND a 4K monitor (3840px)?
- **Return ONLY raw HTML**
        `.trim();

        let parts = [promptText];

        if (imageBase64) {
            const cleanBase64 = imageBase64.replace(
                /^data:image\/(png|jpeg|webp);base64,/,
                "",
            );

            parts.push({
                inlineData: {
                    data: cleanBase64,
                    mimeType: "image/png",
                },
            });
            console.log("📸 Attached Vision Snapshot to Prompt");
        }

        try {
            const result = await this.layoutModel.generateContent(parts);

            const response = await result.response;
            const text = response.text();
            return this.cleanCode(text);
        } catch (error) {
            console.error("Gemini Generation Failed:", error);
            throw error;
        }
    }

    async transcribeAudio(base64Audio) {
        if (!this.voiceModel) {
            this.initialize();
            if (!this.voiceModel) return null;
        }

        try {
            const prompt =
                "Transcribe the following audio exactly. Do not summarize. Return ONLY the raw spoken text.";
            const audioPart = {
                inlineData: {
                    data: base64Audio,
                    mimeType: "audio/webm",
                },
            };

            const result = await this.voiceModel.generateContent([
                prompt,
                audioPart,
            ]);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Transcription Failed:", error);
            throw error;
        }
    }

    cleanCode(raw) {
        return raw
            .replace(/```html/g, "")
            .replace(/```/g, "")
            .trim();
    }
}

export const geminiService = new GeminiService();
