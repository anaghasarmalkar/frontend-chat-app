"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { v4 as uuidv4 } from "uuid";
import {
  Avatar,
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
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 250;

export default function Home() {
  const name = `${"Test Name".split(" ")[0][0]}${"Test Name".split(" ")[1][0]}`;
  const router = useRouter();
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const access_token = localStorage.getItem("token");
    if (access_token !== null && access_token !== "") {
      setToken(access_token);
    } else {
      router.push("/login");
    }
  }, [router, token]);
  const [requestedSection, setRequestedSection] = useState<CurrentSectionType>(
    CurrentSectionType.Welcome
  );
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

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

  const handleSetCurrentRoom = useCallback(
    (room: Room) => setCurrentRoom(room),
    []
  );

  const handleClearRoom = useCallback(() => setCurrentRoom(null), []);

  const handleJoinedRoomClick = useCallback((room: Room) => {
    setRequestedSection(CurrentSectionType.JoinedRoom);
    setCurrentRoom(room);
  }, []);

  const handleAvailableRoomClick = useCallback((room: Room) => {
    setRequestedSection(CurrentSectionType.AskToJoinRoom);
    setCurrentRoom(room);
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("http://0.0.0.0:8081/token/revoke", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      switch (response.status) {
        case 200:
          localStorage.removeItem("token");
          setToken("");
          break;
        default:
          break;
      }
    } catch (error) {
      // How to show an alert when POST fails? Because browser makes OPTIONS request and that fails so POST is never called and we dont reach here
      console.error(error);
    }
  }

  // Its annoying to separate component and send data as props. too many props
  const ResultComponent = useCallback(() => {
    let goToDefault = false;
    const defaultPage = <Typography paragraph>Welcome page</Typography>;

    switch (requestedSection) {
      case CurrentSectionType.NewRoom:
        return <NewRoom websocket={websocket} userUUID={userUUID} />;
      case CurrentSectionType.JoinedRoom:
        if (currentRoom) {
          return (
            <ChatRoom
              websocket={websocket}
              userUUID={userUUID}
              roomUUID={currentRoom.room_uuid}
              messages={
                roomChat?.get(currentRoom.room_uuid) || new Set<Message>()
              }
            />
          );
        } else {
          goToDefault = true;
          break;
        }

      case CurrentSectionType.AskToJoinRoom:
        if (currentRoom) {
          return (
            <AskToJoin
              websocket={websocket}
              userUUID={userUUID}
              room={currentRoom}
              handleCurrentWindowState={(windowState: CurrentSectionType) =>
                setRequestedSection(windowState)
              }
              handleSetCurrentRoom={handleSetCurrentRoom}
              handleClearRoom={handleClearRoom}
            />
          );
        } else {
          goToDefault = true;
          break;
        }

      case CurrentSectionType.Welcome:
        return <Typography paragraph>Welcome page</Typography>;
      default:
        return defaultPage;
    }

    if (goToDefault) {
      return defaultPage;
    }
  }, [
    currentRoom,
    handleClearRoom,
    handleSetCurrentRoom,
    requestedSection,
    roomChat,
    userUUID,
    websocket,
  ]);

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100vh">
      <CssBaseline />
      {token !== "" ? (
        <>
          <Box display="flex" flexDirection="row" alignItems="center">
            <Box width={drawerWidth} minWidth={drawerWidth}>
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
              <Divider />
            </Box>
            <Divider orientation="vertical" />
            {currentRoom && (
              <Box flexGrow="1" sx={{ width: `calc(100% - ${drawerWidth}px)` }}>
                {/* Default can be last accessed room/latest chat */}
                <Header
                  title={currentRoom.name}
                  description={currentRoom.description}
                >
                  <Tooltip title="Leave group" arrow>
                    <IconButton
                      aria-label="leave-group"
                      onClick={() => {
                        // send message "leave" to websocket
                        // Remove from joined rooms list / or that will update when server sends response for leave
                        handleClearRoom();
                      }}
                    >
                      <GroupRemoveIcon />
                    </IconButton>
                  </Tooltip>
                </Header>
                <Divider />
              </Box>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            flexGrow="1"
            height="100%"
            overflow="hidden"
          >
            <Box
              width={drawerWidth}
              minWidth={drawerWidth}
              display="flex"
              flexDirection="column"
            >
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
                  handleRoomClick={handleJoinedRoomClick}
                />
                <Divider />
                <RoomsList
                  title={"Available Rooms"}
                  roomsList={availableRooms}
                  handleRoomClick={handleAvailableRoomClick}
                />
                <Divider />
              </Box>
              <Box
                padding="0.75rem"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Avatar alt="" src="">
                  {name}
                </Avatar>
                <Typography>Test Name</Typography>
                <Tooltip title="Log out" arrow>
                  <IconButton aria-label="log-out" onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Divider orientation="vertical" />
            <Box flexGrow="1" sx={{ width: `calc(100% - ${drawerWidth}px)` }}>
              <ResultComponent />
            </Box>
          </Box>
        </>
      ) : (
        <Loader label="Authenticating..." />
      )}
    </Box>
  );
}
