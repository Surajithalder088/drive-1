const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    fullname:{
        type:String,
        reqired:true,
        trim:true
    },
    email:{
        type:String,
        reqired:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        reqired:true,
        trim:true
    }

})
const user=mongoose.model('user',userSchema)
module.exports=user