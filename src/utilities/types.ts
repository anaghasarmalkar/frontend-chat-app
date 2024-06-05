export type Room = {
  room_uuid: string;
  name: string;
  description?: string;
  admins: string[];
  created_by_user: string;
  welcome_message: string;
  messages: any[];
  is_deleted: boolean;
};

export type Message = {
  message_uuid: string;
  message: string;
  timestamp: string;
  sender: string;
};

export enum CurrentSectionType {
  Welcome,
  NewRoom,
  JoinedRoom,
  AskToJoinRoom,
}
