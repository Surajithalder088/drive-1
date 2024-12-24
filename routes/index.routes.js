const express=require("express");
const axios=require("axios");
const router=express.Router();
const fs=require("fs").promises;
const https = require('https')
const  cloudinary =require('cloudinary').v2;
const upload=require("../middlewares/multer.middleware");
const cloudinaryUploader=require("../utils/cloudinary")
const File=require('../models/file.model')
const authenticate=require("../middlewares/authenticated")
const supabase =require("../utils/supabaseClient")

  // Configuration
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});



router.post('/upload-file',authenticate,upload.single('file'),async(req,res)=>{
    try{
            const localfile=req.file.path;
            const fileExtension = localfile.split('.').pop()
//-----------------------------------------------------------------------------------
            if(fileExtension==='pdf'){
                console.log("this is pdf");
                    /// as file is pdf so it will be stored on supabase instead of cloudinary
                   const time=Date.now()
                    const uniqueFilename=`${time}_${localfile}`
                    const {data,error}=await supabase.storage.from('drive-1').upload(
                    uniqueFilename,
                    localfile.buffer,
                    {
                      upsert:true
                    })
                    if(error){
                        return res.status(500).json({
                            message:"failed to upload on supabase",
                            error
                        })
                    }
                    if(data){
                        const newfile=File.create({
                            filepath:data.fullPath,
                            file_public_id:data.id,
                            filename:localfile,
                            fileowner:req.user.userId
                        })
                        if(!newfile){
                            return res.status(400).json({
                            
                                massage:"failed to uploaded om database",
                                err
                            })
                        }
                      
                    return res.status(200).json({
                       data, newfile,
                    })
                   
                }
            }
              
            
   //----------------------------------------------------------------------         
            
            const response=await cloudinaryUploader(localfile);
 
        const newfile=File.create({
            filepath:response.url,
            file_public_id:response.public_id,
            filename:localfile,
            fileowner:req.user.userId
        })
       
        if(!newfile){
            return res.status(400).json({
            
                massage:"failed to uploaded om database",
                err
            })
        }
    res.status(200).json({
        massage:"file uploaded",
        path:response
    })
    
    
    }catch(err){
        res.status(500).json({
            
            massage:"failed to uploaded",
            err
        })
    }
  
})

router.get("/download-file",authenticate,async(req,res)=>{
    try {
        console.log(req.query.id);

        const fileUrl=req.query.url;
        if(!fileUrl){
            return res.status(400).json({message:'file url required'})
        }
        const encodedUrl=encodeURI(fileUrl);

//-----------------------------------------------------------
const fileExtension = encodedUrl.split('.').pop(); //checking pdf or not

if (fileExtension === 'pdf'){
     console.log("this is pdf");
    console.log(encodedUrl);
    
     const {data,error}=await supabase.storage.from('drive-1').download(encodedUrl);
     if(error){
        console.log(error);
        
        return res.status(400).json({message:"failed to download from supabase",error})
     }
     res.setHeader('Content-Disposition',`attatchment;filename=${encodedUrl}`);
     res.setHeader('Content-Type','application/octet-stream');
     data.pipe(res);
  
    return res.status(200).json({sorry:'pdf files are not support to download'})

   
}
    
  //-----------------------------------------------------------------
        const response=await axios({  //fetch the file from cloudinary
            method:'GET',
            url:encodedUrl,
            responseType:'arraybuffer',
            headers:{
                Accept:'*/*'  //accept all type data
            },
            auth:{
                username:process.env.CLOUDINARY_API_KEY,
                password:process.env.CLOUDINARY_API_SECRET,
            },
            //get the file as stream
        })
        if(!response){
            return res.status(400).json({massage:'faild to fetch file'})
        }
        const contentType=response.headers['content-type']||'application/octet-stream';
        res.setHeader('Content-Type',contentType);
        res.setHeader('Content-Disposition','attachment')
       res.send(response.data);

    } catch (error) {

        if(error.response && error.response.status===404){
            res.status(404).json({
                massage:"file not found on cloudinary"
            })
        }
        res.status(500).json({
            message:"unable to download totally failed",
            error:error
        })
        
    }
})

router.get("/delete-file",authenticate,async(req,res)=>{
    const public_id=req.query.id;
    console.log(req.query.id);
    
    if(!public_id){
        return res.status(400).json({
            message:"public id is required"
        })
    }
    try {
       const result= await cloudinary.uploader.destroy(
            public_id,{
                resource_type:'raw'
            } );


            if(result.result =='ok'){

                const file= await File.deleteOne({file_public_id:public_id})
                if(file){
                    return res.status(200).json({
                    message:"file deleted successfully",
                    result
                })
                }
            }

    } catch (error) {
        res.status(500).json({
            message:"error to delete file",
            error
        })
    }
})

module.exports=router;