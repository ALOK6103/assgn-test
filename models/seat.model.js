const mongoose=require("mongoose")

const seatSchema=mongoose.Schema(
    {
        row: Number,
        seatNumber: Number,
        isBooked: Boolean,
    },{
        versionKey:false
    }
)
const seatModel=mongoose.model("seats",seatSchema)
module.exports={
    seatModel
}


