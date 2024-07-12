"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
// import { useWebSocket } from "@/hooks/useWebSocket";
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
import { CurrentSectionType, Message, Room, User } from "@/utilities/types";
// import ChatRoom from "@/components/ChatRoom";
// import AskToJoin from "@/components/AskToJoin";
import { useReceivedData } from "@/hooks/useReceivedData";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 250;

export default function Home() {
  // const name = `${"Test Name".split(" ")[0][0]}${"Test Name".split(" ")[1][0]}`;
  const [user, setUser] = useState<User>();
  const router = useRouter();
  const [token, setToken] = useState<string>("");

  const handleUserData = useCallback(async (access_token: string) => {
    try {
      const response = await fetch("http://0.0.0.0:8081/api/users", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });

      switch (response.status) {
        case 200:
          const data = await response.json();
          setUser(data);
          break;
        default:
          break;
      }
    } catch (error) {
      // How to show an alert when POST fails? Because browser makes OPTIONS request and that fails so POST is never called and we dont reach here
      console.error(error);
    }
  }, []);

  const handleTokenValidation = useCallback(
    async (access_token: string) => {
      try {
        const response = await fetch("http://0.0.0.0:8081/api/token/validate", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });

        switch (response.status) {
          case 401:
            localStorage.removeItem("token");
            router.push("/login");
            break;
          default:
            break;
        }
      } catch (error) {
        // How to show an alert when POST fails? Because browser makes OPTIONS request and that fails so POST is never called and we dont reach here
        console.error(error);
      }
    },
    [router]
  );

  useEffect(() => {
    const storageHandler = async () => {
      const access_token = localStorage.getItem("token");
      if (access_token && access_token !== null && access_token !== "") {
        // check if token is valid
        await handleTokenValidation(access_token);
        // TODO: Should be set after login, inside the global state
        await handleUserData(access_token);
        setToken(access_token);
      } else {
        router.push("/login");
      }
    };

    storageHandler();

    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("storage", storageHandler);
    };
  }, [handleTokenValidation, handleUserData, router]);

  const [requestedSection, setRequestedSection] = useState<CurrentSectionType>(
    CurrentSectionType.Welcome
  );
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const { availableRooms, joinedRooms, createdRooms } = useReceivedData(token);

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
      const response = await fetch("http://0.0.0.0:8081/api/token/revoke", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      switch (response.status) {
        case 200:
          localStorage.removeItem("token");
          // A StorageEvent is sent to a window when a storage area it has access to is changed within the context of another document.
          router.push("/login");
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
  const ResultComponent = useCallback(
    () => {
      let goToDefault = false;
      const defaultPage = <Typography paragraph>Welcome page</Typography>;

      switch (requestedSection) {
        case CurrentSectionType.NewRoom:
          return <NewRoom token={token} />;
        case CurrentSectionType.JoinedRoom:
          if (currentRoom) {
            // return (
            //   <ChatRoom
            //     websocket={websocket}
            //     userUUID={userUUID}
            //     roomUUID={currentRoom.id}
            //     messages={roomChat?.get(currentRoom.id) || new Set<Message>()}
            //   />
            // );
          } else {
            goToDefault = true;
            break;
          }

        case CurrentSectionType.AskToJoinRoom:
          if (currentRoom) {
            // return (
            //   <AskToJoin
            //     websocket={websocket}
            //     userUUID={userUUID}
            //     room={currentRoom}
            //     handleCurrentWindowState={(windowState: CurrentSectionType) =>
            //       setRequestedSection(windowState)
            //     }
            //     handleSetCurrentRoom={handleSetCurrentRoom}
            //     handleClearRoom={handleClearRoom}
            //   />
            // );
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
    },
    [
      // currentRoom,
      // handleClearRoom,
      // handleSetCurrentRoom,
      // requestedSection,
      // roomChat,
      // userUUID,
      // websocket,
    ]
  );

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
                <Avatar alt="" src=""></Avatar>
                <Typography>{user?.email}</Typography>
                <Tooltip title="Log out" arrow>
                  <IconButton
                    aria-label="log-out"
                    onClick={async () => await handleLogout()}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Divider orientation="vertical" />
            <Box flexGrow="1" sx={{ width: `calc(100% - ${drawerWidth}px)` }}>
              {/* <ResultComponent /> */}
            </Box>
          </Box>
        </>
      ) : (
        <Loader label="Authenticating..." />
      )}
    </Box>
  );
}
