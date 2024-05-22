"use client";

import * as changeKeys from "change-case/keys";
import styles from "./page.module.css";
import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { v4 as uuidv4 } from "uuid";
import Dialog from "@mui/material/Dialog";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Collapse,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Drawer from "@mui/material/Drawer";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import GroupIcon from "@mui/icons-material/Group";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

type Message = {
  message_uuid: string;
  message: string;
  timestamp: string;
  sender: string;
};

export default function Home() {
  const [latestMessage, setLatestMessage] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<string>("");

  const handleSendMessage = () => {
    if (latestMessage !== "" && websocket !== null) {
      const message_event = {
        entity: "room",
        action: "message",
        username: userUUID,
        entity_data: {
          room_uuid: currentRoom,
          message: latestMessage,
        },
      };
      websocket.send(JSON.stringify(message_event));
      setLatestMessage("");
    }
  };
  const [openChat, setOpenChat] = useState(false);
  const handleOpenChat = () => {
    setOpenChat(true);
  };
  const handleCloseChat = () => {
    setOpenChat(false);
  };
  const userUUID = useMemo(() => uuidv4(), []);
  const initEvent = useMemo(() => {
    return {
      entity: "server",
      action: "init",
      username: userUUID,
    };
  }, [userUUID]);

  console.log(initEvent);
  const { websocket, receivedData } = useWebSocket(
    "ws://localhost:8000/",
    initEvent
  );

  const handleClick = () => {
    if (websocket !== null) {
      const event = {
        entity: "room",
        action: "create",
        username: userUUID,
        entity_data: {
          name: `Test Room ${Math.floor(Math.random() * 100)}`,
          description: "Test Room description",
        },
      };
      websocket.send(JSON.stringify(event));
    }
  };

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);

  const [roomChat, setRoomChat] = useState(new Map<string, Message[]>());

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
        if (receivedData.entity_data.joined !== null) {
          setJoinedRooms(receivedData.entity_data.joined);
        }
        if (receivedData.entity_data.available !== null) {
          setAvailableRooms(receivedData.entity_data.available);
        }
      }
      // if (
      //   receivedData.action === "message" &&
      //   receivedData.result === "success"
      // ) {
      //   if (receivedData.entity_data !== null) {
      //     const { room_uuid, message } = receivedData.entity_data;
      //     setRoomChat((prev) => {
      //       const newMap = new Map(prev);
      //       const currentMessages = newMap.get(room_uuid) || [];
      //       currentMessages.push(message);
      //       newMap.set(room_uuid, currentMessages);
      //       return newMap;
      //     });
      //   }
      // }
    }
  }, [
    receivedData,
    receivedData?.entity,
    receivedData?.action,
    receivedData?.result,
    receivedData?.entity_data,
  ]);
  const drawerWidth = 240;
  console.log({ receivedData, availableRooms, joinedRooms, roomChat });
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
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
          <ListItem key={"New Room"} disablePadding onClick={handleClick}>
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
                <ListItem key={room.room_uuid}>
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
                <ListItem key={room.room_uuid}>
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
    </Box>
    // <main className={styles.main}>
    //   <div className={styles.roomsContainer}>
    //     <div className={styles.createRoom}>
    //       <button onClick={handleClick}>Create a new room</button>
    //     </div>
    //     <div className={styles.room}>
    //       <p>Available Rooms</p>
    //       <ul>
    //         {availableRooms.map((room) => (
    //           <div key={room.room_uuid}>
    //             <li>{room.name}</li>
    //             <button
    //               onClick={() => {
    //                 if (websocket !== null) {
    //                   const event = {
    //                     entity: "room",
    //                     action: "delete",
    //                     username: userUUID,
    //                     entity_data: {
    //                       room_uuid: room.room_uuid,
    //                     },
    //                   };
    //                   websocket.send(JSON.stringify(event));
    //                 }
    //               }}
    //             >
    //               Delete
    //             </button>
    //             <button
    //               onClick={() => {
    //                 if (websocket !== null) {
    //                   const event = {
    //                     entity: "room",
    //                     action: "join",
    //                     username: userUUID,
    //                     entity_data: {
    //                       room_uuid: room.room_uuid,
    //                     },
    //                   };
    //                   websocket.send(JSON.stringify(event));
    //                 }
    //               }}
    //             >
    //               Join
    //             </button>
    //           </div>
    //         ))}
    //       </ul>
    //     </div>
    //     <div className={styles.room}>
    //       <p>Joined Rooms</p>
    //       <ul>
    //         {joinedRooms.map((room) => (
    //           <li
    //             key={room.room_uuid}
    //             onClick={() => {
    //               handleOpenChat();
    //               setCurrentRoom(room.room_uuid);
    //             }}
    //           >
    //             {room.name}
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //     {/* <Dialog open={openChat} onClose={handleCloseChat}>
    //       <Box
    //         sx={{
    //           width: 300,
    //           height: 200,
    //           borderRadius: 2,
    //           border: "2px solid grey",
    //           padding: 1,
    //           position: "relative",
    //         }}
    //         component="section"
    //       >
    //         {roomChat.get(currentRoom)?.map((msg) => {
    //           console.log("msg", msg);
    //           return (
    //             <div key={msg.message_uuid}>
    //               <p>{msg.sender}</p>
    //               <p>{msg.message}</p>
    //             </div>
    //           );
    //         })}
    //         <div
    //           style={{
    //             width: "95%",
    //             borderRadius: 15,
    //             border: "1px solid grey",
    //             position: "absolute",
    //             bottom: 1,
    //           }}
    //         >
    //           <TextField
    //             sx={{
    //               "& > :not(style)": { m: 1 },
    //             }}
    //             id="outlined-basic"
    //             variant="outlined"
    //             value={latestMessage}
    //             onChange={
    //               (event: ChangeEvent<HTMLInputElement>) =>
    //                 setLatestMessage(event.target.value)
    //               // handleInput(e.target.value)
    //             }
    //           />
    //           <IconButton aria-label="send" onClick={handleSendMessage}>
    //             <SendIcon />
    //           </IconButton>
    //         </div>
    //       </Box>
    //     </Dialog> */}
    //   </div>
    //   <div className={styles.window}>Chat window</div>
    //   {/* <div>Search new Room?</div> */}
    //   {/* <ChatWindow /> */}
    // </main>
  );
}
