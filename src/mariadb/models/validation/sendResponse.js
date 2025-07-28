export const sendResponse = (res, message) => {
  res.status(200).json({
    status: "OK",
    message,
    timestamp: new Date().toISOString(),
  });
};
