"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";

export default function Header() {
  const { user, loading, signIn, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Handle redirection when the user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      const timeout = setTimeout(() => router.push("/"), 100); // Add a slight delay for smoother navigation
      return () => clearTimeout(timeout); // Cleanup the timeout
    }
  }, [loading, user, router]);

  // Memoize the navigation items to prevent unnecessary recalculations
  const navItems = useMemo(
    () => [
      { name: "Home", href: "/" },
      ...(user
        ? [
            { name: "Dashboard", href: "/dashboard" },
            { name: "Analytics", href: "/analytics" },
          ]
        : []),
    ],
    [user]
  );

  const handleSignOut = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    await signOut();
    setOpen(false); // Close mobile menu on sign out
  };

  const handleSignIn = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    signIn();
    setOpen(false); // Close mobile menu on sign in
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/central.jpg"
              alt="Logo"
              className="h-12"
              loading="lazy" // Lazy load for better performance
            />
          </Link>

          {/* Mobile Navigation Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] bg-gradient-to-b from-black to-gray-800"
            >
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-4xl font-medium hover:text-gray-400 ${
                      isActive(item.href)
                        ? "text-yellow-500 font-bold"
                        : "text-gray-500"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-6">
                  {user ? (
                    <>
                      <img
                        className="w-12 h-12 rounded-full mb-4"
                        src={user.photoURL || "/profile.svg"}
                        alt={user.email || "User profile image"}
                        loading="lazy"
                      />
                      <span className="text-white text-2xl block mb-4">
                        {user.displayName}
                      </span>
                      <a
                        href="#"
                        onClick={handleSignOut}
                        className="text-red-500 hover:text-red-400 text-2xl"
                      >
                        Sign Out
                      </a>
                    </>
                  ) : (
                    <a
                      href="#"
                      onClick={handleSignIn}
                      className="text-green-500 hover:text-green-400 text-2xl"
                    >
                      Sign In with Google
                    </a>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`hover:text-gray-400 ${
                  isActive(item.href) ? "text-yellow-500 font-bold" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <img
                  className="w-8 h-8 rounded-full"
                  src={user.photoURL || "/profile.svg"}
                  alt={user.email || "User profile image"}
                  loading="lazy"
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
              <a href="#" onClick={handleSignIn} className="hover:text-gray-400">
                Sign In with Google
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
