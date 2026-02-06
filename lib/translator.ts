/**
 * Translate text using Lingo.dev SDK (Primary) + Gemini Fallback
 */

import { LingoDotDevEngine } from "lingo.dev/sdk";

const LINGO_API_KEY = process.env.LINGO_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Lingo.dev SDK
const lingoDotDev = LINGO_API_KEY
    ? new LingoDotDevEngine({ apiKey: LINGO_API_KEY })
    : null;

interface TranslationOptions {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
}

/**
 * Translate using Lingo.dev SDK (Official)
 */
async function translateWithLingo(options: TranslationOptions): Promise<string> {
    if (!lingoDotDev) {
        throw new Error('LINGO_API_KEY not configured');
    }

    console.log('🌐 Using Lingo.dev SDK for translation...');

    const translated = await lingoDotDev.localizeText(options.text, {
        sourceLocale: options.sourceLanguage,
        targetLocale: options.targetLanguage,
    });

    // Apply risk detection based on keywords in the ORIGINAL text
    const originalLower = options.text.toLowerCase();
    let prefix = '';

    // Critical keywords (High Risk)
    const criticalKeywords = ['hack', 'hardcode', 'password', 'secret', 'don\'t touch', '不要触碰', '临时', '密码', 'temporary', 'dangerous', 'security', 'do not modify'];
    const cautionKeywords = ['todo', 'fixme', 'bug', 'workaround', 'deprecated', 'legacy', 'warning', '警告', '注意', 'caution', 'issue'];

    if (criticalKeywords.some(kw => originalLower.includes(kw))) {
        prefix = '🔴 [CRITICAL] ';
    } else if (cautionKeywords.some(kw => originalLower.includes(kw))) {
        prefix = '⚠️ [CAUTION] ';
    }

    return prefix + translated;
}

/**
 * Translate using Google Gemini API (Fallback)
 */
async function translateWithGemini(options: TranslationOptions): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    // Dynamically import the SDK (only on server side)
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const prompt = `
    You are a Senior Technical Editor and Code Safety Expert.
    Your goal is to translate and ANALYZE the following code comment from "${options.sourceLanguage}" to "${options.targetLanguage}".

    INPUT COMMENT: "${options.text}"

    INSTRUCTIONS:
    1. **Normalize**: Translate into professional, clear, standard engineering ${options.targetLanguage}. Remove emotional language.
    2. **Analyze Intent**: Classify as: "Warning", "Hack", "Todo", "Explanation", "Deprecation", or "General".
    3. **Assess Risk**:
       - 🔴 High (Dangerous, critical, security, "do not touch")
       - 🟡 Medium (Workarounds, technical debt, potential issues)
       - 🟢 Low (General info, standard docs)

    OUTPUT FORMAT:
    Return ONLY a raw JSON object (no markdown formatting) with this structure:
    {
      "normalized": "The professional translation in ${options.targetLanguage}",
      "intent": "One of the intents above",
      "risk": "High/Medium/Low",
      "risk_reason": "Short reason (max 5 words)"
    }
    `;

    // 1. Try Local Ollama First (User Request)
    let ollamaErrorDetail = "Not attempted";
    try {
        console.log("Attempting Local Ollama (Priority)...");
        return await translateWithOllama(options, prompt);
    } catch (e: any) {
        console.warn("Ollama unavailable, falling back to Cloud...", e);
        ollamaErrorDetail = e.message || "Unknown Connection Error";
    }

    // 2. Cloud Fallback: Gemini 2.0 -> Gemini 1.5
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting translation with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/```json|```/g, '').trim();
            const analysis = JSON.parse(text);

            return formatAnalysis(analysis);

        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error; // Capture the error
            continue;
        }
    }

    // Capture detail for debugging
    const errorMsg = lastError ? lastError.message : "No Cloud Error Captured";
    throw new Error(`All AI models failed.\n\nLocal Ollama Error: ${ollamaErrorDetail}\n\nCloud Gemini Error: ${errorMsg}`);
}

