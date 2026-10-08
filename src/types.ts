export type Chat = {
  chatId: string;
  name: string;
  avatar: string;
};

export type Message = {
  chatId: string;
  chatName: string;
  senderName: string;
  text: string;
  isOutgoing: boolean;
};

export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};
