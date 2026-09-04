const axios = require("axios");

const MSG91_VERIFY_URL =
  "https://control.msg91.com/api/v5/widget/verifyAccessToken";

async function verifyMSG91AccessToken(accessToken) {
  if (!process.env.MSG91_AUTHKEY) {
    throw new Error("MSG91_AUTHKEY is not configured");
  }

  if (!accessToken) {
    return {
      valid: false,
      message: "MSG91 access token is missing",
    };
  }

  try {
    const response = await axios.post(
      MSG91_VERIFY_URL,
      {
        authkey: process.env.MSG91_AUTHKEY,
        "access-token": accessToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      valid: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "MSG91 access-token verification failed:",
      error.response?.data || error.message
    );

    return {
      valid: false,
      message:
        error.response?.data?.message ||
        "MSG91 access-token verification failed",
    };
  }
}

module.exports = {
  verifyMSG91AccessToken,
};