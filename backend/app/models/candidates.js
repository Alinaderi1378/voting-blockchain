const mongoose = require("mongoose");
const candidates=mongoose.Schema({
    name:{type:String , required:true},
    votecount:{type:Number , required:true,default:0},
    id_:{type:Number , required:true},
    pic:{type:String , required:true}
});
const model=mongoose.model("candidates",candidates);
module.exports=model;
