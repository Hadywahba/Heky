import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUser, editUser, showAllUsers, showUser } from "./user.service.js";
import { authenticationMiddleware, validation } from "../../middleware/index.js";
import * as validators from './user.validation.js'
import { localFileUpload, proccessMulterUpload } from "../../common/utils/multer/index.js";

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



router.patch('/profile-picture',
    authenticationMiddleware(),
    localFileUpload({ validation: ['images'], })
        .fields([{
            name: "cover",
            maxCount: 2
        }, {
            name: "attachment",
            maxCount: 1
        }]),
    // .single("attachment"),
    proccessMulterUpload({ customPath: 'user-images', validation: ['images'], }),
    async (req, res) => {
        if (req.files.attachment?.length) {
            req.user.image = req.files.attachment[0].finalPath;
        }

        if (req.files.cover?.length) {
            req.user.coverimage = req.files.cover.map(
                (file) => file.finalPath
            );
        }
        await req.user.save()
        return successResponse({ res, status: 200, data: { user: req.user } })
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
