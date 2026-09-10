const cron = require('node-cron');
const User = require('../models/user.model');
const emailService = require('../services/email.service');
const logger = require('../utilities/logger.util');

const startBirthdayJob = () => {
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running birthday email job');

    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      const currentYear = today.getFullYear();

      const users = await User.find({
        isActive: true,
        isDeleted: false,
        dateOfBirth: { $ne: null },
        $expr: {
          $and: [
            { $eq: [{ $month: '$dateOfBirth' }, currentMonth] },
            { $eq: [{ $dayOfMonth: '$dateOfBirth' }, currentDay] }
          ]
        },
        $or: [
          { birthdayEmailSentYear: { $exists: false } },
          { birthdayEmailSentYear: { $ne: currentYear } }
        ]
      });

      for (const user of users) {
        const sent = await emailService.sendBirthdayEmail(user);
        if (sent) {
          user.birthdayEmailSentYear = currentYear;
          await user.save({ validateBeforeSave: false });
        }
      }

      logger.info(`Birthday emails processed: ${users.length} users`);
    } catch (err) {
      logger.error(`Birthday job error: ${err.message}`);
    }
  });

  logger.info('Birthday email job scheduled (daily at 9:00 AM)');
};

module.exports = { startBirthdayJob };
