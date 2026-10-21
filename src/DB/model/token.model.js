import mongoose from "mongoose";



const TokenSchema = new mongoose.Schema({

    jti: {
        type: String,
        required: true,
        unique: true
    },

    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },

    expiresIn: {
        type: Date,
        required: true
    }

}, {
    timestamps: true,
    collection: "Tokens",
})

// TTL =====> Time To Leave
TokenSchema.index("expiresIn", { expireAfterSeconds: 0 })





export const TokenModel = mongoose.models.Token || mongoose.model("Token", TokenSchema)