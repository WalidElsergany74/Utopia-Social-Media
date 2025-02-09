"use client";
import { Routes } from "@/constants/enums";
import { Bell, HomeIcon, LogOut, Menu, User, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "../link";
import { Button } from "../ui/button";
import AuthButtons from "./AuthButtons";
import Logo from "./Logo";
import ModeToggle from "./ModeToggle";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { useClientSession } from "@/hooks/useClientSession";
import AvatarProfile from "./AvatarProfile";
import { signOut } from "next-auth/react";
import { getNotifications } from "@/server/_actions/notifications";

const Navbar = ({ initialSession }: { initialSession: Session | null }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const session = useClientSession(initialSession);
  const pathname = usePathname();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        const unread = data.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
    
  }, []);
  // Note: Avoid using unreadCount in the dependency array to prevent unnecessary re-fetching
  

  const links = [
    { id: crypto.randomUUID(), name: "Home", icon: <HomeIcon className="!w-5 !h-5" />, href: Routes.ROOT },
  ];

  const linksAuth = [
    {
      id: crypto.randomUUID(),
      name: "Notifications",
      icon: (
        <div className="relative">
          <Bell className="!w-5 !h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      href: Routes.NOTIFICATIONS,
    },
    { id: crypto.randomUUID(), name: "Profile", icon: <User className="!w-5 !h-5" />, href: `${Routes.PROFILE}/${session.data?.user.username}` },
  ];

  return (
    <nav className="order-last lg:order-none flex-1 items-center justify-end flex">
      <div className="flex items-center gap-3 lg:gap-0">
        {session?.data?.user ? (
          <>
            <div className="lg:hidden">
              <AvatarProfile initialSession={initialSession} />
            </div>
            <Link href={`${Routes.NOTIFICATIONS}`} className="relative lg:hidden">
          <Bell className="!w-6 !h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>
          </>
        ) : <Link className="text-primay" href={"/auth/signin"}>
           <Button size={"sm"}>Login</Button>
          </Link>
          }
        <ModeToggle />
        <Button variant={"secondary"} size={"sm"} className="lg:hidden" onClick={() => setOpenMenu(true)}>
          <Menu className="!w-6 !h-6" />
        </Button>
      </div>

      <ul
        className={`fixed lg:static ${
          openMenu ? "left-0 z-50 h-full" : "-left-full"
        } top-0 px-10 py-20 lg:p-0 bg-background lg:bg-transparent transition-all duration-200 h-full lg:h-auto flex-col lg:flex-row w-full lg:w-auto flex items-start lg:items-center gap-10`}
      >
        <li className="flex justify-between items-center w-full">
          <div className="lg:hidden block">
            <Logo />
          </div>
          <Button variant={"secondary"} size={"sm"} className="lg:hidden" onClick={() => setOpenMenu(false)}>
            <XIcon className="!w-6 !h-6" />
          </Button>
        </li>

        {links.map((link) => (
          <li key={link.id}>
            <Link onClick={() => setOpenMenu(false)} href={`/${link.href}`} className={`hover:text-primary duration-200 transition-colors font-semibold ${pathname === `/${link.href}` ? "text-primary" : ""}`}>
              <div className="flex items-center">
                <span className="mx-2">{link.icon}</span>
                {link.name}
              </div>
            </Link>
          </li>
        ))}

        {session?.data?.user && (
          <>
            {linksAuth.map((link) => (
              <li key={link.id}>
                <Link onClick={() => setOpenMenu(false)} href={`/${link.href}`} className={`hover:text-primary duration-200 transition-colors font-semibold ${pathname === `/${link.href}` ? "text-primary" : ""}`}>
                  <div className="flex items-center">
                    <span className="mx-2">{link.icon}</span>
                    {link.name}
                  </div>
                </Link>
              </li>
            ))}

            <li>
              <div onClick={() => signOut()} className="flex lg:hidden items-center cursor-pointer hover:text-primary duration-200 transition-colors font-semibold">
                <span className="mx-2">
                  <LogOut className="!w-4 !h-4" />
                </span>
                Logout
              </div>
            </li>
          </>
        )}

        {!session?.data?.user && (
          <>
            <li className="lg:hidden flex flex-col gap-4">
              <div onClick={() => setOpenMenu(false)}>
                <AuthButtons initialSession={initialSession} />
              </div>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
