"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function InvitePage() {
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const pathname = usePathname();
  const api = useApi();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const verifyToken = async () => {
      const token = pathname.split("/").pop();
      try {
        const response = await fetch("/api/invite/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setInviteData(data.decoded);
      } catch (err) {
        setError(err.message);
      }
    };

    verifyToken();
  }, [pathname]);

  const handleJoin = async () => {
    const token = pathname.split("/").pop();
    console.log("Unirse con token:", token);
    try {
      const response = await api.workspaces.join(
        inviteData.workspaceId,
        user.email,
        inviteData.permissionType
      );
      console.log("Respuesta de la API:", response);
      if (response.status === 200) {
        toast.success("Te has unido con exito");
        router.push(`/workspaces/${inviteData.workspaceId}`);
      } else {
        toast.error("Error al unirte");
      }
    } catch (error) {
      console.error("Error al unirte:", error);
      toast.error("Error al unirte");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 p-4 rounded-lg">
          <h1 className="text-red-600 text-xl">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Invitación</h1>
        {inviteData && (
          <div className="mb-4">
            <p>Has sido invitado a unirte al workspace</p>
            <p className="text-gray-600">
              Permisos: {inviteData.permissionType}
            </p>
          </div>
        )}
        <Button
          onClick={handleJoin}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-600/10"
        >
          Unirme
        </Button>
      </div>
    </div>
  );
}
