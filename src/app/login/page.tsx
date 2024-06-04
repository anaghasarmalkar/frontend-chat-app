"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldValidationErrorState = {
  isError: boolean;
  displayMsg?: string;
};
type ValidationErrorState = {
  username: FieldValidationErrorState;
  password: FieldValidationErrorState;
};

const initialValidationErrorState: ValidationErrorState = {
  username: {
    isError: false,
  },
  password: {
    isError: false,
  },
};

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginErrors, setLoginErrors] = useState<string>("");
  const [validationErrorState, setValidationErrorState] =
    useState<ValidationErrorState>(initialValidationErrorState);

  async function handleLogin() {
    const response = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    switch (response.status) {
      case 200:
        router.push("/");
        break;
      default:
        setUsername("");
        setPassword("");
        setLoginErrors("Invalid login credentials.");
        router.push("/login");
    }
  }

  const handleValidation = () => {
    let isFormValid = false;
    if (username === "") {
      setValidationErrorState((prevState) => {
        const newState = { ...prevState };
        newState.username.isError = true;
        newState.username.displayMsg = "Username cannot be empty.";
        return newState;
      });
      isFormValid = false;
    } else {
      setValidationErrorState((prevState) => {
        const newState = { ...prevState };
        newState.username.isError = false;
        delete newState.username.displayMsg;
        return newState;
      });
      isFormValid = true;
    }
    if (password === "") {
      setValidationErrorState((prevState) => {
        const newState = { ...prevState };
        newState.password.isError = true;
        newState.password.displayMsg = "Password cannot be empty.";
        return newState;
      });
      isFormValid = false;
    } else {
      setValidationErrorState((prevState) => {
        const newState = { ...prevState };
        newState.password.isError = false;
        delete newState.password.displayMsg;
        return newState;
      });
      isFormValid = true;
    }
    return isFormValid;
  };

  const handleClear = () => {
    setUsername("");
    setPassword("");
    setLoginErrors("");
  };
  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField
          required
          id="username-outlined-required"
          label="Username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUsername(e.target.value);
          }}
          helperText={validationErrorState.username.displayMsg}
          error={validationErrorState.username.isError}
        />
        <TextField
          required
          id="outlined-password-input"
          label="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
          }}
          helperText={validationErrorState.password.displayMsg}
          error={validationErrorState.password.isError}
        />
      </div>
      {loginErrors !== "" && (
        <Box component="div" sx={{ color: "red" }}>
          {loginErrors}
        </Box>
      )}
      <div>
        <Button
          variant="outlined"
          onClick={() => {
            if (handleValidation()) {
              handleLogin();
              setUsername("");
              setPassword("");
              setLoginErrors("");
            }
          }}
        >
          Log In
        </Button>
        <Button variant="outlined" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </Box>
  );
}
