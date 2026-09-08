
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { handleError } from "../utlis/appiError.js"
import api from "../api/api.js"
import {useNavigate} from 'react-router-dom';

const loginSchema = z.object({
    email: z.string().email('Enter valid email'),
    password: z.string().min(6, "Password should be of 6 chars")
})

export default function Login() {

    const { register, handleSubmit, formState: { errors },setError } = useForm({
        resolver: zodResolver(loginSchema)
    })
    const navigate=useNavigate()

    const onSubmit = async(data) => {
        try {
            const res = await api.Login(data);

            
            if(res.status==="success"){

                
                localStorage.setItem('accesstoken',res.data.accessToken)
                localStorage.setItem('refreshtoken',res.data.refreshToken)
                alert("You logged in successfully")
                navigate('/')
            }
            
        } catch (error) {
            console.log("ERROR IN LOGIN:", error);
            handleError(error,setError)
        }
    }

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-10 p-6 rounded-xl shadow-md">
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter Email"
                        className="w-full p-3 border rounded-lg"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p>{errors.email.message}</p>
                    )}
                    <input
                        type="password"
                        placeholder="Enter Password"
                        className="w-full p-3 border rounded-lg"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p>{errors.password.message}</p>
                    )}
                    <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"> Login</button>
                </div>
            </form>
        </>
    )

}