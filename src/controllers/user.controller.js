import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtokensonWebToken"

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
        // throw error
    }
}

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

const loginUser = asyncHandler(async (req,res)=>{
    // get data from req
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send secure cookies
    // send response

    const {email,username,password} = req.body
    if (!(username || email)) {
        throw new ApiError(400,"email or username is required for logging in .....")
    }

    const user = await User.findOne({$or: [{email},{username}]})

    if (!user) {
        throw new ApiError(404,"User does not exist !!")
    }

    const isPasswordValid = await user.passwordCheck(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"Wrong password !")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(
        new apiResponse(
            200,
            {
                user: loggedUser,accessToken,refreshToken
            },
            "User logged in successfuly........"
        )
    )
})

// how to log out a user (while logging out we can't tell the user to enter email or username (why ?))
// middleware " jane se phle mujse milkar jana :-) "

const logoutUser = asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    // used unset instead of set because refresh was not updating value while using set operator

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User logged out !"))
})


const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorixed request !")
    }

    try {
        const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        // we have put ._id while creating refresh token (refer generateRefreshToken method in user model) so decoded token will contain it also
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Invalid or expired refresh token")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res(200).
        cookie("accessToken",accessToken,options).
        cookie("refreshToken",newRefreshToken,options).
        json(
            new apiResponse(200,
                {"accessToken":accessToken,
                "refreshToken":newRefreshToken},
                "Access token refreshed....."
            )
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "Invalid refresh token ")
    }



})
export { registerUser,loginUser,logoutUser,refreshAccessToken }