const mongoose=require("mongoose")

const seatSchema=mongoose.Schema(
    {
       
        seatNumber: Number,
        row: Number,
        isBooked: Boolean,
    },{
        versionKey:false
    }
)
const seatModel=mongoose.model("seats",seatSchema)
module.exports={
    seatModel
}


