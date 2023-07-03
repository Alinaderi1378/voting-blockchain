const Joi=require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const validatevoter=(data)=>{
    const schema=Joi.object({
        phone:Joi.string().required(),
        natinalId:Joi.string().required(),
        isvote:Joi.boolean().required().default(false),
        candidateId:Joi.number().required().default(0)


    });
    return schema.validate(data);
}

const validateUpdateVoter = (data) => {
    const schema = Joi.object({
        phone: Joi.string().required(),
        natinalId: Joi.string().required(),
        isvote: Joi.boolean().required().default(false)
    });
    return schema.validate(data);
}
const validatecandidate=(data)=>{
    const schema=Joi.object({
        name:Joi.string().required(),
        votecount:Joi.number().required().default(0),
        pic:Joi.string().required()


    });
    return schema.validate(data);
}



module.exports={validatevoter,validatecandidate,validateUpdateVoter}