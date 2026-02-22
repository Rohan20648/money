"use client";

import { useEffect, useState } from "react";

export default function BorrowPage() {
  const [savings, setSavings] = useState(0);
  const [amount, setAmount] = useState<number | "">("");
  const [borrowerUpi, setBorrowerUpi] = useState("");
  const [lenderUpi, setLenderUpi] = useState("");
  const [repayBy, setRepayBy] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("portfolioData");
    if (!stored) return;

    const data = JSON.parse(stored);
    setSavings(data.savings || 0);
  }, []);

  function handleBorrow() {
    if (amount === "" || Number(amount) > savings) {
      alert("Borrow amount exceeds savings");
      return;
    }

    const userRaw = localStorage.getItem("moneyguruUser");
    if (!userRaw) return;

    const user = JSON.parse(userRaw);

    const borrowRecord = {
      username: user.username,
      amount: Number(amount),
      borrowerUpi,
      lenderUpi,
      repayBy,
      repaid: false,
      createdAt: new Date().toISOString(),
    };

    const history =
      JSON.parse(localStorage.getItem("borrowHistory") || "[]") || [];

    history.push(borrowRecord);
    localStorage.setItem("borrowHistory", JSON.stringify(history));

    alert("Borrow request recorded");
    window.location.href = "/portfolio";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center px-6">
      <div className="bg-white/5 backdrop-blur p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">

        <h1 className="text-3xl font-bold text-center">🤝 Borrow Money</h1>
        <p className="text-gray-400 text-center">
          Available savings: ₹{savings}
        </p>

        <input
          type="number"
          placeholder="Amount to borrow"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full bg-black/40 p-3 rounded-xl"
        />

        {amount !== "" && Number(amount) <= savings && (
          <>
            <input
              type="text"
              placeholder="Your UPI ID"
              value={borrowerUpi}
              onChange={(e) => setBorrowerUpi(e.target.value)}
              className="w-full bg-black/40 p-3 rounded-xl"
            />

            <input
              type="text"
              placeholder="Lender UPI ID"
              value={lenderUpi}
              onChange={(e) => setLenderUpi(e.target.value)}
              className="w-full bg-black/40 p-3 rounded-xl"
            />

            <input
              type="date"
              value={repayBy}
              onChange={(e) => setRepayBy(e.target.value)}
              className="w-full bg-black/40 p-3 rounded-xl"
            />

            <button
              onClick={handleBorrow}
              className="w-full bg-yellow-400 text-black py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Confirm Borrow →
            </button>
          </>
        )}
      </div>
    </main>
  );
}

