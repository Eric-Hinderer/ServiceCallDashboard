"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Instead of useRouter
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const pathname = usePathname(); // Get current path

  const links = [
    {
      id: 1,
      link: "/",
      label: "Home",
    },
    {
      id: 2,
      link: "/dashboard",
      label: "Dashboard",
    },
  ];

  useEffect(() => {
    // Any actions that should happen after route change or on mount
    if (pathname) {
      // Handle logic after route is available
      console.log("Current path:", pathname);
    }
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black text-white shadow-md z-50 h-20 flex justify-between items-center px-4">
      <div>
        <h1 className="text-5xl font-signature ml-2">
          <Link href="/" className="link-underline link-underline-black">
            <img src="/central.jpg" alt="Logo" className="h-12" />
          </Link>
        </h1>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex space-x-4">
        {links.map(({ id, link, label }) => (
          <li
            key={id}
            className={`nav-links px-4 cursor-pointer capitalize font-medium text-gray-500 hover:scale-105 hover:text-white duration-200 active:text-red active:scale-100 ${
              pathname === link ? "text-white font-bold" : ""
            }`}
          >
            <Link href={link}>{label}</Link>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Icon */}
      <div
        onClick={() => setNav(!nav)}
        className="cursor-pointer pr-4 z-10 text-gray-500 md:hidden"
      >
        {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
      </div>

      {/* Mobile Menu */}
      {nav && (
        <ul className="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-black to-gray-800 text-gray-500">
          {links.map(({ id, link, label }) => (
            <li
              key={id}
              className="px-4 cursor-pointer capitalize py-6 text-4xl"
            >
              <Link href={link} onClick={() => setNav(!nav)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
