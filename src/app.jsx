import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Nouveaux states pour la création espace + affichage espaces
  const [spaceName, setSpaceName] = useState("");
  const [spaceMembers, setSpaceMembers] = useState("");
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Ecoute les espaces où l’utilisateur est membre
        const q = query(
          collection(db, "spaces"),
          where("members", "array-contains", {
            email: currentUser.email,
          })
        );

        const unsubscribeSpaces = onSnapshot(q, (querySnapshot) => {
          const list = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setSpaces(list);
        });

        return () => {
          unsubscribeSpaces();
        };
      } else {
        setSpaces([]);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const handleSignup = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Fonction pour créer un espace
  const handleCreateSpace = async () => {
    setError("");
    if (!spaceName) {
      setError("Le nom de l’espace est requis");
      return;
    }
    if (!spaceMembers) {
      setError("Au moins un membre est requis");
      return;
    }
    try {
      // Crée un tableau d’objets membres à partir de la chaîne email (séparée par virgule)
      // Exemple: "a@mail.com, b@mail.com"
      const membersArray = spaceMembers
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      // Ajoute l’utilisateur courant automatiquement en tant que membre
      if (!membersArray.includes(user.email)) membersArray.push(user.email);

      // On construit un tableau d’objets { email, sharePercent: 100 / nombre }
      const share = 100 / membersArray.length;
      const members = membersArray.map((email) => ({
        email,
        sharePercent: share,
      }));

      await addDoc(collection(db, "spaces"), {
        name: spaceName,
        members,
      });

      setSpaceName("");
      setSpaceMembers("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Bienvenue {user.email} !</h1>
        <button onClick={handleLogout}>Se déconnecter</button>

        <h2>Créer un espace partagé</h2>
        <input
          type="text"
          placeholder="Nom de l'espace"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="text"
          placeholder="Emails des membres (séparés par virgule)"
          value={spaceMembers}
          onChange={(e) => setSpaceMembers(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button onClick={handleCreateSpace}>Créer l’espace</button>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <h2>Mes espaces partagés</h2>
        {spaces.length === 0 && <p>Tu n’as aucun espace.</p>}
        <ul>
          {spaces.map((space) => (
            <li key={space.id}>
              <strong>{space.name}</strong> - Membres :{" "}
              {space.members.map((m) => m.email).join(", ")}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Connexion / Inscription</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 8 }}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 8 }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleLogin} style={{ marginRight: 8 }}>
        Se connecter
      </button>
      <button onClick={handleSignup}>S’inscrire</button>
    </div>
  );
}

export default App;
