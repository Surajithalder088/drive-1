const express=require("express");
const router=express.Router();
const {body,validationResult}=require("express-validator")
const bcrypt=require('bcrypt')
const jwt=require("jsonwebtoken")

const User=require("../models/user.model")
const File=require('../models/file.model')
const authenticate=require("../middlewares/authenticated")

router.get("/register",(req,res)=>{
    res.render("register");
})
router.get("/login",(req,res)=>{
    res.render("login");
})
router.get("/profile",authenticate,async(req,res)=>{
        const user=await User.findOne({_id:req.user.userId})
        if(!user){
            return res.status(404).json({
                message:"profile not found"
            })
        }
        
    res.render("profile",{
        person:user
    });
})
router.get("/home",authenticate,async(req,res)=>{
    const userFiles=await File.find({
        fileowner:req.user.userId
    })
    //console.log(userFiles)

    res.render("home",{
        files:userFiles
    })
})

router.post("/register",
    
   body('email').trim().isEmail(),
   body('fullname').trim().isLength({min:5}),
   body('password').trim().isLength({min:5}),

    async(req,res)=>{
        const error=validationResult(req);
      if(!error.isEmpty()){
     return res.send("invalid data")
    }
    const{fullname,email,password}=req.body;
    const existinguser=await User.findOne({email:email})
    if(existinguser){
        return res.status(400).send("user exist")
    }
    const hashpassword=await bcrypt.hash(password,10)
    const newuser= await User.create({fullname,email,password:hashpassword})
    res.redirect("login")
    console.log(newuser);
    
})

router.post("/login",
    body('email').trim().isEmail(),
    body('password').trim().isLength({min:5}),
    {userCredentials:true},
   async (req,res)=>{
    const error=validationResult(req);
      if(!error.isEmpty()){
     return res.send("invalid data format")
    }
    const {email,password}=req.body;
    const user=await User.findOne({email:email})
    if(!user){
        return res.status(400).send("Invalid credentials")
    }
    const ismatch=await bcrypt.compare(password,user.password);
    if(!ismatch){
        return res.status(400).send("Invalid credentials")
    }
    const token=jwt.sign({
        userId:user._id,
        email:user.email,
        fullname:user.fullname
    },process.env.JWT_SECRET)



    res.cookie("token",token,{httpOnly:true,secure:true});
   res.redirect("home")

})
router.post("/logout",authenticate,async(req,res)=>{
    const ress=res.cookie("token","")
        if(ress){
            return res.status(200).json({
                message:"logged out"
            })
        }
})

module.exports=router;