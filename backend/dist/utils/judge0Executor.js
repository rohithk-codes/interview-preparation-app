"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Judge0Executor = void 0;
const axios_1 = __importDefault(require("axios"));
// Judge0 Language IDs
const LANGUAGE_IDS = {
    javascript: 63, // Node.js
    python: 71, // Python 3
    java: 62, // Java
    cpp: 54 // C++ 
};
class Judge0Executor {
    constructor() {
        this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
        this.apiKey = process.env.JUDGE0_API_KEY || "";
        this.apiHost = 'judge0-ce.p.rapidapi.com';
        if (!this.apiKey) {
            console.warn('⚠️  Judge0 API key not configured. Using fallback executor.');
        }
    }
    isAvailable() {
        return !!this.apiKey;
    }
    // Execute code with test cases
    async execute(code, language, testCases) {
        if (!this.apiKey) {
            throw new Error('Judge0 API key not configured');
        }
        const languageId = LANGUAGE_IDS[language];
        if (!languageId) {
            throw new Error(`Language ${language} not supported by Judge0`);
        }
        const testResults = [];
        let totalPassed = 0;
        let totalFailed = 0;
        let totalExecutionTime = 0;
        // Submit all test cases
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            try {
                const result = await this.runSingleTest(code, languageId, testCase, i);
                testResults.push(result);
                if (result.passed) {
                    totalPassed++;
                }
                else {
                    totalFailed++;
                }
                if (result.executionTime) {
                    totalExecutionTime += result.executionTime;
                }
                // Add small delay to avoid rate limiting
                await this.delay(500);
            }
            catch (error) {
                testResults.push({
                    testCaseIndex: i,
                    passed: false,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: '',
                    error: error.message
                });
                totalFailed++;
            }
        }
        return {
            testResults,
            totalPassed,
            totalFailed,
            executionTime: totalExecutionTime
        };
    }
    // Run a single test case
    async runSingleTest(code, languageId, testCase, index) {
        try {
            // Prepare code with input
            const wrappedCode = this.wrapCode(code, testCase.input, languageId);
            // Submit to Judge0
            const submission = await this.submitCode(wrappedCode, languageId);
            console.log("ssss", submission);
            // Get result
            const result = await this.getResult(submission.token);
            console.log("result", result);
            // Parse output
            const actualOutput = this.normalizeOutput(result.stdout || '');
            const expectedOutput = this.normalizeOutput(testCase.expectedOutput);
            console.log("actualout", actualOutput);
            const passed = actualOutput === expectedOutput && result.status.id === 3;
            // Check for errors
            let error = undefined;
            if (result.status.id !== 3) {
                error = result.stderr || result.compile_output || result.message || 'Unknown error';
            }
            return {
                testCaseIndex: index,
                passed,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: actualOutput || result.stdout || '',
                executionTime: parseFloat(result.time) * 1000,
                error
            };
        }
        catch (error) {
            return {
                testCaseIndex: index,
                passed: false,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: '',
                error: error.message
            };
        }
    }
    // Submit code to Judge0
    async submitCode(code, languageId) {
        const response = await axios_1.default.post(`${this.apiUrl}/submissions?base64_encoded=false&wait=false`, {
            source_code: code,
            language_id: languageId,
            stdin: ''
        }, {
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': this.apiKey,
                'X-RapidAPI-Host': this.apiHost
            }
        });
        return response.data;
    }
    // Get submission result
    async getResult(token) {
        const maxAttempts = 10;
        let attempts = 0;
        while (attempts < maxAttempts) {
            const response = await axios_1.default.get(`${this.apiUrl}/submissions/${token}?base64_encoded=false`, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.apiHost
                }
            });
            const result = response.data;
            // Status 1 = In Queue, Status 2 = Processing
            if (result.status.id > 2) {
                return result;
            }
            // Wait before next poll
            await this.delay(1000);
            attempts++;
        }
        throw new Error('Execution timeout');
    }
    // Wrap code for execution
    wrapCode(code, input, languageId) {
        // For JavaScript (Node.js)
        if (languageId === 63) {
            // Parse input and extract function call
            const functionMatch = code.match(/function\s+(\w+)/);
            const functionName = functionMatch ? functionMatch[1] : null;
            if (!functionName) {
                return code + `\n${input}`;
            }
            return `${code}\n\nconst result = ${functionName}(${input});\nconsole.log(JSON.stringify(result));`;
        }
        // For Python
        if (languageId === 71) {
            const functionMatch = code.match(/def\s+(\w+)/);
            const functionName = functionMatch ? functionMatch[1] : null;
            if (!functionName) {
                return code;
            }
            return `${code}\n\nresult = ${functionName}(${input})\nprint(result)`;
        }
        return code;
    }
    // Normalize output for comparison
    normalizeOutput(output) {
        return output
            .trim()
            .replace(/\s+/g, '')
            .replace(/['"]/g, '')
            .toLowerCase();
    }
    // Delay helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.Judge0Executor = Judge0Executor;
exports.default = new Judge0Executor();
