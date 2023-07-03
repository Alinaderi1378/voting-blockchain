const mongoose = require("mongoose");
const vote=mongoose.Schema({
    voterId:{type:Number , required:true},
    candidateId:{type:Number , required:true},

});
const model=mongoose.model("vote",vote);
module.exports=model;
