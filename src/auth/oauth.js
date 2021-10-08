import GoogleStrategy from 'passport-google-oauth20'
import passport from 'passport'
import UserModel from '../../schemas/User.js'
import { generateJWTToken } from './tokenTools.js'

const googleStrategy = new GoogleStrategy({
    clientID:process.env.GOOGLE_OAUTH_ID,
    clientSecret:process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: `${process.env.API_URL}:${process.env.PORT}/users/googleRedirect`,
},
async (accessToken,refreshToken,profile,passportNext)=>{
    try {
        const user = await UserModel.findOne({googleId:profile.id})
        if(user){
            const tokens = await generateJWTToken(user)
            passportNext(null, { tokens })
        }else{
            const newUser = {
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.emails[0].value,
                googleId: profile.id,
              }
              const createUser = new UserModel(newUser)
              const saveUser = await createUser.save()
              const tokens = await generateJWTToken(saveUser)
              passportNext(null, { user: saveUser, tokens })
        }
    } catch (error) {
        console.log(error)
        passportNext(error)
    }})

passport.serializeUser(function(user,passportNext){
    passportNext(null,user)
})
export default googleStrategy
