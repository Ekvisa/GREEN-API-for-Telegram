//||\\||//||\\||// инпут для ввода сообщения //||\\||//||\\||//

import { useState } from "react";

type MessageInputProps = {
  chatId: string;
  onSendMessage: (chatId: string, text: string) => void;
};

function MessageInput({ chatId, onSendMessage }: MessageInputProps) {
  const [text, setText] = useState("");

  const isButtonDisabled = text.trim() === "";

  function handleSend() {
    onSendMessage(chatId, text);
    setText("");
  }

  return (
    <div className="messageInput">
      <textarea
        id="messageInput"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Сообщение..."
      />
      <button disabled={isButtonDisabled} onClick={handleSend}>
        Отправить
      </button>
    </div>
  );
}
export default MessageInput;
