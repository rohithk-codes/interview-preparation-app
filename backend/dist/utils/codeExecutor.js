"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExecutor = void 0;
const judge0Executor_1 = __importDefault(require("./judge0Executor"));
class CodeExecutor {
    async execute(code, language, testCases) {
        console.log("api", judge0Executor_1.default.isAvailable());
        if (judge0Executor_1.default.isAvailable() && language !== "javascript") {
            try {
                console.log("otherlanguage");
                return await judge0Executor_1.default.execute(code, language, testCases);
            }
            catch (error) {
                console.error('Judge0 execution failed, falling back to local executor:', error);
            }
        }
        if (language === "javascript") {
            return await this.executeJavaScript(code, testCases);
        }
        throw new Error(`Language ${language} not supported without Judge0`);
    }
    async executeJavaScript(code, testCases) {
        const testResults = [];
        let totalPassed = 0;
        let totalFailed = 0;
        const startTime = Date.now();
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            try {
                const result = await this.runTestCase(code, testCase, i);
                testResults.push(result);
                if (result.passed) {
                    totalPassed++;
                }
                else {
                    totalFailed++;
                }
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
        const executionTime = Date.now() - startTime;
        return {
            testResults,
            totalFailed,
            totalPassed,
            executionTime
        };
    }
    //Single test case
    async runTestCase(code, testCase, index) {
        const startTime = Date.now();
        try {
            const wrappedCode = this.wrapCode(code, testCase.input);
            //Execute the code 
            const actualOutput = await this.safeEval(wrappedCode);
            const executionTime = Date.now() - startTime;
            //Compare outputs
            const expected = this.normalizeOutput(testCase.expectedOutput);
            const actual = this.normalizeOutput(typeof actualOutput === 'string' ? actualOutput : JSON.stringify(actualOutput));
            const passed = expected === actual;
            return {
                testCaseIndex: index,
                passed,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: JSON.stringify(actualOutput),
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                testCaseIndex: index,
                passed: false,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: "",
                executionTime,
                error: error.message
            };
        }
    }
    //Wrap user code
    wrapCode(code, input) {
        const inputs = this.parseInput(input);
        const functionName = this.extractFunctionName(code);
        if (!functionName) {
            throw new Error("Colud not find function in code");
        }
        return `${code}
  //Execute function with test inputs
  const result = ${functionName}(${inputs});
  return  result
  `;
    }
    //Parse input string into Javascript arguments
    parseInput(input) {
        try {
            return input;
        }
        catch (error) {
            return input;
        }
    }
    extractFunctionName(code) {
        const patterns = [
            /function\s+(\w+)\s*\(/,
            /const\s+(\w+)\s*=\s*function/,
            /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,
            /let\s+(\w+)\s*=\s*function/,
            /let\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,
            /var\s+(\w+)\s*=\s*function/,
            /var\s+(\w+)\s*=\s*\([^)]*\)\s*=>/
        ];
        for (const pattern of patterns) {
            const match = code.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }
    async safeEval(code) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Time Limit Exceeded"));
            }, 5000);
            try {
                const func = new Function(`
      "use strict";
      return (function(){
      ${code}
      })();
      `);
                const result = func();
                console.log("EvalResult", result);
                clearTimeout(timeout);
                resolve(result);
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    // Normalize output for comparison
    normalizeOutput(output) {
        return output
            .replace(/\s+/g, '')
            .replace(/['"]/g, '')
            .toLowerCase()
            .trim();
    }
}
exports.CodeExecutor = CodeExecutor;
exports.default = new CodeExecutor();
