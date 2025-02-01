const mongoose= require('mongoose')
var bcrypt = require('bcrypt');

const userSchema= mongoose.Schema({
     Name:{
        type:String,
      
        required:true
     },
     Phone:{
        type:Number,
      
        require:true
     },
     Email:{
        type:String,
    
        required:true
     },
     Password:{
        type: String,
        required:true
     },
     role: {
      type: Number,
      default: 0,
  },


})
userSchema.pre("save",function(next){
   if(!this.isModified("Password")){
      return next();
   }
   this.Password = bcrypt.hashSync(this.Password,10);
   next();
});
userSchema.methods.comparePassword =  function(plaintext,callback){
   return callback(null,bcrypt.compareSync(plaintext,this.Password))
};
const userModel = mongoose.model('user',userSchema)
module.exports= userModel