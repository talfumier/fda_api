export const sendResponse = (res, message) => {
  res.status(200).json({
    statusCode: "200",
    message,
    timestamp: new Date().toISOString(),
  });
};
