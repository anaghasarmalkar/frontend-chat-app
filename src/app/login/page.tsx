"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import Errors from "../signup/errors";
import { useAuthData } from "@/hooks/useAuthData";
import SuccessfulUserCreation from "./SuccessfulUserCreation";

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
  const authToken = useAuthData();
  useEffect(() => {
    if (authToken) {
      if (authToken !== "") {
        router.push("/");
      }
    }
  }, [authToken, router]);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [validationErrorState, setValidationErrorState] =
    useState<ValidationErrorState>(initialValidationErrorState);

  async function handleLogin() {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const response = await fetch("http://0.0.0.0:8081/api/token", {
        method: "POST",
        body: formData,
      });
      switch (response.status) {
        case 200:
          const data = await response.json();
          const token = data.access_token;
          localStorage.setItem("token", token);
          router.push("/");
          break;
        default:
          setUsername("");
          setPassword("");
          setErrors(["Invalid login credentials."]);
          router.push("/login");
          break;
      }
    } catch (error) {
      setErrors([
        "An error occurred while logging in. Please refresh the page and try again.",
      ]);
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
    setErrors([]);
  };
  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100vh"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
    >
      <Card raised sx={{ maxWidth: 400 }}>
        <CardHeader
          disableTypography
          title={
            <Typography noWrap variant="h5" align="center">
              <Box sx={{ fontWeight: "bold" }}>Log In</Box>
            </Typography>
          }
          subheader={
            <Typography noWrap align="center">
              Don&apos;t have an account?{" "}
              <Link style={{ textDecoration: "none" }} href="/signup">
                Sign Up
              </Link>
            </Typography>
          }
        />
        <Divider />
        <CardContent>
          <Suspense>
            <SuccessfulUserCreation />
          </Suspense>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TextField
              required
              id="email-outlined-required"
              label="Email"
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
          </Box>
        </CardContent>
        {errors.length !== 0 && (
          <>
            <Divider />
            <Errors messages={errors} />
          </>
        )}
        <CardActions
          sx={{ display: "flex", justifyContent: "center", padding: "16px" }}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (handleValidation()) {
                handleLogin();
                setUsername("");
                setPassword("");
              }
              setErrors([]);
            }}
          >
            Log In
          </Button>
          <Button variant="contained" color="error" onClick={handleClear}>
            Clear
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
