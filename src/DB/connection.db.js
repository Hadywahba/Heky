import mongoose from "mongoose"
import { DB_URI } from "../config.js";
import { ConversationMessageModel, ConversationModel, IdentityRequestModel, MessageModel, UserModel } from "./model/index.js";
import { connectionRedis } from "./redis.connection.js";



export const bootstrapDB = async (app, port) => {
    try {

        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 });
        console.log("DB Connected Successfully");
        await connectionRedis()
        await UserModel.syncIndexes();
        await MessageModel.syncIndexes();
        await IdentityRequestModel.syncIndexes();
        await ConversationModel.syncIndexes();
        await ConversationMessageModel.syncIndexes();
        app.listen(port, () => console.log(`Example app listening on port ${port}!`))

    } catch (error) {

        console.log(error)
        console.log("Fail to connect on DB")

    }
}