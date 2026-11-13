import { BadRequestException, ForbiddenException, NotFoundException } from "../../common/exceptions/index.js";
import { createOne, findById, findByIdAndUpdate, findOne } from "../../common/repository/index.js";
import { MessageModel, IdentityRequestModel, ConversationModel, ConversationMessageModel } from "../../DB/model/index.js";


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

// Respond Identity Request
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

    if (status === "accepted") {

        // Get Original Message
        const originalMessage = await findById({
            model: MessageModel,
            id: identityRequest.messageId
        });

        // Reveal Sender Identity
        await findByIdAndUpdate({
            model: MessageModel,
            id: identityRequest.messageId,
            update: { isAnonymous: false }
        });

        // Generate Participants Key
        const participants = [
            identityRequest.senderId,
            identityRequest.receiverId
        ].sort((a, b) =>
            a.toString().localeCompare(b.toString())
        );

        const participantKey = participants
            .map(id => id.toString())
            .join("_");

        // Find Or Create Conversation
        let conversation = await findOne({
            model: ConversationModel,
            filter: { participantKey }
        });

        if (!conversation) {
            conversation = await createOne({
                model: ConversationModel,
                data: {
                    participants,
                    participantKey,
                    status: "accepted",
                    messages: []
                }
            });
        }

        // Check If Original Message Already Copied
        const existingConversationMessage = await findOne({
            model: ConversationMessageModel,
            filter: {
                sourceMessageId: originalMessage._id
            }
        });

        // Copy Original Message To Conversation
        if (!existingConversationMessage) {
            await createOne({
                model: ConversationMessageModel,
                data: {
                    conversationId: conversation._id,
                    senderId: originalMessage.senderId,
                    content: originalMessage.content,
                    attachments: originalMessage.attachments,
                    sourceMessageId: originalMessage._id
                }
            });
        }
    }

    return {
        request: updatedRequest,
    };
};


