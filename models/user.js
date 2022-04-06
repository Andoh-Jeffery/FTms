const mongoose=require('mongoose');
// const { schema } = require('./admin');
const schema=mongoose.Schema;
const userSchema=new schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    programOfChoice:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    paymentMade:{
        type:String,
        default:''
    }

})

module.exports=mongoose.model('User',userSchema);