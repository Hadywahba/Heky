import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { createMessage } from "./message.service.js";
import * as validators from './message.validation.js'
import { saveMessageFiles, UploadMiddleware, validation } from "../../middleware/index.js";
import { localFileUpload } from "../../common/utils/multer/index.js";
const router = Router();

// Add message
router.post('/', UploadMiddleware({
    multerFn: localFileUpload().any("attachments", 3),
    customPath: 'message',
    validation: ['images'],
    isRequired: false,
    saveFiles: false
}), validation(validators.messageSchema), saveMessageFiles, async (req, res) => {
    console.log(req.files)
    const data = await createMessage(req.validate.body, req.files, req.language)

    return successResponse({ res, status: 201, message: "Message added Successfully", data })
})


export default router;



