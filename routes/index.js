const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "BLockly API - 👋🌎🌍🌏",
    }).status(200);
});

module.exports = router;