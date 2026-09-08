import { useState } from "react";
import api from "../api/api.js"


export default function Dashboard() {
    const [amount, setAmount] = useState(10);
    const [idempotencyKey, setIdempotencyKey] = useState(null);

    //payment point asf
    const payAmount = async () => {
        try {
            let key = idempotencyKey;
            if (!key) {
                key = crypto.randomUUID();
                setIdempotencyKey(key);
            }
            const data = {
                amount,
                idempotencyKey: key
            }
            const res = await api.MakePayemnt(data);
            setIdempotencyKey(null);
            const approvalLink = res?.data?.links.find(
                link => link.rel === "approve"
            )
            console.log("APPROVAL URL:", approvalLink.href);
            window.open(approvalLink.href, "_blank");

        } catch (error) {
            console.log(error);

        }
    }

    return (
        <>
            <h1>Dashboard</h1>
            <button onClick={payAmount} className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Pay {amount}</button>
        </>
    )

}