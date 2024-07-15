import mongoose, { Schema } from "mongoose";
import { refreshAccessToken } from "../controllers/user.controller";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
{timestamps:true}
)

export const Subscription = mongoose.model("Subscription",subscriptionSchema)