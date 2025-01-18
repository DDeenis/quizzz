"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BookText,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  House,
  LucideProps,
  Menu,
} from "lucide-react";
import React, { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { QuizCardShort } from "@/components/quiz/QuizCardShort";
import { CategoryCard } from "@/components/CategoryCard";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { HomeSection } from "@/components/HomeSection";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { textAvatarWithBg } from "@/utils/user";

const testUser = {
  id: "1",
  name: "John Doe",
  email: "johndoe@example.com",
  emailVerified: true,
  isAdmin: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export default function HomePage() {
  return (
    <div className="pb-24">
      <Header user={testUser} />
      <main className="w-full mt-8 px-2">
        <div className="container mx-auto">
          <section>
            <p className="text-sm xl:text-base font-semibold text-gray-950">
              Last 30 days
            </p>
            <div className="mt-3 xl:mt-5 grid grid-rows-3 md:grid-rows-1 md:grid-cols-3 gap-3 xl:gap-5">
              <StatsElement
                name="Quizzes Started"
                value="12"
                icon={
                  <BookText className="w-6 h-6 xl:w-8 xl:h-8 stroke-gray-600" />
                }
              />
              <StatsElement
                name="Passed Successfully"
                value="80%"
                icon={
                  <BadgeCheck className="w-6 h-6 xl:w-8 xl:h-8 stroke-gray-600" />
                }
              />
              <StatsElement
                name="Streak"
                value="5 days"
                icon={
                  <ChartNoAxesCombined className="w-6 h-6 xl:w-8 xl:h-8 stroke-gray-600" />
                }
              />
            </div>
          </section>
          <HomeSection
            title="Explore latest quizzes"
            description="See the most recent and popular quizzes and choose the one you like the most"
            linkText="Browse more"
            linkUrl="/quizzes/popular"
          >
            <Carousel
              opts={{
                align: "end",
                breakpoints: { "(min-width: 768px)": { slidesToScroll: 2 } },
              }}
            >
              <CarouselContent>
                {Array.from({ length: 8 }).map((_, i) => (
                  <CarouselItem
                    key={i}
                    className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-auto flex justify-center pb-1"
                  >
                    <QuizCardShort
                      title={
                        i === 2
                          ? "Placeholder Placeholder Placeholder Placeholder"
                          : "Placeholder"
                      }
                      image="/placeholder.jpg"
                      time={15}
                      questionsCount={100}
                      slug="slug"
                      status="none"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </HomeSection>
          <HomeSection
            title="Popular categories"
            description="Choose the most interesting and explore thematic quizzes"
            linkText="See all"
            linkUrl="/categories/all"
          >
            <Carousel
              opts={{
                align: "center",
                breakpoints: { "(min-width: 768px)": { slidesToScroll: 2 } },
              }}
            >
              <CarouselContent className="-ml-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <CarouselItem key={i} className="basis-auto pl-2">
                    <CategoryCard
                      image="/placeholder.jpg"
                      title={`Category ${i + 1}`}
                      slug="slug"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </HomeSection>
        </div>
      </main>
    </div>
  );
}

interface StatsElementProps {
  name: string;
  value: string;
  icon: React.ReactNode;
}

function StatsElement({ name, value, icon }: StatsElementProps) {
  return (
    <div className="p-3 xl:p-6 flex gap-4 bg-gray-50 rounded-lg">
      <div className="aspect-square h-full xl:w-16 xl:h-16 flex justify-center items-center bg-gray-200 rounded-md">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500 font-medium capitalize">{name}</p>
        <p className="text-xl xl:text-3xl text-gray-900 font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

interface HeaderProps {
  user: User;
}

function Header({ user }: HeaderProps) {
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
