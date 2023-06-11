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
    });

    if (currentRowSeats.length >= numSeats) {
      // Reserve seats in the current row
      const seatsToReserve = currentRowSeats.slice(0, numSeats);
      seatsToReserve.forEach(async (seat) => {
        seat.isBooked = true;
        await seat.save();
      });
      return res.json({ message: 'Seats reserved successfully' });
    } else {
      // Find available seats in the nearby rows
      let nearbySeats = [];
      let remainingSeats = numSeats - currentRowSeats.length;

      // Find available seats in the next row
      const nextRowSeats = await seatModel.find({
        row: req.body.row + 1,
        isBooked: false,
      });
      nearbySeats = nearbySeats.concat(nextRowSeats);

      // Find available seats in the previous row
      const previousRowSeats = await seatModel.find({
        row: req.body.row - 1,
        isBooked: false,
      });
      nearbySeats = nearbySeats.concat(previousRowSeats);

      if (nearbySeats.length >= remainingSeats) {
        // Reserve seats in the current row and nearby rows
        const allSeats = [...currentRowSeats, ...nearbySeats.slice(0, remainingSeats)];
        allSeats.forEach(async (seat) => {
          seat.isBooked = true;
          await seat.save();
        });
        return res.json({ message: 'Seats reserved successfully' });
      } else {
        // Find seats which are not booked and book them according to the request
        const unreservedSeats = await seatModel.find({ isBooked: false });

        if (unreservedSeats.length >= numSeats) {
          const seatsToReserve = unreservedSeats.slice(0, numSeats);
          seatsToReserve.forEach(async (seat) => {
            seat.isBooked = true;
            await seat.save();
          });
          return res.json({ message: 'Seats reserved successfully' });
        } else {
          return res.status(400).json({ error: 'Not enough available seats' });
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



