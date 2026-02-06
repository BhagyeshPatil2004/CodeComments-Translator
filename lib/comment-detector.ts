// Comment detection patterns for different languages
const commentPatterns = {
    singleLine: [
        /\/\/(.*)$/gm,        // JavaScript, C++, Java, etc.
        /#(.*)$/gm,           // Python, Ruby, Shell, etc.
        /--(.*)$/gm,          // SQL, Lua, Haskell
    ],
    multiLine: [
        /\/\*[\s\S]*?\*\//g,  // C-style /* */
        /"""[\s\S]*?"""/g,    // Python docstrings
        /'''[\s\S]*?'''/g,    // Python docstrings (single quotes)
    ],
};

export interface CommentMatch {
    type: 'single' | 'multi';
    content: string;
    fullMatch: string;
    index: number;
}

/**
 * Extract all comments from code
 */
export function extractComments(code: string): CommentMatch[] {
    const comments: CommentMatch[] = [];

    // Extract single-line comments
    commentPatterns.singleLine.forEach((pattern) => {
        const matches = code.matchAll(pattern);
        for (const match of matches) {
            if (match.index !== undefined) {
                comments.push({
                    type: 'single',
                    content: match[1].trim(),
                    fullMatch: match[0],
                    index: match.index,
                });
            }
        }
    });

    // Extract multi-line comments
    commentPatterns.multiLine.forEach((pattern) => {
        const matches = code.matchAll(pattern);
        for (const match of matches) {
            if (match.index !== undefined) {
                comments.push({
                    type: 'multi',
                    content: match[0].replace(/^(\/\*|"""|''')/, '').replace(/("""|'''|\*\/)$/, '').trim(),
                    fullMatch: match[0],
                    index: match.index,
                });
            }
        }
    });

    // Sort by index to maintain order
    return comments.sort((a, b) => a.index - b.index);
}

/**
 * Replace comments in code with translated versions
 */
export function replaceComments(
    code: string,
    originalComments: CommentMatch[],
    translatedComments: string[]
): string {
    let result = code;

    // Replace in reverse order to maintain indices
    const sortedComments = [...originalComments].sort((a, b) => b.index - a.index);

    sortedComments.forEach((comment, i) => {
        const reverseIndex = originalComments.length - 1 - i;
        const translated = translatedComments[reverseIndex];

        if (comment.type === 'single') {
            // Detect comment style from original
            const prefix = comment.fullMatch.match(/^(\/\/|#|--)/)?.[0] || '//';
            const newComment = `${prefix} ${translated}`;
            result = result.substring(0, comment.index) + newComment + result.substring(comment.index + comment.fullMatch.length);
        } else {
            // Multi-line comment
            const isDocstring = comment.fullMatch.startsWith('"""') || comment.fullMatch.startsWith("'''");
            const quote = comment.fullMatch.startsWith('"""') ? '"""' : comment.fullMatch.startsWith("'''") ? "'''" : '';

            if (isDocstring) {
                const newComment = `${quote}${translated}${quote}`;
                result = result.substring(0, comment.index) + newComment + result.substring(comment.index + comment.fullMatch.length);
            } else {
                const newComment = `/* ${translated} */`;
                result = result.substring(0, comment.index) + newComment + result.substring(comment.index + comment.fullMatch.length);
            }
        }
    });

    return result;
}

/**
 * Detect if text contains non-Latin characters (Chinese, Japanese, Korean, etc.)
 */
export function detectLanguage(text: string): string {
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'; // Japanese
    if (/[\uac00-\ud7af]/.test(text)) return 'ko'; // Korean
    if (/[\u0400-\u04ff]/.test(text)) return 'ru'; // Russian
    if (/[\u0600-\u06ff]/.test(text)) return 'ar'; // Arabic
    if (/[\u0900-\u097f]/.test(text)) return 'hi'; // Hindi

    return 'en'; // Default to English
}
