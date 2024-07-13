import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    // get user details from frontend,postman etc..
    // validate the details 
    // check if user already exist
    // check for images (avatar file is required)
    // upload files on cloudinary
    // unlink files (delete from our server)
    // create user object (create entry in DB)
    // remove password and refresh token field from response
    // check if user is created
    // return result

    const {username,email,fullName,password} = req.body
    // console.log("email :",email)

    // if (fullName === "") {
    //     throw new ApiError(400,"Full Name can't be empty")
    // }

    if ([username,email,fullName,password].some((field)=>{
        field?.trim() === ""
    })) {
        throw new ApiError(400,"all fields are required")
    } 

    // User model can talk to mongoDB

    const existingUser = await User.findOne({
        $or: [{username},{email}]
    })

    // file is being uploaded by multer in-case of existing user also we need to unlink the files in-case of existing user

    if (existingUser) {
        throw new ApiError(409,"User already exist !!")
    }

    // console.log(req.files)
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // was giving error when coverImage is not uploaded

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar is require for user profile ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500,"Couldn't upload avatar file to server ..... Please try again later !!")
    }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-passwoed -refreshToken")
    if (!createdUser) {
        throw new ApiError(500,"Issue while creating the new user ")
    }

    return res.status(201).json(
        new apiResponse(200,createdUser,"User registered successfully :-) ")
    )



})

export { registerUser }