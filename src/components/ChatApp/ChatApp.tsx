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
};

function ChatApp({ credentials }: ChatAppProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

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
            <span className="geenapi">GREEN-API</span> for
            <span className="telegram">Telegram</span>
          </div>
        </div>
        <div></div>
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
