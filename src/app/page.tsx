"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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

import Header from "@/components/Header";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import RoomsList from "@/components/RoomList";
import SearchIcon from "@mui/icons-material/Search";
import { CurrentSectionType, Message, Room } from "@/utilities/types";
import ChatRoom from "@/components/ChatRoom";
import AskToJoin from "@/components/AskToJoin";
import { useReceivedData } from "@/hooks/useReceivedData";

export default function Home() {
  const [requestedSection, setRequestedSection] = useState<CurrentSectionType>(
    CurrentSectionType.Welcome
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

  const { availableRooms, joinedRooms, roomChat } =
    useReceivedData(receivedData);

  const drawerWidth = 250;

  // Its annoying to separate component and send data as props. too many props
  const ResultComponent = useCallback(() => {
    switch (requestedSection) {
      case CurrentSectionType.NewRoom:
        return <NewRoom websocket={websocket} userUUID={userUUID} />;
      case CurrentSectionType.JoinedRoom:
        return (
          <ChatRoom
            websocket={websocket}
            userUUID={userUUID}
            roomUUID={currentRoom}
            messages={roomChat?.get(currentRoom) || new Set<Message>()}
          />
        );
      case CurrentSectionType.AskToJoinRoom:
        return (
          <AskToJoin
            websocket={websocket}
            userUUID={userUUID}
            roomUUID={currentRoom}
            handleCurrentWindowState={(windowState: CurrentSectionType) =>
              setRequestedSection(windowState)
            }
            handleSetCurrentRoom={(roomUUID: string) =>
              setCurrentRoom(roomUUID)
            }
          />
        );
      case CurrentSectionType.Welcome:
        return <Typography paragraph>Welcome page</Typography>;
      default:
        return <Typography paragraph>Welcome page</Typography>;
    }
  }, [currentRoom, requestedSection, roomChat, userUUID, websocket]);

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
                  setRequestedSection(CurrentSectionType.NewRoom);
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
                setRequestedSection(CurrentSectionType.JoinedRoom);
                setCurrentRoom(uuid);
              }}
            />
            <Divider />
            <RoomsList
              title={"Available Rooms"}
              roomsList={availableRooms}
              handleRoomClick={(uuid: string) => {
                setRequestedSection(CurrentSectionType.AskToJoinRoom);
                setCurrentRoom(uuid);
              }}
            />
            <Divider />
          </Box>
        </Box>
        <Divider orientation="vertical" />
        <Box flexGrow="1">
          <ResultComponent />
        </Box>
      </Box>
    </Box>
  );
}
