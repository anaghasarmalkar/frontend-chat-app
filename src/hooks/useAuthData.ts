import { useEffect, useState } from "react";

function getAuthData() {
  return localStorage.getItem("token");
}

export function useAuthData() {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("token");
      if (token && token !== null && token !== "") {
        setAuthToken(token);
      }
    };

    // Set the initial value of authToken inside useeffect because we are trying to access client side variable i.e. window object which is not available on server (Next. js version 13, components are server-rendered by default)
    // initialzing authtoken outside of useeffect works sometimes because window becomes available once browser renders which is not always the case when this hook is called.
    handleStorage();

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return authToken;
}
