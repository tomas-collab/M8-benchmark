import createHttpError from 'http-errors'
import UserModel from '../../schemas/User.js'
import {verifyJWTToken}  from './tokenTools.js'

export const tokenMiddleware = async(req,res,next)=>{
    try {
        if(!req.headers.authorization){
            next(createHttpError(401,'please provide credentials'))
        }else{
            const token = req.headers.authorization.split(" ")[1]
            const decodedToken = await verifyJWTToken(token)
            const user = await UserModel.findById(decodedToken._id)
            if(user){
                req.user = user
                next()
            }else{
                next(createHttpError(404,'user not found'))
            }
        } 
    } catch (error) {
        next(createHttpError(401,"Token not valid"))
    }
}