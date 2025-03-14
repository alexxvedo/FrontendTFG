import { SocketProvider } from "@/context/socket";
export default function WorkspaceLayout({ children }) {
  return <SocketProvider>{children}</SocketProvider>;
}
