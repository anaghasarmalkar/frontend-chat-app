import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import Button from "@mui/material/Button";

type NewRoomProps = {
  websocket: WebSocket | null;
  userUUID: string;
};

type ValidationErrorState = {
  name: {
    isError: boolean;
    displayMsg?: string;
  };
};

const initialValidationErrorState: ValidationErrorState = {
  name: {
    isError: false,
  },
};

export const defaultTextFieldValue = "";

export default function NewRoom({ websocket, userUUID }: NewRoomProps) {
  const [name, setName] = useState<string>(defaultTextFieldValue);
  const [description, setDescription] = useState<string>(defaultTextFieldValue);
  const [validationErrorState, setValidationErrorState] =
    useState<ValidationErrorState>(initialValidationErrorState);

  const handleValidation = () => {
    let isFormValid = false;
    if (name === "") {
      setValidationErrorState((prevState) => {
        const newState = { ...prevState };
        newState.name.isError = true;
        newState.name.displayMsg = "Name cannot be empty.";
        return newState;
      });
    } else {
      setValidationErrorState((prevState) => {
        const newState = { ...prevState };
        newState.name.isError = false;
        delete newState.name.displayMsg;
        return newState;
      });
      isFormValid = true;
    }
    return isFormValid;
  };

  const handleSubmit = () => {
    if (websocket !== null) {
      const event = {
        entity: "room",
        action: "create",
        username: userUUID,
        entity_data: {
          name: name,
          description: description,
        },
      };
      websocket.send(JSON.stringify(event));
    }
  };
  return (
    // Maybe make this a Dialog component instead.
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      noValidate
      autoComplete="off"
    >
      <Box component="div">
        <TextField
          required
          error={validationErrorState.name.isError}
          id="outlined-required"
          label="Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          helperText={validationErrorState.name.displayMsg}
        />
        <TextField
          id="outlined-multiline-flexible"
          label="Description"
          multiline
          maxRows={4}
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDescription(e.target.value)
          }
        />
      </Box>
      <Box component="div" sx={{}}>
        <Button
          variant="outlined"
          onClick={() => {
            if (handleValidation()) {
              handleSubmit();
              setName(defaultTextFieldValue);
              setDescription(defaultTextFieldValue);
            }
          }}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setName(defaultTextFieldValue);
            setDescription(defaultTextFieldValue);
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}
