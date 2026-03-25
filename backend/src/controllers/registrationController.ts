import { Request, Response, NextFunction } from "express";
import RegistrationModel from "../models/registrationModel";
import EventModel from "../models/eventModel";
import {
  createRegistrationSchema,
  cancelRegistrationSchema,
} from "../middleware/validators";

export const getParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    const registrations = await RegistrationModel.findByEventId(eventId);
    const counts = await RegistrationModel.countByEventId(eventId);
    return res.json({ success: true, data: registrations, counts, event });
  } catch (err) {
    return next(err);
  }
};

export const registerForEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    const data = createRegistrationSchema.parse(req.body);
    const registration = await RegistrationModel.create({
      event_id: eventId,
      ...data,
    });
    return res.status(201).json({ success: true, data: registration });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes("unique constraint")
    ) {
      return res.status(409).json({
        success: false,
        error: "This email is already registered for this event",
      });
    }
    return next(err);
  }
};

export const cancelRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid registration ID" });
    }
    const data = cancelRegistrationSchema.parse(req.body);
    const registration = await RegistrationModel.cancelRegistration(
      id,
      data.reason
    );
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, error: "Registration not found" });
    }
    return res.json({ success: true, data: registration });
  } catch (err) {
    return next(err);
  }
};
