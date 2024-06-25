"use client";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextField,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { useFormik } from "formik";
import Loader from "@/components/Loader";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Errors from "./errors";
import Link from "next/link";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password should be of minimum 8 characters length")
    .required("Password is required"),
});

export default function Page() {
  const router = useRouter();

  const [errors, setErrors] = useState<string[]>([]);
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("http://0.0.0.0:8081/user/signup", {
          method: "POST",
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/json",
          },
        });

        switch (response.status) {
          case 201:
            router.push("/login?user_created=success");
            break;
          case 400:
            setErrors(["User already exists. Please login."]);
            break;
          case 422:
            // Validation errors
            const validationErrors = (await response.json()).detail;
            const errorList: any[] = [];
            validationErrors.map((err: any) => {
              errorList.push(err.ctx.reason);
            });
            setErrors(errorList);
            break;
          default:
            break;
        }
      } catch (error) {
        // for errors pertaining to connecting with the backend (eg internet fails)
        setErrors([
          "An error occurred when submitting the form. Please refresh the page and try again.",
        ]);
      }
    },
  });

  return formik.isSubmitting ? (
    <Loader label="Submitting" />
  ) : (
    <Box
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
        <CardContent>
          <CardHeader
            disableTypography
            title={
              <Typography noWrap variant="h5" align="center">
                <Box sx={{ fontWeight: "bold" }}>Sign Up</Box>
              </Typography>
            }
            subheader={
              <Typography noWrap align="center">
                Already have an account?{" "}
                <Link style={{ color: "#4287f5" }} href="/login">
                  Log In
                </Link>
              </Typography>
            }
          />
          <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <TextField
                required
                id="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                required
                id="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
            </Box>

            <CardActions sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                type="submit"
                color="success"
                disabled={formik.isSubmitting}
              >
                Sign Up
              </Button>
              <Button variant="contained" type="reset" color="error">
                Clear
              </Button>
            </CardActions>
            {errors.length !== 0 && <Errors messages={errors} />}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
