"use client";
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
import {
  GalleryVerticalEnd,
  Menu,
  Search,
  TableProperties,
  TrendingUp,
} from "lucide-react";
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
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface HeaderProps {
  user?: User;
}

const linkClass = (isActive: boolean) =>
  clsx(
    "font-semibold text-sm",
    isActive
      ? "text-gray-900"
      : "text-gray-400 hover:text-gray-800 focus:text-gray-800"
  );

const iconClass = "w-6 h-6 stroke-gray-600 group-hover:stroke-blue-600";

export default function Header({ user }: HeaderProps) {
  const avatar = useMemo(
    () =>
      user?.name ? textAvatarWithBg(user.name) : { text: "", gradient: "" },
    [user?.name]
  );
  const pathname = usePathname();

  const activeLinks = {
    home: !!pathname?.startsWith("/home"),
    quizzes: !!pathname?.startsWith("/quizzes"),
    results: !!pathname?.startsWith("/results"),
    proflie: !!pathname?.startsWith("/proflie"),
  };

  return (
    <header className="bg-gray-100 flex justify-center items-center px-4 xl:px-6 xl:py-2 w-full h-14 xl:h-20">
      <div className="flex justify-between items-center w-full 2xl:container">
        <Link
          href="#content"
          tabIndex={0}
          className="bg-gray-50 sr-only focus-within:not-sr-only focus-within:p-2 focus-within:absolute"
        >
          Skip to content
        </Link>
        <Link href="/home" className="font-fancy font-bold text-xl xl:text-2xl">
          Quizzz
        </Link>
        <NavigationMenu className="hidden xl:block">
          <NavigationMenuList className="space-x-12">
            <NavigationMenuItem>
              <Link href="/home" legacyBehavior passHref>
                <NavigationMenuLink className={linkClass(activeLinks.home)}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`${linkClass(
                  activeLinks.quizzes
                )} hover:bg-gray-200 focus:bg-gray-200`}
              >
                Quizzes
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-[500px] bg-white shadow-md p-6 flex flex-col">
                  <HeaderElement
                    href="/quizzes/search"
                    title="Search Quizzes"
                    description="View and filter all available quizzes"
                    icon={<Search className={iconClass} />}
                  />
                  <HeaderElement
                    href="/quizzes/search?orderBy=rating&order=desc"
                    title="Popular"
                    description="Latest and greatest quizzes"
                    icon={<TrendingUp className={iconClass} />}
                  />
                  <HeaderElement
                    href="/quizzes/categories"
                    title="Categories"
                    description="Quizzes by categories"
                    icon={<GalleryVerticalEnd className={iconClass} />}
                  />
                  <HeaderElement
                    href="/quizzes/leaderboard"
                    title="Leaderboard"
                    description="Compare your results to others"
                    icon={<TableProperties className={iconClass} />}
                  />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/results" legacyBehavior passHref>
                <NavigationMenuLink className={linkClass(activeLinks.results)}>
                  Results
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/profile" legacyBehavior passHref>
                <NavigationMenuLink className={linkClass(activeLinks.proflie)}>
                  Profile
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {user ? (
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
        ) : null}

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
      </div>
    </header>
  );
}

interface HeaderElementProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function HeaderElement({ title, description, icon, href }: HeaderElementProps) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(href);

  return (
    <li>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink
          className={clsx(
            "px-5 py-4 flex gap-5 hover:bg-gray-50 rounded-xs group",
            isActive && "bg-gray-50"
          )}
        >
          <div className="p-3 bg-gray-200 rounded-md">{icon}</div>
          <div className="flex flex-col justify-between">
            <p className="font-semibold">{title}</p>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </NavigationMenuLink>
      </Link>
    </li>
  );
}
