export type Room = {
  id: string;
  name: string;
  description: string;
  created: number;
  created_by: number;
  messages: Message[];
};

export type Message = {
  uid: string;
  message: string;
  room_id: number;
  sent: string;
  sender: string;
};

export enum CurrentSectionType {
  Welcome,
  NewRoom,
  JoinedRoom,
  AskToJoinRoom,
}

export type User = {
  email: string;
};
