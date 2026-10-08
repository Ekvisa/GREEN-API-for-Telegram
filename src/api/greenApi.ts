import type { Credentials, Message } from "../types";

type Notification = {
  receiptId: number;
  body: {
    typeWebhook: string;
    messageData: {
      typeMessage: string;
      textMessageData: { textMessage: string };
    };

    senderData: {
      chatId: string;
      chatName: string;
      senderName: string;
    };
  };
};

export const apiUrl = "https://4100.api.green-api.com";

export async function checkAccount(
  phoneNumber: string,
  credentials: Credentials,
) {
  const url = `${apiUrl}/waInstance${credentials.idInstance}/checkAccount/${credentials.apiTokenInstance}`;
  const data = {
    phoneNumber: Number(phoneNumber),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const result = await response.json();
    return result.chatId;
  } catch (error) {
    console.error("Ошибка проверки аккаунта:", error);
    throw error;
  }
}

export async function receiveNotification(credentials: Credentials) {
  console.log("RECEIVE START", Date.now());
  const url = `${apiUrl}/waInstance${credentials.idInstance}/receiveNotification/${credentials.apiTokenInstance}?receiveTimeout=5`;
  try {
    const response = await fetch(url);
    if (response.status === 408) {
      // если ничего не пришло через Timeout секунд
      console.log("response.status === 408");
      return null;
    }
    if (!response.ok) {
      // если не статус 200-299
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    // console.log("response.json():", response.json());
    return response.json();
  } catch (error) {
    // Сюда попадет ошибка сети или выброшенная выше ошибка HTTP:
    if (error instanceof Error) {
      console.error("Ошибка при получении уведомления:", error.message);
    } else {
      console.log("Неизвестная ошибка", error);
    }
    throw error; // пусть вызывающая функция тоже знает, что произошла ошибка
  }
}

export function processNotification(notification: Notification) {
  const { body, receiptId } = notification;

  const isIncoming = body.typeWebhook === "incomingMessageReceived";

  const isOutgoing = body.typeWebhook === "outgoingMessageReceived";

  if (
    // нам нужно уведомление о входящем сообщении (incomingMessageReceived) текстового типа (textMessage):

    (isIncoming || isOutgoing) &&
    body.messageData.typeMessage === "textMessage"
  ) {
    const { chatId, chatName, senderName } = body.senderData;
    const text = body.messageData.textMessageData.textMessage;
    const result = {
      receiptId,
      message: {
        chatId,
        chatName,
        senderName,
        text,
        isOutgoing: false,
      },
    };
    return result;
  } else {
    return {
      receiptId, //receiptId нам нужен для удаления, даже если сообщение неподходящее
      message: null,
    };
  }
}

export async function deleteNotification(
  receiptId: number,
  credentials: Credentials,
) {
  const url = `${apiUrl}/waInstance${credentials.idInstance}/deleteNotification/${credentials.apiTokenInstance}/${receiptId}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Ошибка удаления уведомления:", error);
    throw error;
  }
}

export function startPolling(
  onMessage: (message: Message) => void,
  credentials: Credentials,
) {
  console.log("START POLLING", Date.now());
  // при запуске polling мне дадут функцию onMessage(), которую я должен вызвать, когда получу подходящее сообщение
  let isPolling = true;

  async function pollNotifications() {
    console.log("POLLING LOOP START", Date.now());

    while (isPolling) {
      try {
        const notification = await receiveNotification(credentials);
        if (!notification) {
          console.log("Уведомлений нет, ждём дальше");
          continue;
        }
        console.log("Получили уведомление:", notification);
        const result = processNotification(notification);
        if (result.message) {
          console.log("Получили сообщение:", result.message); //!!
          onMessage(result.message);
        } else {
          console.log("Получили неподходящее уведомление");
        }
        const deleted = await deleteNotification(result.receiptId, credentials);
        console.log("Уведомление удалено:", deleted);
      } catch (error) {
        console.error("Ошибка polling:", error);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // немного подождать и попробовать снова
      }
    }
    console.log("=== POLLING STOP ===");
  }

  pollNotifications();
  return () => {
    isPolling = false;
  };
}

export async function sendMessage(
  chatID: string,
  text: string,
  credentials: Credentials,
) {
  console.log(`let's send a message ${text} to ${chatID}`);
  const url = `${apiUrl}/waInstance${credentials.idInstance}/sendMessage/${credentials.apiTokenInstance}`;
  const data = {
    chatID: chatID,
    message: text,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const result = await response.json();
    console.log(`result.idMessage: ${result.idMessage}`);

    return result.idMessage;
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);
    throw error;
  }
}

export async function getContactInfo(chatID: string, credentials: Credentials) {
  console.log("getContactInfo started");
  const url = `${apiUrl}/waInstance${credentials.idInstance}/GetContactInfo/${credentials.apiTokenInstance}`;
  const data = {
    chatID: chatID,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const result = await response.json();
    // const avatar = result.avatar ?
    console.log(
      `avatar: ${result.avatar || result.contactName[0]}, name: ${result.contactName}`,
    );
    return result;
  } catch (error) {
    console.error("Ошибка получения данных контакта:", error);
    throw error;
  }
}

type StateInstanceResponse = {
  stateInstance: string;
};

export async function getStateInstance(credentials: Credentials) {
  const url = `${apiUrl}/waInstance${credentials.idInstance}/getStateInstance/${credentials.apiTokenInstance}`;
  console.log(`url: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const result: StateInstanceResponse = await response.json();

    return result.stateInstance;
  } catch (error) {
    console.error("Ошибка проверки подключения:", error);
    throw error;
  }
}
