import { NotFoundException } from "../../common/exceptions/index.js";
import { createOne, findById } from "../../common/repository/index.js";
import { ConvertToObjectId } from "../../common/utils/index.js";
import { MessageModel, UserModel } from "../../DB/model/index.js";

// Add message
export const createMessage = async ({ content, receiverId } = {}, files = []) => {
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
            attachments: files.map(ele => ele.path)
        }
    })
    return message;
}