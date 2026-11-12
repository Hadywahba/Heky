import mongoose from "mongoose";

const identityRequestSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: true,
        unique: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true,
    collection: "IdentityRequests"
});

export const IdentityRequestModel =
    mongoose.models.IdentityRequest ||
    mongoose.model("IdentityRequest", identityRequestSchema);