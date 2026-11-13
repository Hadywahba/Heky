import { Router } from "express";
import { authenticationMiddleware, saveMessageFiles, UploadMiddleware, validation } from "../../middleware/index.js";
import { successResponse } from "../../common/utils/index.js";
import { createMessageConversation, showAllConversation, showConversation, showConversationMessages } from "./conversations.service.js";
import * as validators from './conversations.validation.js'
import { localFileUpload } from "../../common/utils/multer/index.js";
const router = Router();


// Get conversation

router.get('/', authenticationMiddleware(),
    async (req, res) => {

        const data = await showAllConversation(req.user)

        return successResponse({
            res,
            status: 200,
            message: "Conversations fetched successfully",
            data
        });
    })

// Get conversation
router.get('/:conversationId', authenticationMiddleware(),
    validation(validators.conversationSchema),
    async (req, res) => {

        const data = await showConversation(req.validate.params, req.user)

        return successResponse({
            res,
            status: 200,
            message: "show conversation successfully",
            data
        });
    })

// Get conversation
router.get('/:conversationId/messages', authenticationMiddleware(),
    validation(validators.conversationSchema),
    async (req, res) => {

        const data = await showConversationMessages(req.validate.params, req.user)

        return successResponse({
            res,
            status: 200,
            message: "Conversation messages fetched successfully",
            data
        });
    })

// Add message
router.post('/',
    authenticationMiddleware(),
    UploadMiddleware({
        multerFn: localFileUpload().any("attachments", 3),
        customPath: 'message',
        validation: ['images'],
        isRequired: false,
        saveFiles: false
    }), validation(validators.messageConversationSchema), saveMessageFiles, async (req, res) => {
        const data = await createMessageConversation(req.validate.body, req.files, req.user, req.language)

        return successResponse({ res, status: 201, message: "Message added Successfully", data })
    })

export default router;