const express=require("express")
const {connection}=require("./db")

require("dotenv").config()
const cors=require("cors")
const { seatRouter } = require("./routes/seat.routes")
const app=express()
app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.send("Home Page")
})

app.use("/seat",seatRouter)

app.listen(process.env.Port,async()=>{
    try {
        await connection 
        console.log("conneted")
    } catch (error) {
        console.log(error)
    }
})