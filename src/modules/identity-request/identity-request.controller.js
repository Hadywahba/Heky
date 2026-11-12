import { Router } from "express";
import * as validators from './identity-request.validation.js'
import { createIdentityRequest, respondIdentityRequest, showIdentity, showRequest } from "./identity-request.service.js";
import { authenticationMiddleware, validation } from "../../middleware/index.js";
import { successResponse } from "../../common/utils/success.response.js";

const router = Router();


router.post('/:messageId',
    authenticationMiddleware(),
    validation(validators.identityRequestSchema),
    async (req, res) => {
        const data = await createIdentityRequest(
            req.validate.params.messageId,
            req.user
        );
        return successResponse({
            res,
            status: 201,
            message: "Identity request created successfully",
            data
        });
    })

router.get('/:requestId',
    authenticationMiddleware(),
    validation(validators.requestSchema),
    async (req, res) => {
        const data = await showRequest(
            req.validate.params.requestId,
            req.user
        );
        return successResponse({
            res,
            status: 200,
            message: "Identity request retrieved successfully",
            data
        });
    })

router.get('/identity-details/:requestId',
    authenticationMiddleware(),
    validation(validators.requestSchema),
    async (req, res) => {
        const data = await showIdentity(
            req.validate.params.requestId,
            req.user
        );
        return successResponse({
            res,
            status: 200,
            message: "Identity request details retrieved successfully",
            data
        });
    })

router.patch('/:requestId',
    authenticationMiddleware(),
    validation(validators.respondIdentityRequestSchema),
    async (req, res) => {
        const data = await respondIdentityRequest(
            req.validate.params.requestId,
            req.validate.body.status,
            req.user
        );

        return successResponse({
            res,
            status: 200,
            message: "Identity request updated successfully",
            data
        });
    })

export default router;