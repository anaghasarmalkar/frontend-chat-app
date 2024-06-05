import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIconProps,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import GroupIcon from "@mui/icons-material/Group";
import { Room } from "@/utilities/types";

type RoomsListProps = {
  title: string;
  roomsList: Room[];
  handleRoomClick: (uuid: string) => void;
  roomIcon?: ReactElement<SvgIconProps>;
};

export default function RoomsList({
  title,
  roomsList,
  handleRoomClick,
  roomIcon,
}: RoomsListProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  useEffect(() => {
    if (roomsList.length !== 0) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [roomsList]);

  return (
    <Accordion
      disableGutters
      square
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ boxShadow: "none" }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
        }}
      >
        {title}
      </AccordionSummary>
      <AccordionDetails>
        <List component="ul" disablePadding>
          {roomsList.map((room) => (
            <ListItem
              key={room.room_uuid}
              component="li"
              onClick={() => {
                handleRoomClick(room.room_uuid);
              }}
            >
              <ListItemButton
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {roomIcon ? (
                  <ListItemIcon>{roomIcon}</ListItemIcon>
                ) : (
                  <GroupIcon />
                )}

                <ListItemText primary={room.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
