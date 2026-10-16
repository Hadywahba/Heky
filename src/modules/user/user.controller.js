import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUser, editUser, showAllUsers, showUser } from "./user.service.js";
import { authenticationMiddleware } from "../../middleware/index.js";

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
router.patch('/:userid', async (req, res) => {
    const data = await editUser(req.params, req.body)
    return successResponse({ res, status: 200, data, message: "Edit  User Successfully" })
})

// delete user
router.delete('/:userid', async (req, res) => {
    const data = await deleteUser(req.params)
    return successResponse({ res, status: 200, message: "User Deleted Successfully" })
})

export default router;



