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
      // Find available seats in each row
      const rows = await seatModel.distinct('row', { isBooked: false });

      let reservedSeats = [];
      let remainingSeats = numSeats;

      for (const row of rows) {
        const availableSeatsInRow = await seatModel.find({
          isBooked: false,
          row: row,
        })
          .sort({ seatNumber: 1 })
          .limit(remainingSeats);

        const availableSeatsCount = availableSeatsInRow.length;
        if (availableSeatsCount >= remainingSeats) {
          reservedSeats = reservedSeats.concat(availableSeatsInRow.slice(0, remainingSeats));
          remainingSeats = 0;
          break;
        } else {
          reservedSeats = reservedSeats.concat(availableSeatsInRow);
          remainingSeats -= availableSeatsCount;
        }
      }

      if (remainingSeats === 0) {
        // Reserve seats in multiple rows
        reservedSeats.forEach(async (seat) => {
          seat.isBooked = true;
          await seat.save();
        });
        return res.json({ message: 'Seats reserved successfully' });
      } else {
        return res.status(400).json({ error: 'Not enough available seats' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
})

module.exports={
  seatRouter
}



