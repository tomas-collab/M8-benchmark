import passport from "passport";
import FacebookStrategy from "passport-facebook";
import UserModel from "../../schemas/User.js";
import { generateJWTToken } from './tokenTools.js'


const facebookStrategy = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_OAUTH_ID,
    clientSecret: process.env.FACEBOOK_OAUTH_SECRET,
    callbackURL: `${process.env.URL}:${process.env.PORT}/users/auth/facebook/secrets`,
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await UserModel.findOne({ facebookId: profile.id });
      console.log(user);
      if (user) {const token = generateJWTToken.sign({id: user._id,},
          process.env.JWT_SECRET);
        cb(null, { token });
      } else {
        const newUser = {
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.emails[0].value,
                role: "guest",
                facebookId: profile.id,
        };
        const createdUser = new UserModel(newUser);
        const savedUser = await createdUser.save();

        
        const token = generateJWTToken.sign(
          {
            id: savedUser._id,
          },
          process.env.JWT_SECRET
        );

        cb(null, { user: savedUser, token });
      }
    } catch (error) {
      console.log(error);
      cb(error);
    }
  }
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

export default facebookStrategy;