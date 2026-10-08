import { useEffect, useState } from "react";

import Chats from "../Chats/Chats.tsx";
import CurrentChat from "../CurrentChat/CurrentChat.tsx";
import type { Chat, Credentials, Message } from "../../types.ts";
import {
  checkAccount,
  getContactInfo,
  sendMessage,
  startPolling,
} from "../../api/greenApi.ts";

type ChatAppProps = {
  credentials: Credentials;
  onLogout: () => void;
};

function ChatApp({ credentials, onLogout }: ChatAppProps) {
  const chatsStorageKey = `greenApiChats_${credentials.idInstance}`;
  const selectedChatStorageKey = `greenApiSelectedChatId_${credentials.idInstance}`;
  const messagesStorageKey = `greenApiMessages_${credentials.idInstance}`;

  const [chats, setChats] = useState<Chat[]>(() => {
    const savedChats = localStorage.getItem("greenApiChats");
    // const savedChats = localStorage.getItem(chatsStorageKey);

    if (!savedChats) {
      return [];
    }

    try {
      return JSON.parse(savedChats);
    } catch {
      localStorage.removeItem("greenApiChats");
      // localStorage.removeItem(chatsStorageKey);
      return [];
    }
  });

  useEffect(() => {
    // localStorage.setItem("greenApiChats", JSON.stringify(chats));
    localStorage.setItem(chatsStorageKey, JSON.stringify(chats));
  }, [chats]);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(() => {
    // return localStorage.getItem("greenApiSelectedChatId");
    return localStorage.getItem(selectedChatStorageKey);
  });

  useEffect(() => {
    if (selectedChatId) {
      // localStorage.setItem("greenApiSelectedChatId", selectedChatId);
      localStorage.setItem(selectedChatStorageKey, selectedChatId);
    } else {
      // localStorage.removeItem("greenApiSelectedChatId");
      localStorage.removeItem(selectedChatStorageKey);
    }
  }, [selectedChatId]);

  const [messages, setMessages] = useState<Message[]>(() => {
    // const savedMessages = localStorage.getItem("greenApiMessages");
    const savedMessages = localStorage.getItem(messagesStorageKey);

    if (!savedMessages) {
      return [];
    }

    try {
      return JSON.parse(savedMessages);
    } catch {
      // localStorage.removeItem("greenApiMessages");
      localStorage.removeItem(messagesStorageKey);
      return [];
    }
  });

  useEffect(() => {
    // localStorage.setItem("greenApiMessages", JSON.stringify(messages));
    localStorage.setItem(messagesStorageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // компонент появился - запускаем polling:
    const stopPolling = startPolling((message) => {
      setMessages((messages) => [...messages, message]);
    }, credentials);
    return () => {
      // компонент уходит - останавливаем polling:
      stopPolling();
    };
  }, [credentials]);

  const chatMessages = messages.filter(
    (message) => message.chatId === selectedChatId,
  );

  const selectedChat = chats.find((chat) => chat.chatId === selectedChatId);

  async function onCreateChat(phoneNumber: string) {
    // console.log("CREATE CHAT", phoneNumber, credentials);
    const chatId = await checkAccount(phoneNumber, credentials);
    const { avatar, name } = await getContactInfo(chatId, credentials);

    const contact = await getContactInfo(chatId, credentials);
    console.log("CONTACT INFO:", contact);

    const chat: Chat = {
      chatId: chatId,
      name: name,
      avatar: avatar,
    };

    if (chats.some((chat) => chat.chatId === chatId)) {
      console.log("Такой чат уже создан");
    } else {
      setChats((chats) => [...chats, chat]);
    }

    setSelectedChatId(chatId);
  }

  function onSelectChat(chatId: string) {
    setSelectedChatId(chatId);
  }

  async function onSendMessage(chatId: string, text: string) {
    await sendMessage(chatId, text, credentials);

    setMessages((messages) => [
      ...messages,
      {
        chatId,
        chatName: "",
        senderName: "Я",
        text,
        isOutgoing: true,
      },
    ]);
  }

  return (
    <>
      <header>
        <div className="logo">
          <div className="appname">
            <span className="geenapi">GREEN-API</span> for{" "}
            <span className="telegram">Telegram</span>
          </div>
        </div>
        <div className="instance">
          <span>Instance ID: {credentials.idInstance}</span>
          <button
            className="exitLink"
            title="Выход из аккаунта GREEN-API"
            onClick={onLogout}
          >
            Выйти
          </button>
        </div>
      </header>
      <main>
        <Chats
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={onSelectChat}
          onCreateChat={onCreateChat}
        />

        {selectedChat && (
          <CurrentChat
            chat={selectedChat}
            chatMessages={chatMessages}
            onSendMessage={onSendMessage}
          />
        )}
      </main>
    </>
  );
}

export default ChatApp;
