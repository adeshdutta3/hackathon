"use client";

import { useState, useEffect } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

export default function PaymentModal({ isOpen, onClose, onPaymentConfirmed }: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "confirmed" | "failed">("pending");

  useEffect(() => {
    if (isOpen) {
      // Start polling for payment status
      const interval = setInterval(async () => {
        try {
          const response = await fetch("/api/payment/status");
          const data = await response.json();
          
          if (data.status === "confirmed") {
            setPaymentStatus("confirmed");
            onPaymentConfirmed();
            clearInterval(interval);
          } else if (data.status === "failed") {
            setPaymentStatus("failed");
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Payment status check failed:", error);
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen, onPaymentConfirmed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Payment Required</h2>
        
        {paymentStatus === "pending" && (
          <div>
            <p className="mb-4">You've reached the message limit. Please complete payment to continue.</p>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Processing payment...</p>
            </div>
          </div>
        )}

        {paymentStatus === "confirmed" && (
          <div className="text-center text-green-600">
            <p className="text-lg font-semibold">Payment Confirmed!</p>
            <p>You can now continue chatting.</p>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Payment Failed</p>
            <p>Please try again or contact support.</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        )}

        {paymentStatus === "pending" && (
          <button 
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}