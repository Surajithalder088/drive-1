const mongoose=require("mongoose");

const fileSchema=new mongoose.Schema({
    filename:{
        type:String,
        required:true
    },
    filepath:{
        type:String,
        required:true
    },
    file_public_id:{
        type:String,
        required:true
    },
    fileowner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
})

const file=mongoose.model('file',fileSchema);
module.exports=file;