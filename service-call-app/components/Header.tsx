// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter, usePathname } from "next/navigation";
// import { onAuthStateChanged, signInWithGoogle, signOut } from "@/lib/auth";
// import { FaBars, FaTimes } from "react-icons/fa";
// import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
// import { Menu } from "lucide-react";
// import { Button } from "./ui/button";

// function useUserSession(initialUser: any) {
//   const [user, setUser] = useState(initialUser);
// const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged((authUser: any) => {
//       setUser(authUser);

//       if (!authUser) {
//         router.push("/"); // Redirect to home if not authenticated
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   return user;
// }

// export default function Header({ initialUser }: any) {
// const [nav, setNav] = useState(false);
//   const user = useUserSession(initialUser);
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false)

//   const handleSignOut = (event: any) => {
//     event.preventDefault();
//     signOut();
//     setNav(false); // Close mobile menu on sign out
//   };

//   const handleSignIn = (event: any) => {
//     event.preventDefault();
//     signInWithGoogle();
//     setNav(false); // Close mobile menu on sign in
//   };

// const isActive = (path: string) => pathname === path;
// const navItems = [
//   { name: "Home", href: "/" },
//   ...(user
//     ? [
//         { name: "Dashboard", href: "/dashboard" },
//         { name: "Analytics", href: "/analytics" },
//       ]
//     : []),
// ];

//   return (
//     <div className="relative">
//     <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-20">
//           <div className="flex-shrink-0">
//             <Link href="/" className="link-underline link-underline-black">
//               <img src="/central.jpg" alt="Logo" className="h-12" />
//             </Link>
//           </div>
//           <Sheet open={open} onOpenChange={setOpen}>
//             <SheetTrigger asChild>
//               <Button variant="ghost" size="icon" className="md:hidden text-white">
//                 <Menu className="h-6 w-6" />
//                 <span className="sr-only">Toggle navigation menu</span>
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gradient-to-b from-black to-gray-800">
//               <nav className="flex flex-col space-y-4 mt-8">
//                 {navItems.map((item) => (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className={`text-4xl font-medium hover:text-gray-400 ${
//                       isActive(item.href) ? "text-yellow-500 font-bold" : "text-gray-500"
//                     }`}
//                     onClick={() => setOpen(false)}
//                   >
//                     {item.name}
//                   </Link>
//                 ))}
//                 <div className="pt-6">
//                   {user ? (
//                     <>
//                       <img
//                         className="w-12 h-12 rounded-full mb-4"
//                         src={user.photoURL || "/profile.svg"}
//                         alt={user.email}
//                       />
//                       <span className="text-white text-2xl block mb-4">{user.displayName}</span>
//                       <a
//                         href="#"
//                         onClick={() => {
//                           signOut()
//                           setOpen(false)
//                         }}
//                         className="text-red-500 hover:text-red-400 text-2xl"
//                       >
//                         Sign Out
//                       </a>
//                     </>
//                   ) : (
//                     <a
//                       href="#"
//                       onClick={() => {
//                         signInWithGoogle()
//                         setOpen(false)
//                       }}
//                       className="text-green-500 hover:text-green-400 text-2xl"
//                     >
//                       Sign In with Google
//                     </a>
//                   )}
//                 </div>
//               </nav>
//             </SheetContent>
//           </Sheet>
//           <nav className="hidden md:flex space-x-6">
//             {navItems.map((item) => (
//               <Link
//                 key={item.name}
//                 href={item.href}
//                 className={`hover:text-gray-400 ${
//                   isActive(item.href) ? "text-yellow-500 font-bold" : ""
//                 }`}
//               >
//                 {item.name}
//               </Link>
//             ))}
//           </nav>
//           <div className="hidden md:flex items-center space-x-4">
//             {user ? (
//               <>
//                 <img
//                   className="w-8 h-8 rounded-full"
//                   src={user.photoURL || "/profile.svg"}
//                   alt={user.email}
//                 />
//                 <span>{user.displayName}</span>
//                 <a
//                   href="#"
//                   onClick={handleSignOut}
//                   className="hover:text-gray-400"
//                 >
//                   Sign Out
//                 </a>
//               </>
//             ) : (
//               <a
//                 href="#"
//                 onClick={handleSignIn}
//                 className="hover:text-gray-400"
//               >
//                 Sign In with Google
//               </a>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   </div>
//   );
// }
"use client";

import { useUserSession } from "@/hooks/use-user-session";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { createSession, removeSession } from "@/app/(actions)/auth-actions";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header({ session }: { session: string | null }) {

  const [nav, setNav] = useState(false);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const userSessionId = useUserSession(session);
  console.log(userSessionId);
  const handleSignIn = async () => {
    const uid = await signInWithGoogle();
    if (uid) {
      createSession(uid);
    }
    setNav(false);
  };

  const handleSignOut = async () => {
    await signOut();
    removeSession();
    setNav(false);
  };

  const isActive = (path: string) => pathname === path;
  const navItems = [
    { name: "Home", href: "/" },

    [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Analytics", href: "/analytics" },
    ],
  ];

  if (!userSessionId) {
    return (
      <header>
        <button onClick={handleSignIn}>Sign In</button>
      </header>
    );
  }

  return (
    <header>
      <button onClick={handleSignOut}>Sign Out</button>
    </header>
  );
}
export default Header;
