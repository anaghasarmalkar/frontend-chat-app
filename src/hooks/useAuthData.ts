import { useEffect, useState } from "react";

function getAuthData() {
  return localStorage.getItem("token");
}

export function useAuthData() {
  const [authToken, setAuthToken] = useState(getAuthData());

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      if (token && token !== null && token !== "") {
        setAuthToken(token);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return authToken;
}
