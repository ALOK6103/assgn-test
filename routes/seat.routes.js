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
    const currentRowSeats = await findAvailableSeatsInRow(req.body.row, numSeats);

    if (currentRowSeats.length === numSeats) {
      // Reserve seats in the current row
      await reserveSeatsInRow(currentRowSeats);
      return res.json({ message: 'Seats reserved successfully' });
    } else {
      // Find available seats in the nearby rows
      const nearbyRowSeats = await seatModel.find({
        row: { $in: [req.body.row - 1, req.body.row + 1] },
        isBooked: false,
      }).sort('row seatNumber');

      let availableSeats = [];
      let i = 0;

      while (i < nearbyRowSeats.length && availableSeats.length < numSeats) {
        const row = nearbyRowSeats[i].row;
        const seatsInRow = await findAvailableSeatsInRow(row, numSeats - availableSeats.length);

        availableSeats = availableSeats.concat(seatsInRow);
        i++;
      }

      if (availableSeats.length === numSeats) {
        // Reserve seats in the nearby rows
        await reserveSeatsInRow(availableSeats);
        return res.json({ message: 'Seats reserved successfully' });
      } else {
        // Find seats which are not booked and book them according to the request
        const unreservedSeats = await seatModel.find({ isBooked: false }).sort('row seatNumber');

        if (unreservedSeats.length >= numSeats) {
          const seatsToReserve = unreservedSeats.slice(0, numSeats);
          await reserveSeatsInRow(seatsToReserve);
          return res.json({ message: 'Seats reserved successfully' });
        } else {
          return res.status(400).json({ error: 'Seats are not available' });
        }
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})

module.exports={
  seatRouter
}



