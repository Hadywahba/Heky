import { ForbiddenException, NotFoundException } from "../../common/exceptions/index.js";
import { createOne, deleteOne, findById, paginate } from "../../common/repository/index.js";
import { ConvertToObjectId } from "../../common/utils/index.js";
import { MessageModel, UserModel } from "../../DB/model/index.js";

// Add message
export const createMessage = async ({ content, receiverId, isAnonymous } = {}, files = [], user = undefined) => {
    const checkRecevier = await findById({
        model: UserModel,
        id: ConvertToObjectId(receiverId),
    })

    if (!checkRecevier) {
        NotFoundException({
            message: 'Invalid Receiver Id',
        });
    }
    const message = await createOne({
        model: MessageModel,
        data: {
            receiverId,
            content,
            isAnonymous: user ? isAnonymous : true,
            attachments: files.map(ele => ele.path),
            ...(user ? { senderId: user._id } : {})
        }
    })
    return message;
}

// Show Messages
export const getMessages = async (
    { type = 'all', search, page, limit } = {},
    user
) => {
    let filter = {};

    if (type === 'receiver') {
        filter = { receiverId: user._id };
    } else if (type === 'sender') {
        filter = { senderId: user._id };
    } else {
        filter = {
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ]
        };
    }

    if (search) {
        filter.content = {
            $regex: search,
            $options: 'i'
        };
    }

    // Get messages
    const result = await paginate({
        model: MessageModel,
        filter,
        limit,
        page,
        options: {
            sort: { createdAt: -1 },
            populate: [
                {
                    path: 'senderId',
                    select: 'firstName lastName image DOB'
                },
                {
                    path: 'receiverId',
                    select: 'firstName lastName image DOB'
                }
            ]
        }
    });

    const messages = result.docs.map(message => {
        const senderId = message.senderId?._id?.toString();
        const receiverId = message.receiverId?._id?.toString();
        const currentUserId = user._id.toString();

        const isSender = senderId === currentUserId;
        const isReceiver = receiverId === currentUserId;

        const messageData = message.toObject();

        if (isSender) {
            delete messageData.senderId;
        } else if (message.isAnonymous) {
            delete messageData.senderId;
        }

        if (isReceiver) {
            delete messageData.receiverId;
        }

        return messageData;
    });

    return {
        metaData: result.metaData,
        messages
    };


};

// Show Message
export const getMessage = async ({ messageId }, user) => {

    const existMessage = await findById({
        model: MessageModel,
        id: messageId,
        options: {
            populate: [
                {
                    path: 'senderId',
                    select: 'firstName lastName image DOB'
                },
                {
                    path: 'receiverId',
                    select: 'firstName lastName image DOB'
                }
            ]
        }
    })

    if (!existMessage) {
        NotFoundException({
            message: "Message not found"
        });
    }

    const isSender = existMessage.senderId?.equals(user._id);
    const isReceiver = existMessage.receiverId.equals(user._id);

    if (!isSender && !isReceiver) {
        ForbiddenException({
            message: "You are not allowed to show to this message"
        });
    }

    const messageData = existMessage.toObject();

    if (isSender || (isReceiver && existMessage.isAnonymous)) {
        delete messageData.senderId;
    }

    if (isReceiver) {
        delete messageData.receiverId;
    }

    return messageData;

};

// Delete Message
export const deleteMessage = async ({ messageId }, user) => {

    const existMessage = await findById({
        model: MessageModel,
        id: messageId,
    })

    if (!existMessage) {
        NotFoundException({
            message: "Message not found"
        });
    }
    const isReceiver = existMessage.receiverId.equals(user._id);

    if (!isReceiver) {
        ForbiddenException({
            message: "You are not allowed to delete to this message"
        });
    }

    const data = await deleteOne({
        model: MessageModel,
        filter: {
            receiverId: user._id,
            _id: messageId
        }
    })

    if (!data.deletedCount) {
        NotFoundException({
            message: "Message not found"
        });
    }

    return data;

};