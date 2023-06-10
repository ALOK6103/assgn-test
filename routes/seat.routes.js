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
    const availableSeats = await seatModel.find({isBooked: false })
      .sort({ row: 1, seatNumber: 1 })
      .limit(numSeats);

    if (availableSeats.length < numSeats) {
      return res.status(400).json({ error: 'Not enough available seats' });
    }

    // Reserve the seats
    availableSeats.forEach(async (seat) => {
      seat.isBooked = true;
      await seat.save();
    });

    res.send({ message: 'Seats booked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
})

module.exports={
  seatRouter
}


