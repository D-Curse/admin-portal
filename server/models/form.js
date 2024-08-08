const mongoose = require('mongoose')

const formSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            unique : true,
        },
        age : {
            type : Number,
            required : true,
            unique: false,
        },
        gender: {
            type: String,
            required: true,
        }
    },
    {
        timestamp : true
    }
)

const Form = mongoose.model("form", formSchema)
module.exports = Form