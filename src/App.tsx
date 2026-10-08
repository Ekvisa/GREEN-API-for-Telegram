import { useState } from "react";
import "./App.scss";

import ChatApp from "./components/ChatApp/ChatApp.tsx";
import ConnectionForm from "./components/ConnectionForm/ConnectionForm.tsx";
import type { Credentials } from "./types.ts";

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    const savedCredentials = localStorage.getItem("greenApiCredentials");

    if (!savedCredentials) {
      return null;
    }

    try {
      return JSON.parse(savedCredentials);
    } catch {
      localStorage.removeItem("greenApiCredentials"); // если в localStorage окажется испорченная строка
      return null;
    }
  });

  function handleConnect(credentials: Credentials) {
    setCredentials(credentials);

    localStorage.setItem("greenApiCredentials", JSON.stringify(credentials));
  }

  if (!credentials) {
    return <ConnectionForm onConnect={handleConnect} />;
  }

  return <ChatApp credentials={credentials} />;
}

export default App;
