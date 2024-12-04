const  cloudinary =require('cloudinary').v2;
const fs =require('fs');





    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUDE_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, 
    });
    
  

    const uploadOnCloudinary=async(localFilePath)=>{
        try{
            if(!localFilePath){
                return null; }
                //upload file on cloudinary
               const response= await cloudinary.uploader.upload(localFilePath,{resource_type:"raw"})
                console.log("file is uploaded on cloudinary");
               
                if(response){
                    fs.unlinkSync(localFilePath);
                }
                 return response.url;
           
        }catch(err){
            fs.unlinkSync(localFilePath);//revome the local file as failed to upload
            return null;
        }
    }

    module.exports=uploadOnCloudinary;
    
    