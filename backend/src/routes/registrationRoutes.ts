import { Router } from "express";
import {
  getParticipants,
  registerForEvent,
  cancelRegistration,
} from "../controllers/registrationController";

const router = Router();

router.get("/events/:eventId/participants", getParticipants);
router.post("/events/:eventId/register", registerForEvent);
router.patch("/registrations/:id/cancel", cancelRegistration);

export default router;
