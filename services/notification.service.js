const Notification = require('../models/notification.model');

exports.createNotification = async ({ type, title, message, referenceId, referenceModel }) => {
  return await Notification.create({
    type,
    title,
    message,
    referenceId,
    referenceModel
  });
};
