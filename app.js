const express=require("express");
const dotenv=require("dotenv")
const cors=require("cors");
dotenv.config();
const userRouter=require('./routes/user.routes')
const indexRouter=require("./routes/index.routes")
const connectDB=require("./config/db")
const cookieParser=require("cookie-parser")

const app=express();
connectDB();

app.set("view engine" ,"ejs")
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/user',userRouter)
app.use('/',indexRouter)
app.get("/",(req,res)=>{
    res.render("index")
})



app.listen(process.env.PORT ||3000,()=>{
    console.log("running on 8000");
    
})