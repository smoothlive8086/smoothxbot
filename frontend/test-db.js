require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

console.log('DNS servers:', dns.getServers());
console.log('Connecting to MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection failed with error:');
    console.error(err);
    process.exit(1);
  });
