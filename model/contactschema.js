const mongoose= require('mongoose')
const contactSchema = mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
   Email:{
    type:String,
    required:true
   },
   Number:{
    type: Number,
    required:true
   },
   Message:{
    type: String,
    required: true
    
    
   }
})
const contactModel = mongoose.model('contact',contactSchema)
module.exports= contactModel