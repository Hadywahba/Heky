import mongoose from "mongoose";

export const ConvertToObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
}