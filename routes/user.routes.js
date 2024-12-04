const express=require("express");
const router=express.Router();
const {body,validationResult}=require("express-validator")
const bcrypt=require('bcrypt')
const jwt=require("jsonwebtoken")

const User=require("../models/user.model")

router.get("/register",(req,res)=>{
    res.render("register");
})
router.get("/login",(req,res)=>{
    res.render("login");
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



    res.cookie("token",token);
    res.send("logged in")

})
router.post("/logout",(req,res)=>{

})

module.exports=router;