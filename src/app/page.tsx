"use client";

import { useEffect, useMemo, useState, ChangeEvent, ReactNode } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import NewRoom from "@/components/NewRoom";
import ChatRoom from "@/components/ChatRoom";
import AskToJoin from "@/components/AskToJoin";
import Header from "@/components/Header";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import RoomsList from "@/components/RoomList";
import SearchIcon from "@mui/icons-material/Search";
// types folder
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

export enum CurrentWindowType {
  Welcome,
  NewRoom,
  JoinedRoom,
  AskToJoinRoom,
}

export default function Home() {
  const [currentWindowType, setCurrentWindowType] = useState<CurrentWindowType>(
    CurrentWindowType.Welcome
  );
  const [currentRoom, setCurrentRoom] = useState<string>("");

  const userUUID = useMemo(() => uuidv4(), []);
  const initEvent = useMemo(() => {
    return {
      entity: "server",
      action: "init",
      username: userUUID,
    };
  }, [userUUID]);

  const { websocket, receivedData } = useWebSocket(
    "ws://localhost:8000/",
    initEvent
  );

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);

  const [roomChat, setRoomChat] = useState<Map<string, Set<Message>>>();

  // Take hook out
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
  const drawerWidth = 250;

  // Seaparate component
  let windowComponent: ReactNode;

  switch (currentWindowType) {
    case CurrentWindowType.NewRoom:
      windowComponent = (
        <NewRoom websocket={websocket} userUUID={userUUID}></NewRoom>
      );
      break;
    case CurrentWindowType.JoinedRoom:
      windowComponent = (
        <ChatRoom
          websocket={websocket}
          userUUID={userUUID}
          roomUUID={currentRoom}
          messages={roomChat?.get(currentRoom) || new Set<Message>()}
        ></ChatRoom>
      );
      break;
    case CurrentWindowType.AskToJoinRoom:
      windowComponent = (
        <AskToJoin
          websocket={websocket}
          userUUID={userUUID}
          roomUUID={currentRoom}
          handleCurrentWindowState={(windowState: CurrentWindowType) =>
            setCurrentWindowType(windowState)
          }
          handleSetCurrentRoom={(roomUUID: string) => setCurrentRoom(roomUUID)}
        ></AskToJoin>
      );
      break;
    case CurrentWindowType.Welcome:
      windowComponent = <Typography paragraph>Welcome page</Typography>;
      break;
    default:
      windowComponent = <Typography paragraph>Welcome page</Typography>;
      break;
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100vh">
      <CssBaseline />
      <Box display="flex" flexDirection="row" alignItems="center">
        <Box width={drawerWidth}>
          <Header title="Chats">
            <Tooltip title="Create New Room" arrow>
              <IconButton
                aria-label="create-room"
                onClick={() => {
                  setCurrentWindowType(CurrentWindowType.NewRoom);
                }}
              >
                <CreateOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Header>
        </Box>
        <Divider orientation="vertical" />
        <Box flexGrow="1">
          <Header title="Room Name and Details"></Header>
        </Box>
      </Box>
      <Divider />
      <Box
        display="flex"
        flexDirection="row"
        flexGrow="1"
        height="100%"
        overflow="hidden"
      >
        <Box width={drawerWidth} display="flex" flexDirection="column">
          <Box padding="0.75rem">
            <TextField
              variant="outlined"
              placeholder="Search Rooms"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            ></TextField>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            flexGrow="1"
            overflow="auto"
          >
            <Divider />
            <RoomsList
              title={"Joined Rooms"}
              roomsList={joinedRooms}
              handleRoomClick={(uuid: string) => {
                setCurrentWindowType(CurrentWindowType.JoinedRoom);
                setCurrentRoom(uuid);
              }}
            />
            <Divider />
            <RoomsList
              title={"Available Rooms"}
              roomsList={availableRooms}
              handleRoomClick={(uuid: string) => {
                setCurrentWindowType(CurrentWindowType.AskToJoinRoom);
                setCurrentRoom(uuid);
              }}
            />
            <Divider />
          </Box>
        </Box>
        <Divider orientation="vertical" />
        <Box flexGrow="1">{windowComponent}</Box>
      </Box>
    </Box>
  );
}
