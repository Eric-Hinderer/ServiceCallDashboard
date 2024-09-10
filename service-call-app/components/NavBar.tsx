// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation"; // Ensure useRouter from next/navigation is imported
// import { FaBars, FaTimes } from "react-icons/fa";
// import { onAuthStateChanged, signInWithGoogle, signOut } from "@/lib/auth";

// function useUserSession(initialUser: any) {
//   const [user, setUser] = useState(initialUser);
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged((authUser: any) => {
//       setUser(authUser);

//       // If the user is not authenticated, redirect them from protected routes
//       if (!authUser && pathname !== "/") {
//         router.push("/");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   return user;
// }

// const Navbar = (initialUser: any) => {
//   const [nav, setNav] = useState(false);
//   const user = useUserSession(initialUser);
//   const pathname = usePathname();
//   const router = useRouter(); // Reuse the router for signOut logic

//   const handleSignOut = async (event: any) => {
//     event.preventDefault();
//     await signOut();
//     router.push("/"); // Ensure navigation happens after sign out
//   };

//   const handleSignIn = async (event: any) => {
//     event.preventDefault();
//     await signInWithGoogle();
//     router.push("/dashboard"); // Redirect to dashboard after sign in
//   };

//   const links = [
//     {
//       id: 1,
//       link: "/",
//       label: "Home",
//     },
//     {
//       id: 2,
//       link: "/dashboard",
//       label: "Dashboard",
//     },
//     {
//       id: 3,
//       link: "/analytics",
//       label: "Analytics",
//     },
//   ];

//   return (
//     <nav className="fixed top-0 left-0 right-0 bg-black text-white shadow-md z-50 h-20 flex justify-between items-center px-4">
//       <div>
//         <h1 className="text-5xl font-signature ml-2">
//           <Link href="/" className="link-underline link-underline-black">
//             <img src="/central.jpg" alt="Logo" className="h-12" />
//           </Link>
//         </h1>
//       </div>
//       <div className="flex items-center space-x-4">
//         {user ? (
//           <>
//             <img
//               className="w-8 h-8 rounded-full"
//               src={user.photoURL || "/profile.svg"}
//               alt={user.email}
//             />
//             <span>{user.displayName}</span>
//             <a href="#" onClick={handleSignOut} className="hover:text-gray-400">
//               Sign Out
//             </a>
//           </>
//         ) : (
//           <a href="#" onClick={handleSignIn} className="hover:text-gray-400">
//             Sign In with Google
//           </a>
//         )}
//       </div>

//       {/* Desktop Menu */}
//       <ul className="hidden md:flex space-x-4">
//         {links.map(({ id, link, label }) => (
//           <li
//             key={id}
//             className={`nav-links px-4 cursor-pointer capitalize font-medium text-gray-500 hover:scale-105 hover:text-white duration-200 active:text-red active:scale-100 ${
//               pathname === link ? "text-white font-bold" : ""
//             }`}
//           >
//             <Link href={link}>{label}</Link>
//           </li>
//         ))}
//       </ul>

//       {/* Mobile Menu Icon */}
//       <div
//         onClick={() => setNav(!nav)}
//         className="cursor-pointer pr-4 z-10 text-gray-500 md:hidden"
//       >
//         {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
//       </div>

//       {/* Mobile Menu */}
//       {nav && (
//         <ul className="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-black to-gray-800 text-gray-500">
//           {links.map(({ id, link, label }) => (
//             <li
//               key={id}
//               className="px-4 cursor-pointer capitalize py-6 text-4xl"
//             >
//               <Link href={link} onClick={() => setNav(!nav)}>
//                 {label}
//               </Link>
//             </li>
//           ))}

//           {/* Add Sign In/Sign Out to Mobile Menu */}
//           <li className="px-4 cursor-pointer capitalize py-6 text-4xl">
//             {user ? (
//               <>
//                 <img
//                   className="w-12 h-12 rounded-full mb-4"
//                   src={user.photoURL || "/profile.svg"}
//                   alt={user.email}
//                 />
//                 <span className="text-white text-2xl">{user.displayName}</span>
//                 <a
//                   href="#"
//                   onClick={handleSignOut}
//                   className="text-red-500 hover:text-red-400 mt-4"
//                 >
//                   Sign Out
//                 </a>
//               </>
//             ) : (
//               <a
//                 href="#"
//                 onClick={handleSignIn}
//                 className="text-green-500 hover:text-green-400 mt-4"
//               >
//                 Sign In with Google
//               </a>
//             )}
//           </li>
//         </ul>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signInWithGoogle, signOut } from "@/lib/auth";
import { FaBars, FaTimes } from "react-icons/fa";

function useUserSession(initialUser: any) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser: any) => {
      setUser(authUser);

      if (!authUser) {
        router.push("/"); // Redirect to home if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  return user;
}

export default function Header({ initialUser }: any) {
  const [nav, setNav] = useState(false); // For toggling the mobile menu
  const user = useUserSession(initialUser);
  const pathname = usePathname(); // Get the current path

  const handleSignOut = (event: any) => {
    event.preventDefault();
    signOut();
    setNav(false); // Close mobile menu on sign out
  };

  const handleSignIn = (event: any) => {
    event.preventDefault();
    signInWithGoogle();
    setNav(false); // Close mobile menu on sign in
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 bg-black text-white shadow-md z-50 h-20 flex justify-between items-center px-4">
        <div>
          <h1 className="text-5xl font-signature ml-2">
            <Link href="/" className="link-underline link-underline-black">
              <img src="/central.jpg" alt="Logo" className="h-12" />
            </Link>
          </h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/"
            className={`hover:text-gray-400 ${
              isActive("/") ? "text-yellow-500 font-bold" : ""
            }`}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`hover:text-gray-400 ${
                  isActive("/dashboard") ? "text-yellow-500 font-bold" : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/analytics"
                className={`hover:text-gray-400 ${
                  isActive("/analytics") ? "text-yellow-500 font-bold" : ""
                }`}
              >
                Analytics
              </Link>
            </>
          )}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <img
                className="w-8 h-8 rounded-full"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              <span>{user.displayName}</span>
              <a
                href="#"
                onClick={handleSignOut}
                className="hover:text-gray-400"
              >
                Sign Out
              </a>
            </>
          ) : (
            <a
              href="#"
              onClick={handleSignIn}
              className="hover:text-gray-400"
            >
              Sign In with Google
            </a>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div
          onClick={() => setNav(!nav)}
          className="cursor-pointer pr-4 z-10 text-gray-500 md:hidden"
        >
          {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
        </div>
      </header>

      {/* Mobile Header */}
      {nav && (
        <ul className="md:hidden flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-black to-gray-800 text-gray-500">
          <li className="px-4 cursor-pointer capitalize py-6 text-4xl">
            <Link href="/" onClick={() => setNav(!nav)}>
              Home
            </Link>
          </li>
          {user && (
            <>
              <li className="px-4 cursor-pointer capitalize py-6 text-4xl">
                <Link href="/dashboard" onClick={() => setNav(!nav)}>
                  Dashboard
                </Link>
              </li>
              <li className="px-4 cursor-pointer capitalize py-6 text-4xl">
                <Link href="/analytics" onClick={() => setNav(!nav)}>
                  Analytics
                </Link>
              </li>
            </>
          )}
          <li className="px-4 cursor-pointer capitalize py-6 text-4xl">
            {user ? (
              <>
                <img
                  className="w-12 h-12 rounded-full mb-4"
                  src={user.photoURL || "/profile.svg"}
                  alt={user.email}
                />
                <span className="text-white text-2xl">{user.displayName}</span>
                <a
                  href="#"
                  onClick={handleSignOut}
                  className="text-red-500 hover:text-red-400 mt-4"
                >
                  Sign Out
                </a>
              </>
            ) : (
              <a
                href="#"
                onClick={handleSignIn}
                className="text-green-500 hover:text-green-400 mt-4"
              >
                Sign In with Google
              </a>
            )}
          </li>
        </ul>
      )}
    </>
  );
}

