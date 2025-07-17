import React, { useState } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function CreateSpace() {
  const [name, setName] = useState("");
  const [members, setMembers] = useState([{ email: "", sharePercent: 0 }]);
  const [error, setError] = useState("");

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { email: "", sharePercent: 0 }]);
  };

  const handleSubmit = async () => {
    setError("");
    if (!name) return setError("Le nom de l’espace est requis");
    if (members.some(m => !m.email || m.sharePercent <= 0))
      return setError("Tous les membres doivent avoir un email valide et une part > 0");

    try {
      const userId = auth.currentUser.uid;
      await addDoc(collection(db, "spaces"), {
        name,
        owner: userId,
        members,
      });
      alert("Espace créé !");
      setName("");
      setMembers([{ email: "", sharePercent: 0 }]);
    } catch (e) {
      setError("Erreur création : " + e.message);
    }
  };

  return (
    <div>
      <h2>Créer un espace partagé</h2>
      <input
        type="text"
        placeholder="Nom de l'espace"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <h3>Membres</h3>
      {members.map((m, i) => (
        <div key={i}>
          <input
            type="email"
            placeholder="Email"
            value={m.email}
            onChange={e => handleMemberChange(i, "email", e.target.value)}
          />
          <input
            type="number"
            placeholder="% de part"
            value={m.sharePercent}
            onChange={e => handleMemberChange(i, "sharePercent", Number(e.target.value))}
          />
        </div>
      ))}
      <button onClick={addMember}>Ajouter membre</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSubmit}>Créer l'espace</button>
    </div>
  );
}
