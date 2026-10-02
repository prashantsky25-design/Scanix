const router = require("express").Router();
const { listEvents, getEvent, createEvent } = require("../controllers/eventController");
const { registerForEvent } = require("../controllers/registrationController");
const { requireHostKey, checkIn } = require("../controllers/checkinController");

router.get("/", listEvents);
router.post("/", createEvent);
router.get("/:id", getEvent);
router.post("/:id/register", registerForEvent);
router.post("/:id/checkin", requireHostKey, checkIn);

module.exports = router;
