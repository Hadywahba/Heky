import { Router } from "express";
import { login, signUp } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";

const router = Router();

// Sign up
router.post('/signup',async (req, res, next) => {
    const data = signUp(req.body)
   return successResponse({res , status:201 , data})
})


// Sign In
router.post('/signin', (req, res, next) => {
      const data = login(req.body)
    res.status(200).json({ message: "Done" , data })
})


export default router;