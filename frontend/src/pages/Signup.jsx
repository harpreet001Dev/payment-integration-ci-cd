import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/api.js'
import { handleError } from '../utlis/appiError.js';

const registerSchema = z.object({
    email: z.string().email("Invalid Email"),
    password: z.string().min(6, "Password must be atleast 6 charachers"),
    confirmpassword: z.string().min(6, "Password must be atleast 6 charachers")
}).refine((data) => data.password === data.confirmpassword, {
    message: "Password don not match",
    path: ["confirmpassword"]
})



export default function Register() {

    const { register, handleSubmit, formState: { errors } ,setError} = useForm({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data) => {
        try {
            const res = await api.Register(data);
            console.log(res, "res in signup");

        } catch (error) {
            handleError(error,setError)
        }

    }

    return (
        <>
            <h1>Regsiter</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-10 p-6 rounded-xl shadow-md">
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter Email"
                        className="w-full p-3 border rounded-lg"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p>
                            {errors.email.message}
                        </p>
                    )}

                    <input
                        type="password"
                        placeholder="Enter Password"
                        className="w-full p-3 border rounded-lg"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p>
                            {errors.password.message}
                        </p>
                    )}

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-3 border rounded-lg"
                        {...register("confirmpassword")}
                    />
                    {errors.confirmpassword && (
                        <p>
                            {errors.confirmpassword.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
        </>
    )

}