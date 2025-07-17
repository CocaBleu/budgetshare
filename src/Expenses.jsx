import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function Expenses({ spaceId }) {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState(auth.currentUser.email);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!spaceId) return;

    const q = query(
      collection(db, "spaces", spaceId, "expenses"),
      // Optionnel: tu peux trier par date plus tard
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setExpenses(list);
    });

    return () => unsubscribe();
  }, [spaceId]);

  const handleAddExpense = async () => {
    setError("");
    if (!desc || !amount || isNaN(amount) || amount <= 0) {
      setError("Description et montant valides requis");
      return;
    }

    try {
      await addDoc(collection(db, "spaces", spaceId, "expenses"), {
        description: desc,
        amount: parseFloat(amount),
        payer,
        createdAt: serverTimestamp(),
      });
      setDesc("");
      setAmount("");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h3>Dépenses</h3>

      <div>
        <input
          type="text"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="number"
          placeholder="Montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: 8, width: 100 }}
        />
        <input
          type="text"
          placeholder="Payeur"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleAddExpense}>Ajouter dépense</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>
            {exp.description} — {exp.amount.toFixed(2)} € payé par {exp.payer}
          </li>
        ))}
      </ul>
    </div>
  );
}
