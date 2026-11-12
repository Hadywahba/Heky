import { NotFoundException } from "../../common/exceptions/index.js";
import { createOne, find, findById, paginate } from "../../common/repository/index.js";
import { ConvertToObjectId, getOtherUser } from "../../common/utils/index.js";
import { IdentityRequestModel, MessageModel, UserModel } from "../../DB/model/index.js";

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