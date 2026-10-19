import { Router } from "express";
import { login, rotateToken, signUp, signUpWithGamail, signUpWithGithub } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
import { authenticationMiddleware } from "../../middleware/index.js";
import { TokenTypeEnum } from "../../common/enum/index.js";
import passport from "passport";

const router = Router();

// Sign up
router.post('/signup', async (req, res, next) => {
   const data = await signUp(req.body)
   return successResponse({ res, status: 201, data })
})

// Sign up With Google            change url from frontend
router.post('/signupgggggggggg', async (req, res, next) => {
   const { status, data } = await signUpWithGamail(req.body, `${req.protocol}://${req.host}`)
   return successResponse({ res, status, data })
})

// Sign up with GitHub
router.get(
   "/github",
   passport.authenticate("github", {
      scope: ["user:email"],
      session: false,
   })
);

// GitHub Callback
router.get(
   "/github/callback",
   passport.authenticate("github", {
      session: false,
   }),
   async (req, res, next) => {
      try {
         const { status, data } = await signUpWithGithub(
            req.user,
            `${req.protocol}://${req.get("host")}`
         );

         return successResponse({ res, status, data });
      } catch (error) {
         next(error);
      }
   }
);


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