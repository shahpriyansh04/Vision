"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/auth";
import PlaybackApp from "@/components/playback-app";
export default function TestPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     router.push("/");
  //   } else {
  //     // Decode JWT or fetch user details from backend
  //     const decodedUser = JSON.parse(atob(token.split(".")[1])); // Decoding JWT
  //     setUser(decodedUser);
  //   }
  // }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return <PlaybackApp />;
}
//   return (
//     <div className="h-screen flex flex-col items-center justify-center">
//       <h1 className="text-2xl font-bold">Protected Page</h1>
//       {user && <p>Welcome, {user.name} (ID: {user.userId} )</p>}
//       <button className="px-4 py-2 bg-red-500 text-white rounded mt-4" onClick={handleLogout}>
//         Logout
//       </button>
//     </div>
//   );
// }

// "use client"

// export default function Playback() {
//   return <PlaybackApp />
// }
