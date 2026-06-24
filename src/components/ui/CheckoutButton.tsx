"use client";

import { usePaystackPayment } from "react-paystack";

interface CheckoutButtonProps {
  email: string;
  amount: number;
  planName: string;
}

export default function CheckoutButton({ email, amount, planName }: CheckoutButtonProps) {
  const config = {
    reference: (new Date()).getTime().toString(),
    email,
    amount: amount * 100, // Paystack expects kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    metadata: {
      custom_fields: [
        {
          display_name: "Plan Name",
          variable_name: "plan_name",
          value: planName,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    console.log("Payment complete, waiting for webhook confirmation", reference);
  };

  const onClose = () => {
    console.log("Payment closed.");
  };

  return (
    <button
      onClick={() => {
        // react-paystack initializePayment can take either (onSuccess, onClose) or config overrides.
        initializePayment({ onSuccess, onClose });
      }}
      className="bg-[#00C853] text-black font-bold px-6 py-3 rounded-full w-full active:scale-95 transition-transform"
    >
      Upgrade to {planName}
    </button>
  );
}
