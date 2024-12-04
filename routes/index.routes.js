const express=require("express");
const axios=require("axios");
const router=express.Router();
const upload=require("../middlewares/multer.middleware");
const cloudinaryUploader=require("../utils/cloudinary")
const File=require('../models/file.model')
const authenticate=require("../middlewares/authenticated")


router.get("/home",authenticate,async(req,res)=>{
    const userFiles=await File.find({
        fileowner:req.user.userId
    })
    //console.log(userFiles)

    res.render("home",{
        files:userFiles
    })
})

router.post('/upload-file',authenticate,upload.single('file'),async(req,res)=>{
    try{
            const localfile=req.file.path;
          const response=await cloudinaryUploader(localfile);
      
        const newfile=File.create({
            filepath:response,
            filename:localfile,
            fileowner:req.user.userId
        })
    res.status(200).json({
        massage:"file uploaded",
        path:response
    })
    
    
    }catch(err){
        res.status(400).json({
            
            massage:"failed to uploaded",
            err
        })
    }
  
})

router.get("/download-file",authenticate,async(req,res)=>{
    try {
        console.log(req.query.url);
        
        const fileUrl=req.query.url;
        if(!fileUrl){
            return res.status(400).json({message:'file url required'})
        }
        const encodedUrl=encodeURI(fileUrl);

        const response=await axios({  //fetch the file from cloudinary
            method:'GET',
            url:encodedUrl,
            responseType:'arraybuffer',
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
            message:"unable to download",
            error
        })
        
    }
})

module.exports=router;