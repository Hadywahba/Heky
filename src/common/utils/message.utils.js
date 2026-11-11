
export const getOtherUser = (message, userId) => {
    return message.senderId._id.toString() === userId.toString()
        ? message.receiverId
        : message.senderId;
};
