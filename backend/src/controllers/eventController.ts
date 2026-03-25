import { Request, Response, NextFunction } from "express";
import EventModel from "../models/eventModel";
import {
  createEventSchema,
  updateEventSchema,
  eventFilterSchema,
} from "../middleware/validators";

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = eventFilterSchema.parse(req.query);
    const events = await EventModel.findAll(filters);
    res.json({ success: true, data: events, count: events.length });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }
    const event = await EventModel.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    return res.json({ success: true, data: event });
  } catch (err) {
    return next(err);
  }
};

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createEventSchema.parse(req.body);
    const event = await EventModel.create(data);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }
    const data = updateEventSchema.parse(req.body);
    const event = await EventModel.update(id, data);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    return res.json({ success: true, data: event });
  } catch (err) {
    return next(err);
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }
    const deleted = await EventModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    return res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    return next(err);
  }
};
