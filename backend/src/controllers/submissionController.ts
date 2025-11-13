import { Request, Response } from "express";
import submissionService from "../services/submission.service";

export const submitCode = async(
  req: Request, res: Response):Promise<void> => {
    try {
      const { questionId, code, language } = req.body;
      if (!questionId || !code || !language) {
        res.status(400).json({
          success: false,
          message: "Please provide questionid code and language",
        });
        return;
      }

      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const submission = await submissionService.submitCode({
        userId: req.user.id,
        questionId,
        code,
        language,
      });

      res.status(201).json({
        success: true,
        message: "Code submitted successfully",
        data: submission,
      });
    
    } catch (error: any) {
      console.error("Submit code error", error);
      res.status(500).json({
        success: false,
        message: "Error submitting code",
        error: error.message,
      });
    }
  }


  export const runCode = async(req:Request,res:Response):Promise<void>=>{
try {
    const{quesitonId,code,language} = req.body
    if(!quesitonId || !code || !language){
        res.status(400).json({
            success:false,
            message: 'Please provide questionId, code, and language'
        })
        return
    }

    const result = await submissionService.runCode(quesitonId,code,language)

    res.status(200).json({
      success: true,
      message: 'Code executed successfully',
      data: result
    });

} catch (error:any) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running code',
      error: error.message
    });
}
  }



