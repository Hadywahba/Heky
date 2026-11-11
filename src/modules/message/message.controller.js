import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { createMessage, getMessages } from "./message.service.js";
import * as validators from './message.validation.js'
import { authenticationMiddleware, optionalAuthenticationMiddleware, saveMessageFiles, UploadMiddleware, validation } from "../../middleware/index.js";
import { localFileUpload } from "../../common/utils/multer/index.js";

const router = Router();

// Add message
router.post('/',
    optionalAuthenticationMiddleware(),
    UploadMiddleware({
        multerFn: localFileUpload().any("attachments", 3),
        customPath: 'message',
        validation: ['images'],
        isRequired: false,
        saveFiles: false
    }), validation(validators.messageSchema), saveMessageFiles, async (req, res) => {
        console.log(req.files)
        const data = await createMessage(req.validate.body, req.files, req.user, req.language)

        return successResponse({ res, status: 201, message: "Message added Successfully", data })
    })

// Get Messages
router.get('/',
    authenticationMiddleware(),
    validation(validators.ShowmessageSchema),
    async (req, res) => {
        const data = await getMessages(req.validate.query, req.user)
        const message = req.validate.query.search && !data.messages.length
            ? 'No messages found matching your search'
            : 'Messages fetched successfully';
        return successResponse({ res, status: 200, data, message })
    })


export default router;



