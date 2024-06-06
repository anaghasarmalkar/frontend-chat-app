import { Message, Room } from "@/utilities/types";
import { useEffect, useState } from "react";

export function useReceivedData(receivedData: any) {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [roomChat, setRoomChat] = useState<Map<string, Set<Message>>>();

  useEffect(() => {
    if (
      receivedData &&
      receivedData.entity === "server" &&
      receivedData.action === "init" &&
      receivedData.result === "success"
    ) {
      console.log("Connected to server.");
    }
    if (
      receivedData &&
      receivedData.entity === "room" &&
      receivedData.result === "success"
    ) {
      if (receivedData.entity_data !== null) {
        if (!!receivedData.entity_data.joined) {
          setJoinedRooms(receivedData.entity_data.joined);
        }
        if (!!receivedData.entity_data.available) {
          setAvailableRooms(receivedData.entity_data.available);
        }
      }
      if (
        receivedData.action === "message" &&
        receivedData.result === "success"
      ) {
        if (receivedData.entity_data !== null) {
          const { room_uuid, message } = receivedData.entity_data;
          setRoomChat((prev) => {
            const newMap = new Map(prev);
            if (!newMap.has(room_uuid)) {
              newMap.set(room_uuid, new Set<Message>());
            }
            newMap.get(room_uuid)?.add(message);
            return newMap;
          });
        }
      }
    }
  }, [
    receivedData,
    receivedData?.entity,
    receivedData?.action,
    receivedData?.result,
    receivedData?.entity_data,
  ]);
  return { availableRooms, joinedRooms, roomChat };
}
