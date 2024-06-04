"use client";

import styles from "./page.module.css";
import { useEffect, useMemo, useState, ChangeEvent, ReactNode } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { v4 as uuidv4 } from "uuid";
import {
  AppBar,
  Box,
  Collapse,
  CssBaseline,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import GroupIcon from "@mui/icons-material/Group";
import NewRoom from "@/components/NewRoom";
import ChatRoom from "@/components/ChatRoom";
import AskToJoin from "@/components/AskToJoin";

type Room = {
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

  const [availableRoomsOpen, setAvailableRoomsOpen] = useState<boolean>(true);
  const [joinedRoomsOpen, setJoinedRoomsOpen] = useState<boolean>(true);

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
  const drawerWidth = 240;

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
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Room Name and Details
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Chats
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          <ListItem key={"Search Rooms"}>
            <TextField id="outlined-basic" label="Search" variant="outlined" />
          </ListItem>
          <Divider />
          <ListItem
            key={"New Room"}
            disablePadding
            onClick={() => {
              setCurrentWindowType(CurrentWindowType.NewRoom);
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <AddIcon>Create a new room</AddIcon>
              </ListItemIcon>
              <ListItemText primary={"New Room"} />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem
            key={"Joined Rooms"}
            disablePadding
            onClick={() => setJoinedRoomsOpen(!joinedRoomsOpen)}
          >
            <ListItemButton>
              <ListItemIcon>
                <FavoriteIcon />
              </ListItemIcon>
              <ListItemText primary={"Joined Rooms"} />
              {joinedRoomsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse
            style={{ maxHeight: "500px", overflowY: "scroll" }}
            in={joinedRoomsOpen}
            timeout="auto"
            unmountOnExit
          >
            <List className={styles.room} component="div" disablePadding>
              {joinedRooms.map((room) => (
                <ListItem
                  key={room.room_uuid}
                  onClick={() => {
                    setCurrentWindowType(CurrentWindowType.JoinedRoom);
                    setCurrentRoom(room.room_uuid);
                  }}
                >
                  <ListItemButton sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText primary={room.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          <Divider />
          <ListItem
            key={"Available Rooms"}
            disablePadding
            onClick={() => setAvailableRoomsOpen(!availableRoomsOpen)}
          >
            <ListItemButton>
              <ListItemIcon>
                <EventAvailableIcon />
              </ListItemIcon>
              <ListItemText primary={"Available Rooms"} />
              {availableRoomsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse
            style={{ maxHeight: "500px", overflowY: "scroll" }}
            in={availableRoomsOpen}
            timeout="auto"
            unmountOnExit
          >
            <List className={styles.room} component="div" disablePadding>
              {availableRooms.map((room) => (
                <ListItem
                  key={room.room_uuid}
                  onClick={() => {
                    setCurrentWindowType(CurrentWindowType.AskToJoinRoom);
                    setCurrentRoom(room.room_uuid);
                  }}
                >
                  <ListItemButton sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText primary={room.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>
      <Box
        component="div"
        sx={{
          bgcolor: "background.default",
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          display: "flex",
        }}
      >
        {windowComponent}
      </Box>
    </Box>
  );
}
