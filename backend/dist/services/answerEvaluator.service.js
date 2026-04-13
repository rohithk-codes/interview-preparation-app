"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerEvaluatorService = void 0;
class AnswerEvaluatorService {
    // Main evaluation function
    evaluate(userAnswer, question) {
        const normalizedAnswer = this.normalizeText(userAnswer);
        const keywordResults = this.evaluateKeywords(normalizedAnswer, question.keywords);
        const feedback = this.generateFeedback(keywordResults.percentage, keywordResults.matchedKeywords, keywordResults.missedKeywords, question.hints);
        return {
            score: keywordResults.score,
            maxScore: keywordResults.maxScore,
            percentage: keywordResults.percentage,
            matchedKeywords: keywordResults.matchedKeywords,
            missedKeywords: keywordResults.missedKeywords,
            feedback
        };
    }
    // Normalize text for comparison
    normalizeText(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s]/g, '');
    }
    // Evaluate keywords in answer
    evaluateKeywords(normalizedAnswer, keywords) {
        let score = 0;
        let maxScore = 0;
        const matchedKeywords = [];
        const missedKeywords = [];
        keywords.forEach((keyword) => {
            maxScore += keyword.weight;
            let isMatched = normalizedAnswer.includes(keyword.word.toLowerCase());
            if (!isMatched && keyword.synonyms && keyword.synonyms.length > 0) {
                isMatched = keyword.synonyms.some((syn) => normalizedAnswer.includes(syn.toLowerCase()));
            }
            if (isMatched) {
                score += keyword.weight;
                matchedKeywords.push(keyword.word);
            }
            else {
                missedKeywords.push(keyword.word);
            }
        });
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        return {
            score,
            maxScore,
            percentage,
            matchedKeywords,
            missedKeywords
        };
    }
    // Generate personalized feedback
    generateFeedback(percentage, matchedKeywords, missedKeywords, hints) {
        let feedback = '';
        if (percentage >= 90) {
            feedback = '🎉 Excellent answer! You covered all the key points perfectly.';
        }
        else if (percentage >= 75) {
            feedback = '✅ Great answer! You covered most of the important concepts.';
        }
        else if (percentage >= 60) {
            feedback = '👍 Good answer! You got the main idea, but there\'s room for improvement.';
        }
        else if (percentage >= 40) {
            feedback = '⚠️ Fair answer. You touched on some points but missed several key concepts.';
        }
        else {
            feedback = '❌ Needs improvement. Your answer is missing many important points.';
        }
        if (matchedKeywords.length > 0) {
            feedback += `\n\n✓ You mentioned: ${matchedKeywords.join(', ')}`;
        }
        if (missedKeywords.length > 0) {
            feedback += `\n\n⚠️ Consider mentioning: ${missedKeywords.join(', ')}`;
            if (hints.length > 0 && percentage < 75) {
                feedback += `\n\n💡 Hint: ${hints[0]}`;
            }
        }
        return feedback;
    }
    // Get improvement suggestions
    getImprovementSuggestions(userAnswer, idealAnswer, missedKeywords) {
        const suggestions = [];
        if (userAnswer.split(' ').length < 10) {
            suggestions.push('Try to provide more detailed explanations');
        }
        if (!userAnswer.includes('example') && !userAnswer.includes('for instance')) {
            suggestions.push('Consider adding an example to illustrate your point');
        }
        if (missedKeywords.length > 0) {
            suggestions.push(`Important concepts to include: ${missedKeywords.slice(0, 3).join(', ')}`);
        }
        return suggestions;
    }
}
exports.AnswerEvaluatorService = AnswerEvaluatorService;
exports.default = new AnswerEvaluatorService();
