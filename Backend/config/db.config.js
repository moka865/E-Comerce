const mongoose = require('mongoose');
const logger = require('../utilities/logger.util');

exports.connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_URI);
    logger.info(`Database connected: ${connection.connection.host}`);
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }
};
