require('dotenv').config();
const { db } = require('./src/config/database');

async function seed() {
  const route777Ref = db.collection('routes').doc('ROUTE-777');
  await route777Ref.set({
    routeName: "Downtown Express",
    availableSeats: 50,
    fare: 250
  });

  const route101Ref = db.collection('routes').doc('ROUTE-101');
  await route101Ref.set({
    routeName: "Local City Line",
    availableSeats: 50,
    fare: 300
  });
  
  console.log("Successfully seeded ROUTE-777 and ROUTE-101 with 50 seats and fares.");
  process.exit(0);
}
seed();
