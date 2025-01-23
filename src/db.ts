import mongoose, { model, mongo }  from "mongoose";
const Schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;
const Model = mongoose.model;


const userSchema = new Schema({
  username: String,
  password : String,
})

const contentSchema = new Schema({
  link:String,
  type: String,
  title: String,
  tags: [{type:objectId,ref:'Tags'}],
  userId : {type:objectId,ref:'Users'}
})

const TagsSchema = new Schema({
  userId: objectId,
  tag: String
})

const LinkSchema = new Schema({
  link:String,
  userId:{type:objectId,ref:'Users', required: true, unique:true},
})


const UsersModel =  Model('Users',userSchema);
const contenModel = Model('Contents',contentSchema);
const linkModel = Model('links',LinkSchema);


export {UsersModel as Users, contenModel as Contents, linkModel as Links};