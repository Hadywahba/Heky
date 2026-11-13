import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    attachments: {
        type: [String],
        default: []
    },
    sourceMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "ConversationMessages"
});

export const ConversationMessageModel =
    mongoose.models.ConversationMessage ||
    mongoose.model("ConversationMessage", conversationMessageSchema);