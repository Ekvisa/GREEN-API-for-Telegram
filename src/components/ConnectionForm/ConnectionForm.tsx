import { useState } from "react";
import type { FormEvent } from "react";
import type { Credentials } from "../../types";
import { getStateInstance } from "../../api/greenApi";

type ConnectionFormProps = {
  onConnect: (credentials: Credentials) => void;
};

function ConnectionForm({ onConnect }: ConnectionFormProps) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [error, setError] = useState("");

  const isButtonDisabled =
    idInstance.trim() === "" || apiTokenInstance.trim() === "";

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const credentials = {
      idInstance,
      apiTokenInstance,
    };

    try {
      const stateInstance = await getStateInstance(credentials);

      if (stateInstance === "authorized") {
        onConnect(credentials);
      } else {
        console.log("Инстанс не авторизован:", stateInstance);
        setError(
          "Не удалось подключиться. Проверьте ID Instance и API Token Instance.",
        );
      }
    } catch (error) {
      console.error("Не удалось подключиться:", error);
      setError(
        "Не удалось подключиться. Проверьте данные и попробуйте ещё раз.",
      );
    }
  }

  return (
    <div className="connection">
      <h1 className="logo">
        <div className="hero">
          <span className="geenapi">GREEN-API</span> for
          <span className="telegram">Telegram</span>
        </div>
      </h1>
      <form onSubmit={handleConnect}>
        <label htmlFor="instance">ID Instance:</label>
        <input
          type="text"
          id="instance"
          name="instance"
          placeholder="ID Instance"
          value={idInstance}
          onChange={(event) => setIdInstance(event.target.value)}
        ></input>
        <label htmlFor="token">API Token Instance:</label>
        <input
          type="text"
          id="token"
          name="token"
          placeholder="API Token Instance"
          value={apiTokenInstance}
          onChange={(event) => setApiTokenInstance(event.target.value)}
        ></input>
        <button type="submit" disabled={isButtonDisabled}>
          Подключиться
        </button>
        <a href="https://console.green-api.com/instanceList">
          Получить данные для подключения
        </a>
        {error && <p className="connectionError">{error}</p>}
      </form>
    </div>
  );
}

export default ConnectionForm;
