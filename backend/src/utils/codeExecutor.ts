import { ITestCase } from "../models/Question";
import { ITestResult } from "../models/Submission";

export class CodeExecutor {
  async executeJavaScritp(
    code: string,
    testCases: ITestCase[]
  ): Promise<{
    testResults: ITestResult[];
    totalPassed: number;
    totalFailed: number;
    executionTime: number;
  }> {
    const testResults: ITestResult[] = [];
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
        } else {
          totalFailed++;
        }
      } catch (error: any) {
        testResults.push({
          testCaseIndex: i,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          error: error.message,
        });
        totalFailed++;
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      testResults,
      totalPassed,
      totalFailed,
      executionTime,
    };
  }

  //Run  a single test case
  private async runTestCase(
    code: string,
    testCase: ITestCase,
    index: number
  ): Promise<ITestResult> {
    const startTime = Date.now();
    try {
      //Create a safe execution environment
      const wrappedCode = this.wrapCode(code, testCase.input);

      //Execute the code
      const actualOutput = await this.safeEval(wrappedCode);
      const executionTime = Date.now() - startTime;

      // Convert to string properly
      const actualString = typeof actualOutput === 'object' 
        ? JSON.stringify(actualOutput) 
        : String(actualOutput);          

      
      //Compare outputs
      const expected = this.normalizeOutput(testCase.expectedOutput);
      
      const actual = this.normalizeOutput(actualString);
    
      const passed = expected === actual;

     
      return {
        testCaseIndex: index,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: actualString,
        executionTime,
      };
    } catch (error: any) {

      const executionTime = Date.now() - startTime;
      return {
        testCaseIndex: index,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: "",
        executionTime,
        error: error.message,
      };
    }
  }

  //Wrap user code with test input
  private wrapCode(code: string, input: string): string {
    //Parse the input
    const inputs = this.parseInput(input);

    //Extract function name from code
    const functionName = this.extractFunctionName(code);
      
    if (!functionName) {
      throw new Error("Could not find function in code");
    }

    // Create wrapped code
    return `
      ${code}
      // Execute function with test inputs
      const result = ${functionName}(${inputs});
      return result;
    `;
  }

  // Parse input string into JavaScript arguments
  private parseInput(input: string): string {
    try {
      return input;
    } catch {
      return input;
    }
  }

  // Extract function name from code
  private extractFunctionName(code: string): string | null {
    // Match: function functionName
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

  // Safe eval with timeout

  private async safeEval(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      
      const timeout = setTimeout(() => {
        reject(new Error("Time Limit Exceeded"));
      }, 5000);
      try {
        const func = new Function(`
    'use strict';
    return (function(){
    ${code}
    })();
    `);
        const result = func();
        clearTimeout(timeout);
        resolve(result);
      } catch (error: any) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }




 // Normalize output for comparison
  private normalizeOutput(output: string): string {
    // Remove spaces, quotes, and normalize formatting
    return output
      .replace(/\s+/g, '')
      .replace(/['"]/g, '')
      .toLowerCase()
      .trim();
  }

  //For execute python code
  async executePython(
    code: string,
    testCase: ITestCase[]
  ): Promise<{
    testResults: ITestResult[];
    totalPassed: number;
    totalFailed: number;
    executionTime: number;
  }> {
    throw new Error("python code execution error");
  }
}

export default new CodeExecutor();
