// Get Conversation

import { ForbiddenException, NotFoundException } from "../../common/exceptions/index.js";
import { createOne, find, findById, findByIdAndUpdate } from "../../common/repository/index.js";
import { ConvertToObjectId } from "../../common/utils/index.js";
import { ConversationMessageModel, ConversationModel } from "../../DB/model/index.js";

// Show Conversation
export const showConversation = async ({ conversationId }, user) => {
    const conversation = await findById({
        model: ConversationModel,
        id: conversationId,
        options: {
            populate: {
                path: 'participants',
                select: 'firstName lastName image DOB'
            }
        }
    });

    if (!conversation) {
        NotFoundException({
            message: "Conversation not found"
        });
    }

    const isParticipant = conversation.participants.some(
        participant => participant._id.equals(user._id)
    );

    if (!isParticipant) {
        ForbiddenException({
            message: "You are not allowed to access this conversation"
        });
    }

    const otherUser = conversation.participants.find(
        participant => !participant._id.equals(user._id)
    );

    const conversationData = conversation.toObject();

    delete conversationData.participants;

    conversationData.otherUser = otherUser;

    return conversationData;
};

// Show All Conversations
export const showAllConversation = async (user) => {

    const conversations = await find({
        model: ConversationModel,
        filter: {
            participants: user._id
        },
        options: {
            sort: { updatedAt: -1 },
            populate: {
                path: 'participants',
                select: 'firstName lastName image DOB'
            }
        }
    });

    return conversations.map(conversation => {

        const otherUser = conversation.participants.find(
            participant => !participant._id.equals(user._id)
        );

        const conversationData = conversation.toObject();

        delete conversationData.participants;

        conversationData.otherUser = otherUser;

        return conversationData;
    });
};

// Show Conversation Messages
export const showConversationMessages = async ({ conversationId }, user) => {


    const conversation = await findById({
        model: ConversationModel,
        id: conversationId,
        options: {
            populate: {
                path: "participants",
                select: "firstName lastName image DOB"
            }
        }
    });

    if (!conversation) {
        NotFoundException({
            message: "Conversation not found"
        });
    }


    const isParticipant = conversation.participants.some(
        participant => participant.equals(user._id)
    );

    if (!isParticipant) {
        ForbiddenException({
            message: "You are not allowed to access this conversation"
        });
    }
    const otherUser = conversation.participants.find(
        participant => !participant._id.equals(user._id)
    );
    // Get Conversation Messages
    const messages = await find({
        model: ConversationMessageModel,
        filter: { conversationId },
        options: {
            sort: { createdAt: 1 },
            populate: {
                path: "senderId",
                select: "firstName lastName image DOB"
            }
        }
    });

    return {
        otherUser,
        messages
    };
};

// Add message
export const createMessageConversation = async ({ content, conversationId } = {}, files = [], user) => {
    const conversation = await findById({
        model: ConversationModel,
        id: ConvertToObjectId(conversationId),
    })

    if (!conversation) {
        NotFoundException({
            message: "Conversation not found"
        });
    }

    // Check User Permission
    const isParticipant = conversation.participants.some(
        participant => participant.equals(user._id)
    );

    if (!isParticipant) {
        ForbiddenException({
            message: "You are not allowed to send messages in this conversation"
        });
    }

    const message = await createOne({
        model: ConversationMessageModel,
        data: {
            conversationId,
            content,
            attachments: files.map(ele => ele.path),
            senderId: user._id,
        }
    })

    await findByIdAndUpdate({
        model: ConversationModel,
        id: conversationId,
        update: {
            $set: { updatedAt: new Date() }
        }
    });
    return message;
}
