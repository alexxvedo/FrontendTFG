import { signIn } from "@/app/utils/auth";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <div className="space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/workspaces" });
            }}
          >
            <Button className="w-full flex items-center justify-center bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition duration-300">
              <FaGithub className="mr-2" /> Login with GitHub
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/workspaces" });
            }}
          >
            <Button className="w-full flex items-center justify-center bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition duration-300">
              <FaGoogle className="mr-2" /> Login with Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
