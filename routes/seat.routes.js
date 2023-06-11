const express=require("express")

const seatRouter=express.Router()

const {seatModel}=require("../models/seat.model")

seatRouter.get('/', async (req, res) => {
    try {
      const seats = await seatModel.find();
      res.send({seats});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  seatRouter.post("/add",async(req,res)=>{

    try {
        await seatModel.create(req.body)
        res.send({msg:"seats created"})
    } catch (error) {
        res.send({msg:error})
    }
})

seatRouter.post("/reserve",async(req,res)=>{

  try {
    const numSeats = req.body.numSeats;
  
    if (numSeats > 7) {
      return res.status(400).json({ error: 'Maximum 7 seats can be booked at a time' });
    }
  
    const rows = await seatModel.distinct('row');
  
    let reservedSeats = [];
    let remainingSeats = numSeats;
  
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
  
      const unreservedSeatsInRow = await seatModel.countDocuments({
        row,
        isBooked: false,
      });
  
      if (unreservedSeatsInRow >= numSeats) {
        const availableSeatsInRow = await seatModel.find({
          row,
          isBooked: false,
        }).limit(numSeats);
  
        availableSeatsInRow.forEach(async (seat) => {
          seat.isBooked = true;
          await seat.save();
        });
  
        reservedSeats = reservedSeats.concat(availableSeatsInRow);
        break;
      } else if (unreservedSeatsInRow > 0) {
        const availableSeatsInRow = await seatModel.find({
          row,
          isBooked: false,
        });
  
        availableSeatsInRow.forEach(async (seat) => {
          seat.isBooked = true;
          await seat.save();
        });
  
        reservedSeats = reservedSeats.concat(availableSeatsInRow);
        remainingSeats -= availableSeatsInRow.length;
      }
    }
  
    if (reservedSeats.length === numSeats) {
      return res.json({ message: 'Seats reserved successfully', reservedSeats });
    } else {
      return res.status(400).json({ error: 'Not enough available seats' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports={
  seatRouter
}



