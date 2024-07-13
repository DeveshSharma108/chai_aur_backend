import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        
        if (!localFilePath) {
            return null
        }

        // upload file on cloudinary 
        const uploadResult = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })

        console.log("File uploaded successfuly .....");
        //console.log(uploadResult);
        console.log(uploadResult.url);
        fs.unlinkSync(localFilePath)  // delete the file after successful upload of the file to cloud
        return uploadResult;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export { uploadOnCloudinary }
