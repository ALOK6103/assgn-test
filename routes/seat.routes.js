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
    
    // Find available seats in one row
    const availableSeatsInOneRow = await seatModel.find({
      isBooked: false,
      seatNumber: { $lt: 8 },
    })
      .sort({ row: 1, seatNumber: 1 })
      .limit(numSeats);

    if (availableSeatsInOneRow.length >= numSeats) {
      // Reserve seats in one row
      availableSeatsInOneRow.forEach(async (seat) => {
        seat.isBooked = true;
        await seat.save();
      });
      return res.json({ message: 'Seats reserved successfully' });
    } else {
      // Find available seats in nearby rows
      const lastReservedRow = await seatModel.findOne({ isBooked: true }).sort({ row: -1 });
      const nextRow = lastReservedRow ? lastReservedRow.row + 1 : 1;

      const availableSeatsNearby = await seatModel.find({
        isBooked: false,
        row: nextRow,
      })
        .sort({ seatNumber: 1 })
        .limit(numSeats);

      if (availableSeatsNearby.length < numSeats || numSeats>7) {
        return res.status(400).json({ error: 'Not enough available seats' });
      }

      // Reserve seats in nearby rows
      availableSeatsNearby.forEach(async (seat) => {
        seat.isBooked = true;
        await seat.save();
      });

      return res.json({ message: 'Seats reserved successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
})

module.exports={
  seatRouter
}



