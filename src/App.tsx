import { useEffect, useState } from "react";
import "./App.scss";

import ChatApp from "./components/ChatApp/ChatApp.tsx";
import ConnectionForm from "./components/ConnectionForm/ConnectionForm.tsx";
import type { Credentials } from "./types.ts";
import { getStateInstance } from "./api/greenApi.ts";

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

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkSavedCredentials() {
      if (!credentials) {
        setIsChecking(false);
        return;
      }

      try {
        const stateInstance = await getStateInstance(credentials);

        if (stateInstance !== "authorized") {
          localStorage.removeItem("greenApiCredentials");
          setCredentials(null);
        }
      } catch (error) {
        console.error("Не удалось проверить сохранённые credentials:", error);

        localStorage.removeItem("greenApiCredentials");
        setCredentials(null);
      } finally {
        setIsChecking(false);
      }
    }

    checkSavedCredentials();
  }, []);

  function handleConnect(credentials: Credentials) {
    setCredentials(credentials);

    localStorage.setItem("greenApiCredentials", JSON.stringify(credentials));
  }

  function handleLogout() {
    localStorage.removeItem("greenApiCredentials");
    setCredentials(null);
  }

  if (isChecking) {
    return <div>Проверяем подключение...</div>;
  }

  if (!credentials) {
    return <ConnectionForm onConnect={handleConnect} />;
  }

  return <ChatApp credentials={credentials} onLogout={handleLogout} />;
}

export default App;
