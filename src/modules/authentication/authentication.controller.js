import { Router } from "express";
import { confirmEmail, forgotPassword, login, logOut, resetPassword, rotateToken, signUp, signUpWithGamail, signUpWithGithub } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
import { authenticationMiddleware, validation } from "../../middleware/index.js";
import { TokenTypeEnum } from "../../common/enum/index.js";
import passport from "passport";
import * as validators from './authentication.validation.js'


const router = Router();

// Sign up
router.post('/signup', validation(validators.signUp), async (req, res, next) => {
   const data = await signUp(req.validate.body, req.language)
   return successResponse({ res, status: 201, data, message: 'Confirmation email sent successfully. Please check your inbox.' })
})

// confirm-email
router.patch('/confirm-email', async (req, res, next) => {
   await confirmEmail(req.body)
   return successResponse({ res, status: 200, message: 'Your email has been successfully confirmed' })
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
router.post('/signin', validation(validators.login), async (req, res, next) => {
   const data = await login(req.validate.body, `${req.protocol}://${req.host}`)
   return successResponse({ res, status: 200, data })
})

// Forgot Password
router.patch('/forgot-password', async (req, res, next) => {
   await forgotPassword(req.body)
   return successResponse({ res, status: 200, message: 'Your OTP has been Sent successfully' })
})

// Reset Password
router.patch('/reset-password', async (req, res, next) => {
   await resetPassword(req.body)
   return successResponse({ res, status: 200, message: 'Your password has been reset successfully' })
})


// Rotate Token
router.post('/rotate-token',
   authenticationMiddleware(TokenTypeEnum.REFRESH),
   async (req, res, next) => {

      const data = await rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`)
      return successResponse({ res, status: 201, data })

   })

// Logout
router.post('/logout',
   authenticationMiddleware(),
   async (req, res, next) => {
      await logOut(req.payload, req.user, req.body)
      return successResponse({ res, status: 200, message: 'Logout successfully ' })

   })

export default router;