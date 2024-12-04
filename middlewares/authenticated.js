const jwt =require("jsonwebtoken")


const auth=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:'Unauthorized'
        })
    }
    try {
        const decoded=await jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        return next();

    } catch (error) {
        return res.status(401).json({
            massage:'Unauthorized',
            error
    })
    }

}

module.exports=auth;