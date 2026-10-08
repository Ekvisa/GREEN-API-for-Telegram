//||\\||//||\\||// список чатов //||\\||//||\\||//

import { useState } from "react";
import type { Chat } from "../../types";

type ChatsProps = {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  onCreateChat: (phoneNumber: string) => Promise<void>;
};

function Chats({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
}: ChatsProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  async function handleCreateChat() {
    await onCreateChat(phoneNumber);
    setPhoneNumber("");
  }

  const isButtonDisabled = phoneNumber.trim() === "";

  return (
    <div className="chatsList">
      <p className="addChat">
        <input
          type="text"
          placeholder="Номер телефона"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
        <button disabled={isButtonDisabled} onClick={handleCreateChat}>
          Создать чат
        </button>
      </p>

      <ul>
        {chats.map((chat) => (
          <li
            key={chat.chatId}
            onClick={() => onSelectChat(chat.chatId)}
            className={chat.chatId === selectedChatId ? "active" : ""}
          >
            <div className="avatar">
              <img src={chat.avatar} alt={`avatar of ${chat.name}`} />
            </div>
            <div className="name">{chat.name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default Chats;
