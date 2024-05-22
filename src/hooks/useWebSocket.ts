import { useEffect, useState } from "react";

// Init event is tied to a single user and will run once for every new user
export function useWebSocket(serverAddress: string | URL, initEvent: any) {
  // We removed websocket from useMemo and added in usestate
  // We create a new websocket connection in useeffect and add event listener immediately because we might miss the open event sent by the server. (Which happened when we created websocket in the usememo outside of useeffect)
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [receivedData, setReceivedData] = useState<any>(null);

  useEffect(() => {
    const websocketConn = new WebSocket(serverAddress);
    setWebsocket(websocketConn);
    const handle_open = () => {
      websocketConn.send(JSON.stringify(initEvent));
      console.log("sent event");
    };
    websocketConn.addEventListener("open", handle_open);
    // Websocket open

    const handle_received_data = ({ data }: any) => {
      const serverData = JSON.parse(data);
      setReceivedData(serverData);
    };
    // websocket receive messages
    websocketConn.addEventListener("message", handle_received_data);

    websocketConn.addEventListener("close", (e) => {
      console.log("close event", e);
    });

    // cleanup
    return () => {
      websocketConn.removeEventListener("open", handle_open);
      websocketConn.removeEventListener("message", handle_received_data);
      // Add close to cleanup because we are creating websocket inside useeffect
      websocketConn.close();
    };
  }, [serverAddress, initEvent]);

  return { websocket, receivedData };
}