// Helper to format the JSON analysis
function formatAnalysis(analysis: any): string {
    let prefix = "";
    if (analysis.risk === "High") prefix = "🔴 [CRITICAL]";
    else if (analysis.risk === "Medium") prefix = "⚠️ [CAUTION]";

    // Return with badge prefix if risky, otherwise just the translation
    if (prefix) {
        return `${prefix} ${analysis.normalized}`;
    }
    return analysis.normalized;
}

/**
 * Translate using Local Ollama Instance
 */
async function translateWithOllama(options: TranslationOptions, systemPrompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // Increased to 120s (2 minutes)

    try {
        // Use 127.0.0.1 instead of localhost to avoid Node.js IPv6 resolution issues
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gemma2:9b",
                prompt: `Translate this code comment to ${options.targetLanguage}:
"${options.text}"

Rules:
1. Output ONLY the translation, nothing else
2. The translation MUST be in ${options.targetLanguage}
3. Keep technical terms unchanged

Translation:`,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        const translatedText = data.response?.trim() || '';
        console.log("🔍 Ollama translation:", translatedText);

        // Apply SECURITY SCANNING based on keywords AND patterns in the ORIGINAL text
        const originalLower = options.text.toLowerCase();
        const originalText = options.text;
        let prefix = '';

        // SECURITY PATTERNS (regex-based detection)
        const securityPatterns = [
            /api[_-]?key\s*[:=]/i,              // API keys
            /secret[_-]?key\s*[:=]/i,           // Secret keys
            /password\s*[:=]\s*["'][^"']+["']/i, // Hardcoded passwords
            /Bearer\s+[A-Za-z0-9\-._~+\/]+/,    // Bearer tokens
            /sk-[A-Za-z0-9]{20,}/,              // OpenAI-like API keys
            /ghp_[A-Za-z0-9]{36}/,              // GitHub tokens
            /aws[_-]?(access|secret)/i,         // AWS credentials
            /private[_-]?key/i,                 // Private keys
            /credentials?\s*[:=]/i,             // Credentials
        ];

        // Check for security patterns first (highest priority)
        const hasSecurityViolation = securityPatterns.some(pattern => pattern.test(originalText));

        // Critical keywords (High Risk) - 🔴
        const criticalKeywords = ['hack', 'hardcode', 'password', 'secret', 'don\'t touch', 'do not touch', '不要触碰', '临时', '密码', 'temporary fix', 'dangerous', 'security', 'do not modify', 'critical', 'urgent', 'broken', 'vulnerability', 'exploit', 'injection', 'unsafe'];
        // Caution keywords (Medium Risk) - 🟡
        const cautionKeywords = ['todo', 'fixme', 'bug', 'workaround', 'deprecated', 'legacy', 'warning', '警告', '注意', 'caution', 'issue', 'refactor', 'technical debt', 'needs review', 'optimize', 'cleanup', 'temporary'];

        if (hasSecurityViolation) {
            prefix = '🔴 [SECURITY] ';
        } else if (criticalKeywords.some(kw => originalLower.includes(kw))) {
            prefix = '🔴 [CRITICAL] ';
        } else if (cautionKeywords.some(kw => originalLower.includes(kw))) {
            prefix = '🟡 [CAUTION] ';
        } else {
            prefix = '🟢 [SAFE] ';
        }

        return prefix + translatedText;

    } catch (error) {
        throw error;
    }
}

/**
 * Main translation function - Lingo.dev FIRST, Gemini as fallback
 */
export async function translateText(options: TranslationOptions): Promise<string> {
    try {
        // 🌟 Use Lingo.dev FIRST (Primary for hackathon!)
        if (LINGO_API_KEY && lingoDotDev) {
            console.log('🚀 Translating with Lingo.dev:', options.text.substring(0, 50));
            return await translateWithLingo(options);
        }

        // Fallback to Gemini if Lingo not available
        if (GEMINI_API_KEY) {
            console.log('⚡ Falling back to Gemini...');
            return await translateWithGemini(options);
        }

        throw new Error('No API key configured. Please set LINGO_API_KEY or GEMINI_API_KEY');
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
): Promise<string[]> {
    // Translate in parallel for better performance
    const promises = texts.map((text) =>
        translateText({ text, sourceLanguage, targetLanguage })
    );

    return Promise.all(promises);
}
