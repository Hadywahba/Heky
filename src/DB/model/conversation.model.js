import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        required: true,
        validate: {
            validator: value => value.length === 2 &&
                value[0].toString() !== value[1].toString(),
            message: "Conversation must have exactly two different participants"
        }
    },
    participantKey: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    messages: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }],
        default: []
    }
}, {
    timestamps: true,
    collection: "Conversations"
});

export const ConversationModel =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", conversationSchema);