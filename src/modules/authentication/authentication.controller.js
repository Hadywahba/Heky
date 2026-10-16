import { Router } from "express";
import { login, rotateToken, signUp } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
import { authenticationMiddleware } from "../../middleware/index.js";
import { TokenTypeEnum } from "../../common/enum/index.js";

const router = Router();

// Sign up
router.post('/signup', async (req, res, next) => {
   const data = await signUp(req.body)
   return successResponse({ res, status: 201, data })
})


// Sign In
router.post('/signin', async (req, res, next) => {
   const data = await login(req.body, `${req.protocol}://${req.host}`)
   return successResponse({ res, status: 200, data })
})

// Rotate Token
router.post('/rotate-token',
   authenticationMiddleware(TokenTypeEnum.REFRESH),
   async (req, res, next) => {

      const data = await rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`)
      return successResponse({ res, status: 201, data })

   })

export default router;