import express from "express"; // import express from express
import cors from "cors"; // will enable the frontend to communicate with the backend
import listEndpoints from "express-list-endpoints"; // will show us the detailed endpoints
import {
  badRequestHandler,
  unauthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  conflictHandler,
  genericServerErrorHandler,
} from "./errorHandlers.js";
import mongoose from "mongoose";
import usersRouter from "./services/users/index.js";
import accommodationsRouter from "./services/accommodations/index.js";
import googleStrategy from "./auth/oauth.js";
import passport from "passport";
import cookieParser from 'cookie-parser'
import facebookStrategy from "./auth/facebookAuth.js";


const server = express(); //our server function initialized with express()
const port = process.env.PORT || 3001; // this will be the port on with the server will run
passport.use('google',googleStrategy)
passport.use('facebook',facebookStrategy)
//=========== GLOBAL MIDDLEWARES ======================
server.use(cors());
server.use(express.json()); // this will enable reading of the bodies of requests, THIS HAS TO BE BEFORE server.use("/authors", authorsRouter)
server.use(cookieParser())
server.use(passport.initialize())
// ========== ROUTES =======================
server.use("/users", usersRouter);
server.use("/accommodations", accommodationsRouter);
// ============== ERROR HANDLING ==============

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(conflictHandler);
server.use(genericServerErrorHandler);

// =================Run the Server ==================

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("🍃Successfully connected to mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log("🛩️ Server is running on port ", port);
  });
});

mongoose.connection.on("error", (err) => {
  console.log("MONGO ERROR: ", err);
});
