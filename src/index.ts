import express = require('express');
import {Express, NextFunction, Request, Response } from 'express'; 
import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');
import mongoose from 'mongoose';
import { Contents, Links, Users } from './db'; 
import GenerateLink from './utils';
import cors = require('cors');
const app:Express = express();
// @ts-ignore
app.use(cors());
app.use(express.json({ strict: false }));
mongoose.connect('mongodb+srv://Sumit:hdW2hmE1Tp9d3Gov@cluster0.wpjvi.mongodb.net/Second-Brain-App');

interface AuthRequest extends Request {
  username?: string;
}

function auth(req:Request,res:Response,next:NextFunction):void{
  const {token} = req.headers;
  if(!token){
    res.json({message:"Something went wrong"})
    return 
  }
  // @ts-ignore
  const decoded =  jwt.verify(token,"SecretKey");
  if(!decoded){
    res.json({message:"Something went wrong"})
    return
  }
 // @ts-ignore
  req.username = decoded.username;
  next()
}

app.post("/api/v1/Signup", async function(req:Request, res:Response): Promise<void> {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const user = await Users.findOne({ username });
    if (user) {
      res.status(409).json({ message: "User already exists" });
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 5);
    
    // Create new user
    const newUser = await Users.create({
      username,
      password: hashedPassword,
    });

    res.status(200).json({ message: "You are signed up", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

app.post("/api/v1/Login", async function (req: Request, res: Response):Promise<void> {
  try {
    const { username, password } = req.body;

    // Find the user
    const user = await Users.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "No such user exists" });
      return 
    }

    // Compare passwords
    const isMatch =  bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Wrong credentials" });
      return 
    }

    // Generate token
    const token = jwt.sign({ username }, "SecretKey", { expiresIn: '1h' });

    res.status(200).json({
      message: "You are logged in",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// app.use(auth);

app.post("/api/v1/Content",auth,async (req: Request, res: Response) => {
  try{
    const { link, title, type } = req.body;
    // @ts-ignore
    const username = req.username;
    const user = await Users.findOne({username});
    if(!user){
      res.json({message:"User not found"})
      return
    }
    const isExist =  await Contents.findOne({link,title,type});
    if(isExist){
      res.status(404).json({message:"Can not enter same entry again"});
      return;
    }
    const content = await Contents.create({
      link,
      title,
      type,
      tags: [],
      userId: user._id
    })
    
    res.status(200).json({ message: "Content added",link: content.link});
  }
  catch(err){
    res.json({message:"Something went wrong in catch function"});
    return 
  }
});

app.get("/api/v1/Content",auth, async (req,res) => {
  try{
    // @ts-ignore
    const username = req.username;
    const user = await Users.findOne({username});
    // @ts-ignore
    const content = await Contents.find({userId:user._id})
    if(content.length === 0){
      res.json({message:"No content found"});
      return
    }
    res.status(200).json({content });
    return
  }
  catch(err){
    res.send(err);
    return
  }
});

app.delete("/api/v1/Content",auth, async (req: Request, res: Response) => {
try{
  // @ts-ignore
  const username = req.username;
  const contentId = req.body.contentId;
  const user = await Users.findOne({username});
  const deleted = await Contents.deleteOne({userId:user._id,_id:contentId});
  // @ts-ignore
  if(deleted.length === 0){
    res.json({message:"No content found"})
    return
  }
  res.json({message:"Content deleted",deleted})
}
catch(err){
  res.json({error:err.message});  
  return
}
});

app.post("/api/v1/brain/share",auth,async function(req:Request, res: Response){
  try{
    const {share} = req.body;
   if(share){
      //@ts-ignore
      const user = await Users.findOne({username:req.username});
      // generate the link 
      let link = GenerateLink((Math.random()*10)+10 );
      // store it in the Link collection
      // @ts-ignore
      const Data = await Links.create({
        userId: user._id,
        link,
      });
  
      res.json({message:"Linked has been generated",link});
      return
   }
   else{
    //@ts-ignore
    const deleted = await Links.deleteOne({username:req.username});
    //@ts-ignore
    if(deleted.length === 0){
      res.status(200).json({message:"no link is being shared"})
    }
    res.status(200).json({message:"Stopped sharing your Link"});
   }
  }
  catch(err){
    res.json({error:err.message});
    return
  }
})

app.get("/api/v1/brain/:shareLink",auth, async function (req, res){
  try {
    const hashLink = req.params.shareLink;

    const link = await Links.findOne({ link: hashLink });
    if (!link) {
      res.status(404).json({ message: "Wrong input" });
      return
    }

    const user = await Users.findOne({ _id: link.userId });
    if (!user) {
      res.status(500).json({ message: "Something went wrong" });
      return
    }

    const content = await Contents.find({ userId: user._id });

    res.status(200).json({
      user: user.username,
      contents: content
    });

  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong"});
  }
});



app.listen(3000, () => {
  console.log("Server running on port 3000");
});
