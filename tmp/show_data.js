const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function viewData() {
  try {
    console.log("Connecting to Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log("\n--- Project: Finance Dashboard (MongoDB Atlas) ---");
    
    for (let col of collections) {
      if (col.name === 'users' || col.name === 'transactions') {
        const data = await db.collection(col.name).find().toArray();
        console.log(`\n📦 Collection: ${col.name} (${data.length} registered entries)`);
        console.log(JSON.stringify(data, null, 2));
      }
    }
  } catch (err) {
    console.error("Error reading database:", err);
  } finally {
    process.exit();
  }
}
viewData();
