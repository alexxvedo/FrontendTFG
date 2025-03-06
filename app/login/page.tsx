import { signIn } from "@/app/utils/auth";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="flex flex-col items-center space-y-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={64}
            height={64}
            className="w-16 h-16"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue to your workspace</p>
        </div>

        <div className="space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/workspaces" });
            }}
          >
            <Button className="w-full flex items-center justify-center bg-[#24292e] hover:bg-[#1a1e22] text-white py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <FaGithub className="mr-3 text-xl" /> Continue with GitHub
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/workspaces" });
            }}
          >
            <Button className="w-full flex items-center justify-center bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <FaGoogle className="mr-3 text-xl text-[#4285f4]" /> Continue with Google
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
