import { Message, Room } from "@/utilities/types";
import { useCallback, useEffect, useState } from "react";

export function useReceivedData(token: string) {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [createdRooms, setCreatedRooms] = useState<Room[]>([]);
  // const [roomChat, setRoomChat] = useState<Map<string, Set<Message>>>();

  const getRooms = useCallback(async () => {
    try {
      const response = await fetch("http://0.0.0.0:8081/api/rooms", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      switch (response.status) {
        case 200:
          const data = await response.json();
          setAvailableRooms(data.data.available);
          setJoinedRooms(data.data.joined);
          setCreatedRooms(data.data.created);
          break;
        default:
          break;
      }
    } catch (error) {
      // How to show an alert when POST fails? Because browser makes OPTIONS request and that fails so POST is never called and we dont reach here
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    getRooms();
  }, [getRooms]);
  return { availableRooms, joinedRooms, createdRooms };
}
