import { BadRequestException, ForbiddenException, NotFoundException } from "../../common/exceptions/index.js";
import { createOne, findById, findByIdAndUpdate, findOne } from "../../common/repository/index.js";
import { MessageModel, IdentityRequestModel } from "../../DB/model/index.js";


export const createIdentityRequest = async (messageId, user) => {

    const message = await findById({
        model: MessageModel,
        id: messageId
    });

    if (!message) {
        NotFoundException({
            message: "Message not found"
        });
    }

    if (!message.isAnonymous) {
        BadRequestException({
            message: "Sender identity is already visible"
        });
    }

    if (!message.receiverId.equals(user._id)) {
        ForbiddenException({
            message: "You are not allowed to request this identity"
        });
    }

    if (!message.senderId) {
        BadRequestException({
            message: "Cannot request identity for anonymous guest messages"
        });
    }
    const existingRequest = await findOne({
        model: IdentityRequestModel,
        filter: { messageId }
    });

    if (existingRequest) {
        BadRequestException({
            message: "Identity request already exists"
        });
    }
    const identityRequest = await createOne({
        model: IdentityRequestModel,
        data: {
            messageId,
            senderId: message.senderId,
            receiverId: message.receiverId
        }
    });

    return identityRequest;
};

export const showRequest = async (requestId, user) => {

    const existingRequest = await findOne({
        model: IdentityRequestModel,
        filter: {
            _id: requestId,
            $or: [
                { receiverId: user._id },
                { senderId: user._id }
            ]
        }
    });

    if (!existingRequest) {
        NotFoundException({
            message: "Identity request not found"
        });
    }

    return existingRequest;
};

export const respondIdentityRequest = async (requestId, status, user) => {

    const identityRequest = await findById({
        model: IdentityRequestModel,
        id: requestId
    });

    if (!identityRequest) {
        NotFoundException({
            message: "Identity request not found"
        });
    }

    if (!identityRequest.senderId.equals(user._id)) {
        ForbiddenException({
            message: "You are not allowed to respond to this request"
        });
    }

    if (identityRequest.status !== "pending") {
        BadRequestException({
            message: "Identity request already responded"
        });
    }

    const updatedRequest = await findByIdAndUpdate({
        model: IdentityRequestModel,
        id: requestId,
        update: { status },
        options: {
            populate: {
                path: "senderId",
                select: "firstName lastName image DOB"
            }
        }
    });

    if (updatedRequest.status === "accepted") {
        await findByIdAndUpdate({
            model: MessageModel,
            id: identityRequest.messageId,
            update: { isAnonymous: false }
        });
    }

    return {
        request: updatedRequest,
        sender: status === "accepted" ? updatedRequest.senderId : null
    };
};

export const showIdentity = async (requestId, user) => {

    const existingRequest = await findOne({
        model: IdentityRequestModel,
        filter: {
            _id: requestId,
            $or: [
                { receiverId: user._id },
                { senderId: user._id }
            ],

        },
        options: {
            populate: [
                {
                    path: 'senderId',
                    select: 'firstName lastName image DOB'
                },
                {
                    path: 'messageId',
                    select: 'content isAnonymous'
                }
            ]
        }
    });

    if (!existingRequest) {
        NotFoundException({
            message: "Identity request not found"
        });
    }

    const requestData = existingRequest.toObject();

    if (existingRequest.status !== 'accepted') {
        delete requestData.senderId;
    }

    return requestData;
};