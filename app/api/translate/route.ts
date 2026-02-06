import { NextRequest, NextResponse } from 'next/server';
import { extractComments, replaceComments, detectLanguage } from '@/lib/comment-detector';
import { batchTranslate } from '@/lib/translator';

export async function POST(request: NextRequest) {
    try {
        const { code, sourceLanguage, targetLanguage } = await request.json();

        if (!code || !targetLanguage) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Extract comments from code
        const comments = extractComments(code);

        if (comments.length === 0) {
            return NextResponse.json({
                success: true,
                translatedCode: code,
                message: 'No comments found in the code',
            });
        }

        // Auto-detect source language if needed
        let detectedSourceLang = sourceLanguage;
        if (sourceLanguage === 'auto') {
            // Detect from first comment
            detectedSourceLang = detectLanguage(comments[0].content);
        }

        // Extract comment texts
        const commentTexts = comments.map((c) => c.content);

        // Translate all comments
        const translatedComments = await batchTranslate(
            commentTexts,
            detectedSourceLang,
            targetLanguage
        );

        // Replace comments in original code
        const translatedCode = replaceComments(code, comments, translatedComments);

        return NextResponse.json({
            success: true,
            translatedCode,
            commentsTranslated: comments.length,
            detectedLanguage: detectedSourceLang,
        });
    } catch (error: any) {
        console.error('Translation API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Translation failed',
            },
            { status: 500 }
        );
    }
}
