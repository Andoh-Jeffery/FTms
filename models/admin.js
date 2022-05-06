const mongoose=require('mongoose');
const schema=mongoose.Schema;
const adminSchema=new schema({
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model('Admin',adminSchema);