const mongoose = require("mongoose");
const voter=mongoose.Schema({
    phone:{type:String , required:true},
    natinalId:{type:String , required:true},
    id_:{type:Number , required:true},
    isvote:{type:Boolean,required:true,default:false},
    candidateId:{type:Number , required:true,default: 0}
});
const model=mongoose.model("voter",voter);
module.exports=model;
