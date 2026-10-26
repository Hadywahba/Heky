import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUser, editUser, showAllUsers, showUser } from "./user.service.js";
import { authenticationMiddleware, validation } from "../../middleware/index.js";
import * as validators from './user.validation.js'

const router = Router();

// get all users
router.get('/', async (req, res) => {
    const data = await showAllUsers()
    return successResponse({ res, status: 200, data, message: "Fetch All Users" })
})

// get user
router.get('/profile', authenticationMiddleware(), async (req, res) => {
    const data = await showUser(req.user)
    return successResponse({ res, status: 200, data, message: "Fetch  User" })
})

// edit user
router.patch('/account', authenticationMiddleware(), validation(validators.userSchema), async (req, res) => {
    const data = await editUser(req.user, req.validate.body, req.language)
    return successResponse({ res, status: 200, data, message: "Edit  User Successfully" })
})

// delete user
router.delete('/account', authenticationMiddleware(), async (req, res) => {
    const data = await deleteUser(req.user)
    return successResponse({ res, status: 200, message: "User Deleted Successfully" })
})

export default router;



