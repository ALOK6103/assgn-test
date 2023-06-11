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

    // Find available seats in the current row
    const currentRowSeats = await seatModel.find({
      row: req.body.row,
      isBooked: false,
    }).limit(numSeats);

    if (currentRowSeats.length >= numSeats) {
      // Reserve seats in the current row
      currentRowSeats.forEach(async (seat) => {
        seat.isBooked = true;
        await seat.save();
      });
      return res.json({ message: 'Seats reserved successfully' });
    } else {
      // Find available seats in the previous row
      const previousRow = req.body.row - 1;
      const previousRowSeats = await seatModel.find({
        row: previousRow,
        isBooked: false,
      }).limit(numSeats - currentRowSeats.length);

      if (previousRowSeats.length === numSeats - currentRowSeats.length) {
        // Reserve seats in the previous row and current row
        const allSeats = [...currentRowSeats, ...previousRowSeats];
        allSeats.forEach(async (seat) => {
          seat.isBooked = true;
          await seat.save();
        });
        return res.json({ message: 'Seats reserved successfully' });
      } else {
        // Find available seats in any row
        const availableSeatsAnyRow = await seatModel.find({
          isBooked: false,
        })
          .limit(numSeats - currentRowSeats.length - previousRowSeats.length);

        if (availableSeatsAnyRow.length >= numSeats - currentRowSeats.length - previousRowSeats.length) {
          // Reserve seats in any row
          availableSeatsAnyRow.forEach(async (seat) => {
            seat.isBooked = true;
            await seat.save();
          });
          return res.json({ message: 'Seats reserved successfully' });
        } else {
          // Find seats which are not booked and book them according to the request
          const unreservedSeats = await seatModel.find({ isBooked: false }).limit(numSeats);

          if (unreservedSeats.length >= numSeats) {
            unreservedSeats.forEach(async (seat) => {
              seat.isBooked = true;
              await seat.save();
            });
            return res.json({ message: 'Seats reserved successfully' });
          } else {
            return res.status(400).json({ error: 'Not enough available seats' });
          }
        }
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



