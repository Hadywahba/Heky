import { Router } from "express";
import { login, signUp } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";

const router = Router();

// Sign up
router.post('/signup',async (req, res, next) => {
    const data = await signUp(req.body)
   return successResponse({res , status:201 , data})
})


// Sign In
router.post('/signin', async (req, res, next) => {
      const data = await login(req.body)
   return successResponse({res , status:200 , data})
})


export default router;