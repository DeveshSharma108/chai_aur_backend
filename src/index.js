// require('dotenv').config({path: './env'})   will work but disturbs code consistency

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config(
    {path: './env'}
)

connectDB().
then(()=>{
    try {
        app.listen(process.env.PORT || 8000,()=>{
            console.log("App is running on port ",process.env.PORT || 8000)
        })
    } catch (error) {
        console.log("Error related to app",error)
        throw error
    }
}).
catch((error)=>{
    console.log("Error while connecting to the MongoDB database")
    console.log(error)
})










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