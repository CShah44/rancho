import { signIn } from "@/auth";
import { LogIn } from "lucide-react";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-md shadow-md hover:bg-gray-100 transition-colors border border-gray-300 font-medium"
      >
        <LogIn size={18} />
        <span>Sign in with Google</span>
      </button>
    </form>
  );
}
