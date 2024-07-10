// require('dotenv').config({path: './env'})   will work but disturbs code consistency

import dotenv from "dotenv"
import connecDB from "./db/index.js";

dotenv.config(
    {path: './env'}
)

connecDB()










/*

import express from "express";
const app = express()

;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error related to app",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log("App is listening on port ",process.env.PORT)
        })
    } catch (error) {
        console.error("Error",error)
        throw error
    }
})()

*/