import express from "express";
import AccommodationModel from "../../../schemas/Accommodation.js";
import { tokenMiddleware } from "../../auth/tokenMiddleware.js";
import { hostMiddleware } from "../../auth/hostMiddleware.js";
import createHttpError from "http-errors";
import usersRouter from "../users/index.js";

const accommodationsRouter = express.Router();

accommodationsRouter
  .route("/")
  .get(tokenMiddleware, async (req, res, next) => {
    try {
      const allAccommodation = await AccommodationModel.find().populate("host");
      res.send(allAccommodation);
    } catch (error) {
      next(error);
    }
  })
  .post(tokenMiddleware, hostMiddleware, async (req, res, next) => {
    try {
      const newAccommodation = new AccommodationModel({
        ...req.body,
        host: req.user._id,
      });
      const accommodation = await newAccommodation.save();
      res.send(accommodation);
    } catch (error) {
      next(error);
    }
  });

accommodationsRouter
  .route("/:accId")
  .get(tokenMiddleware, async (req, res, next) => {
    try {
      const { accId } = req.params;
      const oneAccommodation = await AccommodationModel.findById(
        accId
      ).populate("host");

      if (oneAccommodation) {
        res.send(oneAccommodation);
      } else {
        next(createHttpError(404, "This accommodation is not found"));
      }
    } catch (error) {
      next(error);
    }
  })
  .put(tokenMiddleware, hostMiddleware, async (req, res, next) => {
    try {
      const { accId } = req.params;
      const updateAccommodation = await AccommodationModel.findOneAndUpdate(
        { _id: accId, host: req.user._id },
        req.body,
        { new: true }
      );
      if (updateAccommodation) {
        res.send(updateAccommodation);
      } else {
        next(
          createHttpError(
            401,
            "You are not authorized to change this accommodation."
          )
        );
      }
    } catch (error) {
      next(error);
    }
  })
  .delete(tokenMiddleware, hostMiddleware, async (req, res, next) => {
    try {
      const { accId } = req.params;
      const deletedAccommodation = await AccommodationModel.findOneAndDelete({
        _id: accId,
        host: req.user._id,
      });
      if (deletedAccommodation) {
        res.send(deletedAccommodation);
      } else {
        next(
          createHttpError(
            401,
            "You are not authorized to change this accommodation."
          )
        );
      }
    } catch (error) {
      next(error);
    }
  });
export default accommodationsRouter;
