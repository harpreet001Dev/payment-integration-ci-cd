import asyncHandler from "../utlis/asyncHandler.js"
import authService from "../services/authService.js";
import ApiError from "../utlis/apiError.js";

const Register = asyncHandler(async (req, res) => {
    const user = await authService.Register(req.body);
    console.log("user in controller",user);
    
    return res.status(200).json({
        status:"success",
        data:user
    })
})


const login = asyncHandler(async (req, res) => {
    
    const result=await authService.login(req.body);
    const {user,accessToken,refreshToken}=result;

    res.status(200).json({
        status: "success",
        data: {
            user,
            accessToken,
            refreshToken
        }
    })
})

const refresh=asyncHandler(async(req,res)=>{

    const {refreshToken}=req.body;
    if(!refreshToken){
        throw new ApiError(401,"Refresh Token  Not found!")
    }
    const result=await authService.refresh(refreshToken)
    console.log(result,"result");
    
    const { accessToken, newRefreshToken } = result;

    res.status(200).json({
        status: "success",
        data: {
            accessToken,
            refreshToken: newRefreshToken
        }
    })
})

export default {
    Register,
    login,
    refresh
}