import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

function Expenses({ spaceId }) {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!spaceId) return;

    const q = query(
      collection(db, "expenses"),
      where("spaceId", "==", spaceId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setExpenses(list);
    });

    return () => unsubscribe();
  }, [spaceId]);

  const handleAddExpense = async () => {
    setError("");
    if (!description || !amount) {
      setError("Merci de remplir la description et le montant.");
      return;
    }
    try {
      await addDoc(collection(db, "expenses"), {
        spaceId,
        description,
        amount: parseFloat(amount),
        createdAt: Timestamp.now(),
      });
      setDescription("");
      setAmount("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Dépenses de l’espace</h3>

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginRight: 8, padding: 8 }}
      />
      <input
        type="number"
        placeholder="Montant"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginRight: 8, padding: 8, width: 100 }}
      />
      <button onClick={handleAddExpense}>Ajouter dépense</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ marginTop: 20 }}>
        {expenses.length === 0 && <li>Aucune dépense.</li>}
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.description} — {expense.amount.toFixed(2)} €
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;
