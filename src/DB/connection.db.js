import mongoose from "mongoose"
import { DB_URI } from "../config.js";
import { UserModel } from "./model/index.js";



export const bootstrapDB = async (app, port) => {
    try {

        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("DB Connected Successfully");
         await UserModel.syncIndexes();
        app.listen(port, () => console.log(`Example app listening on port ${port}!`))

    } catch (error) {

        console.log(error)
        console.log("Fail to connect on DB")

    }
}