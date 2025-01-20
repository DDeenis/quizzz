import type { User } from "@/types/user";
import Link from "next/link";
import { useMemo } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { House, Menu } from "lucide-react";
import { textAvatarWithBg } from "@/utils/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const avatar = useMemo(() => textAvatarWithBg(user.name), [user.name]);

  return (
    <header className="bg-gray-100 px-4 xl:px-6 xl:py-2 flex justify-between items-center w-full h-14 xl:h-20">
      <Link href="/home" className="font-fancy font-bold text-xl xl:text-2xl">
        Quizzz
      </Link>
      <NavigationMenu className="hidden xl:block">
        <NavigationMenuList className="space-x-12">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-gray-950 font-semibold text-sm">
              Quizzes
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-[500px] bg-white shadow-md p-6 flex flex-col">
                <li>
                  <Link href="/home" legacyBehavior passHref>
                    <NavigationMenuLink className="px-5 py-4 flex gap-5 hover:bg-gray-50 rounded-sm group">
                      <div className="p-3 bg-gray-200 rounded-md">
                        <House className="w-6 h-6 stroke-gray-600 group-hover:stroke-blue-600" />
                      </div>
                      <div className="flex flex-col justify-between">
                        <p className="font-semibold">Home</p>
                        <p className="text-gray-600 text-sm">Home page</p>
                      </div>
                    </NavigationMenuLink>
                  </Link>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/leaderboard" legacyBehavior passHref>
              <NavigationMenuLink className="text-gray-400 font-semibold text-sm">
                Leaderboards
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/results" legacyBehavior passHref>
              <NavigationMenuLink className="text-gray-400 font-semibold text-sm">
                My Results
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/profile" legacyBehavior passHref>
              <NavigationMenuLink className="text-gray-400 font-semibold text-sm">
                Profile
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="hidden xl:flex items-center gap-4">
        <div className="flex flex-col justify-center items-end gap-1">
          <p className="text-sm font-semibold text-gray-950">{user.name}</p>
          <p className="text-xs text-gray-400">
            {user.isAdmin ? "Admin" : "Student"}
          </p>
        </div>
        <Avatar
          className="w-12 h-12 font-medium"
          style={{ backgroundImage: avatar.gradient }}
        >
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{avatar.text}</AvatarFallback>
        </Avatar>
      </div>
      <Sheet>
        <SheetTrigger className="block xl:hidden">
          <Menu className="w-6 h-6" />
        </SheetTrigger>
        <SheetContent className="w-full bg-white">
          <SheetHeader>
            <SheetTitle className="sr-only">
              User data and navigation
            </SheetTitle>
            <SheetDescription className="sr-only">
              Log in, sign up, view user data and navigate the website
            </SheetDescription>
            <div className="w-full"></div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </header>
  );
}
