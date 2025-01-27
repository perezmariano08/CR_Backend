const URL_BACK =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://crbackend-production.up.railway.app";

const URL_FRONT =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://coparelampago.com";

module.exports = { URL_BACK, URL_FRONT };
