//||\\||//||\\||// выбранный чат //||\\||//||\\||//

import type { Chat, Message } from "../../types";
import MessageInput from "../MessageInput/MessageInput";
import Messages from "../Messages/Messages";

type ChatProps = {
  chat: Chat;
  chatMessages: Message[];
  onSendMessage: (chatId: string, text: string) => void;
};

function CurrentChat({ chat, chatMessages, onSendMessage }: ChatProps) {
  return (
    <div className="chatScreen">
      <h3 className="chatName">{chat.name}</h3>

      <Messages chatMessages={chatMessages} />
      <MessageInput chatId={chat.chatId} onSendMessage={onSendMessage} />
    </div>
  );
}
export default CurrentChat;
