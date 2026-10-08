// //||\\||//||\\||// сообщения выбранного чата //||\\||//||\\||//

import { useRef, useEffect } from "react";
import type { Message } from "../../types";

type MessagesProps = {
  chatMessages: Message[];
};

const Messages = ({ chatMessages }: MessagesProps) => {
  const containerRef = useRef<HTMLUListElement>(null);

  // Вычисление и применение маски полупрозрачности:
  const updateMask = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;

    // Порог в пикселях (например, 15px), чтобы маска исчезала не строго в 0, а чуть раньше
    const isAtTop = scrollTop <= 15;
    const isAtBottom = scrollTop >= maxScroll - 15;

    // Для маски black = видно, transparent = прозрачно
    const topColor = isAtTop ? "black" : "transparent";
    const bottomColor = isAtBottom ? "black" : "transparent";

    const mask = `linear-gradient(to bottom, ${topColor} 0%, black 15%, black 85%, ${bottomColor} 100%)`;

    container.style.maskImage = mask;
  };

  // Эффект для настройки слушателя событий:
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Применяем маску при первом рендере и при каждом изменении сообщений:
    updateMask();

    // Слушаем скролл
    container.addEventListener("scroll", updateMask);

    // Удаляем слушатель при размонтировании компонента:
    return () => {
      container.removeEventListener("scroll", updateMask);
    };
  }, [chatMessages]); // перезапускаем, если пришли новые сообщения

  // Автоскролл вниз при новом сообщении:
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <ul className="chatScreenMessages" ref={containerRef}>
      {chatMessages.map((m, i) => (
        <li key={i} className={m.isOutgoing ? "outgoing" : "incoming"}>
          {m.senderName}: {m.text}
        </li>
      ))}
    </ul>
  );
};

export default Messages;
