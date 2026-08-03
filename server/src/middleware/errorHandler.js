const multer = require("multer");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err && err.message && err.message.startsWith("Invalid file type")) {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
}

function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

module.exports = { errorHandler, notFound };
