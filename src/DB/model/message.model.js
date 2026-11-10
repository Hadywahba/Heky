import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: function () {
            return this.attachment?.length ? false : true;
        },
        minlength: [2, 'FirstName must be at least 2 characters'],
        maxlength: [50000, 'FirstName must not exceed 50000 characters'],
    },

    attachments: {
        type: [String]
    },

    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },

    receiverId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    }


}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
    collection: 'Messages'
})


export const MessageModel = mongoose.models.Message || mongoose.model("Message", messageSchema)
