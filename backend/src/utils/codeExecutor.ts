import { resolve } from "path";
import { ITestCase } from "../models/Question";
import { ITestResult } from "../models/Submission";
import judge0Executor from "./judge0Executor";

export class CodeExecutor{

  async execute(
    code:string,
    language:string,
    testCases:ITestCase[]
  ):Promise<{
    testResults:ITestResult[];
    totalPassed:number;
    totalFailed:number;
    executionTime:number;
  }>{

    if(judge0Executor.isAvailable() && language !== "javascript"){
      try {
        return await judge0Executor.execute(code,language,testCases)
      } catch (error) {
                console.error('Judge0 execution failed, falling back to local executor:', error);

      }
    }

    if(language==="javascript"){
      return await this.executeJavaScript(code,testCases)
    }
     throw new Error(`Language ${language} not supported without Judge0`);
  }


  async executeJavaScript(
    code:string,
    testCases:ITestCase[]
  ):Promise<{
    testResults:ITestResult[];
    totalPassed:number;
    totalFailed:number;
    executionTime:number;
  }>{
    const testResults :ITestResult[] = []
    let totalPassed = 0 ;
    let totalFailed = 0 ;
    const startTime = Date.now()

    for(let i=0 ; i<testCases.length ;i++){
      const testCase = testCases[i]

      try {
        const result = await this.runTestCase(code,testCase,i)
        testResults.push(result)
        if(result.passed){
          totalPassed++
        }else{
          totalFailed++
        }

      } catch (error:any) {
        testResults.push({
          testCaseIndex:i,
          passed:false,
          input:testCase.input,
          expectedOutput:testCase.expectedOutput,
          actualOutput:'',
          error:error.message
        })
        totalFailed++
      }
    }
    const executionTime = Date.now()- startTime;
    return{
      testResults,
      totalFailed,
      totalPassed,
      executionTime
    }

  }


  //Single test case
private async runTestCase(
  code:string,
  testCase:ITestCase,
  index:number
):Promise<ITestResult>{
  const startTime = Date.now()

  try {
    //Create safe execution environment
    const wrappedCode = this.wrapCode(code,testCase.input)

    //Execute the code 
    const actualOutput = await this.safeEval(wrappedCode)
    const executionTime = Date.now() - startTime

    //Compare outputs
    const expected = this.normalizeOutput(testCase.expectedOutput)
    const actual = this.normalizeOutput(String(actualOutput))

    const passed = expected === actual;

    return{
testCaseIndex:index,
passed,
input:testCase.input,
expectedOutput:testCase.expectedOutput,
actualOutput:String(actualOutput),
executionTime
    }

  } catch (error:any) {
    const executionTime = Date.now() - startTime;

    return {
      testCaseIndex:index,
      passed:false,
      input:testCase.input,
      expectedOutput:testCase.expectedOutput,
      actualOutput:"",
      executionTime,
      error:error.message
    }
  }
}


//Wrap user code
private wrapCode(code:string,input:string):string{
  const inputs = this.parseInput(input)
  
  const functionName = this.extractFunctionName(code)
  if(!functionName){
    throw new Error("Colud not find function in code")
  }

  return `${code}
  //Execute function with test inputs
  const result = ${functionName}(${inputs});
  result
  `;
}

//Parse input string into Javascript arguments
private parseInput(input:string):string{
  try {
    return input
  } catch (error) {
    return input
  }
}


//Extract function name from code 
private extractFunctionName(code:string):string | null {

   const patterns = [
      /function\s+(\w+)\s*\(/,
      /const\s+(\w+)\s*=\s*function/,
      /const\s+(\w+)\s*=\s*\(/,
      /let\s+(\w+)\s*=\s*function/,
      /var\s+(\w+)\s*=\s*function/
    ];


    //   const patterns = [
    //   /function\s+(\w+)\s*\(/,                   
    // /const\s+(\w+)\s*=\s*function/,             
    // /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,      
    // /let\s+(\w+)\s*=\s*function/,
    // /let\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,        
    // /var\s+(\w+)\s*=\s*function/,
    // /var\s+(\w+)\s*=\s*\([^)]*\)\s*=>/ 
    // ];

    for(const pattern of patterns){
      const match = code.match(pattern)
      if(match){
        return match[1]
      }
    }
return null
}

private async safeEval(code:string):Promise<any>{
  return new Promise((resolve,reject)=>{
    const timeout = setTimeout(()=>{
      reject(new Error("Time Limit Exceeded"))
    },5000)
 
  try {
    const func = new Function(`
      "use strict";
      return (function(){
      ${code}
      })();
      `)

      const result = func()
      clearTimeout(timeout)
      resolve(result)
  } catch (error:any) {
    clearTimeout(timeout)
    reject(error)
  }
   })
}


  // Normalize output for comparison
  private normalizeOutput(output: string): string {
    // Remove spaces, quotes
    return output
      .replace(/\s+/g, '')
      .replace(/['"]/g, '')
      .toLowerCase()
      .trim();
  }


  isJudge0Available():boolean{
    return judge0Executor.isAvailable()
  }

}


export default new CodeExecutor();
