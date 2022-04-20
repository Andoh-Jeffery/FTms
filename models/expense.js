const mongoose=require('mongoose');
const schema=mongoose.Schema;
const expenseSchema=new schema({
    title:{
        type: String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    cost:{
        type:Number,
        require:true
    }
})
module.exports=mongoose.model("Expense",expenseSchema);