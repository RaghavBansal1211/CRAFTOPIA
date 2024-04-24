const { Schema } = require("mongoose");
const joi = require("joi");

module.exports.listingSchema = joi.object({
 
    title: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required().min(0),
    location: joi.string().required(),
    image:joi.string().allow("",null)
})



module.exports.reviewSchema=joi.object({
     rating:joi.number().required().min(1).max(5),
     review:joi.string().required()
    
})