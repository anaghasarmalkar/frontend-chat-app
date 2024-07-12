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
  Typography,
} from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import GroupIcon from "@mui/icons-material/Group";
import { Room } from "@/utilities/types";

type RoomsListProps = {
  title: string;
  roomsList: Room[];
  handleRoomClick: (room: Room) => void;
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

  const handleChange = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <Accordion
      disableGutters
      square
      expanded={expanded}
      onChange={handleChange}
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
        <Typography sx={{ marginLeft: "1rem" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List component="ul" disablePadding>
          {roomsList.map((room) => (
            <ListItem key={room.id} component="li">
              <ListItemButton
                onClick={() => {
                  handleRoomClick(room);
                }}
              >
                {roomIcon ? (
                  <ListItemIcon style={{ minWidth: "40px" }}>
                    {roomIcon}
                  </ListItemIcon>
                ) : (
                  <GroupIcon />
                )}
                <ListItemText primary={room.name} sx={{ marginLeft: "1rem" }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
