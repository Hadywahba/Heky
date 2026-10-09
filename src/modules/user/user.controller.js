import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { editUser, showAllUsers, showUser } from "./user.service.js";

const router =Router();

// get all users
router.get('/',async (req, res, next) => {
    const data = await showAllUsers()
   return successResponse({res , status:200 , data , message:"Fetch All Users"})
})

// get user
router.get('/:userid',async (req, res, next) => {
    const data = await showUser(req.params)
   return successResponse({res , status:200 , data , message:"Fetch  User"})
})

// edit user
router.patch('/:userid',async (req, res, next) => {
    const data = await editUser(req.params , req.body)
   return successResponse({res , status:200 , data , message:"Edit  User Successfully"})
})

export default router;



