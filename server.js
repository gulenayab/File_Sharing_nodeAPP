require("dotenv").config()
const multer = require("multer");
const mongoose = require("mongoose");
const express = require('express');
const File = require("./models/file_model");
const file_model = require("./models/file_model");
const app = express();
app.use(express.urlencoded({extended:true}))
const upload = multer({dest: "uploads"});

mongoose.connect(process.env.DATABASE_URL)

   
app.set("view engine", "ejs");
app.get('/' , (req , res) => 
{
    res.render("index")
});

app.post("/upload" ,upload.single("file"), async(req , res)=>
{
    const fileData = {
        path: req.file.path,
        originalName:req.file.originalname,
    }
    if(req.body.password != null && req.body.password !== "")
    {
        fileData.password = req.body.password;
    }
    const file =  await File.create(fileData);
    res.render("index" , {fileLink: `${req.headers.origin}/file/${file.id}`})
    console.log(file);
    // res.send(file.originalName)
}) 
  
app.get("/file/:id"  , handleDownload );
app.post("/file/:id"  , handleDownload );


async function handleDownload(req , res){

    const file = await File.findById(req.params.id);

    if(file.password != null)
    {
        if(req.body.password == null)
        {
            res.render("password");
            return;
        }
    if(!(await(req.body.password , file.password)))
    {
        res.render("password" , {error: true});
        return;
    }
        
    }
    
    
       file.downloadCount++;
       await file.save();
       console.log(file.downloadCount);
       res.download(file.path , file.originalName);
    
    
}

app.listen(process.env.PORT);

 