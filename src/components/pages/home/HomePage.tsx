"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BookCheck,
  BookText,
  BookType,
  BookX,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  Clock,
  NotebookPen,
} from "lucide-react";
import React, { useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import clsx from "clsx";

export default function HomePage() {
  return (
    <div className="pb-24">
      <header className="bg-gray-100 px-6 py-2 flex justify-between items-center w-full h-20">
        <Link href="/home" className="font-fancy font-bold text-2xl">
          Quizzz
        </Link>
        <nav className="flex items-center gap-12">
          <button className="text-gray-950 font-semibold flex items-center gap-3 text-sm">
            Quizzes
            <ChevronDown className="w-5 stroke-gray-500" />
          </button>
          <Link
            href="/leaderboard"
            className="text-gray-400 font-semibold text-sm"
          >
            Leaderboards
          </Link>
          <Link href="/results" className="text-gray-400 font-semibold text-sm">
            My Results
          </Link>
          <Link href="/profile" className="text-gray-400 font-semibold text-sm">
            Profile
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex flex-col justify-center items-end gap-1">
            <p className="text-sm font-semibold text-gray-950">John Doe</p>
            <p className="text-xs text-gray-400">Student</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-300" />
        </div>
      </header>
      <main className="w-full mt-8">
        <div className="container mx-auto">
          <section>
            <p className="font-semibold text-gray-950">Last 30 days</p>
            <div className="mt-5 grid grid-rows-3 xl:grid-rows-1 xl:grid-cols-3 gap-5">
              <div className="p-6 flex gap-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 flex justify-center items-center bg-gray-200 rounded-md">
                  <BookText className="w-8 h-8 stroke-gray-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-500 font-medium capitalize">
                    Quizzes Started
                  </p>
                  <p className="text-3xl text-gray-900 font-semibold">12</p>
                </div>
              </div>
              <div className="p-6 flex gap-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 flex justify-center items-center bg-gray-200 rounded-md">
                  <BadgeCheck className="w-8 h-8 stroke-gray-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-500 font-medium capitalize">
                    Passed Successfully
                  </p>
                  <p className="text-3xl text-gray-900 font-semibold">80%</p>
                </div>
              </div>
              <div className="p-6 flex gap-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 flex justify-center items-center bg-gray-200 rounded-md">
                  <ChartNoAxesCombined className="w-8 h-8 stroke-gray-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-500 font-medium capitalize">
                    Streak
                  </p>
                  <p className="text-3xl text-gray-900 font-semibold">5 days</p>
                </div>
              </div>
            </div>
          </section>
          <HomeSection
            title="Explore latest quizzes"
            description="See the most recent and popular quizzes and choose the one you like the most"
            linkText="Browse more"
            linkUrl="/quizzes/popular"
          >
            <Carousel opts={{ align: "end", slidesToScroll: 2 }}>
              <CarouselContent>
                {Array.from({ length: 8 }).map((_, i) => (
                  <CarouselItem
                    key={i}
                    className="basis-full md:basis-auto p-0.5"
                  >
                    {/* <div className="w-80 h-[262px] bg-gray-400 rounded-lg" /> */}
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
            <Carousel opts={{ align: "end", slidesToScroll: 2 }}>
              <CarouselContent className="-ml-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <CarouselItem
                    key={i}
                    className="basis-full md:basis-auto pl-2"
                  >
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

interface HomeSectionProps {
  title: string;
  description?: string;
  linkText: string;
  linkUrl: string;
  children: React.ReactNode;
}

function HomeSection({
  title,
  description,
  linkText,
  linkUrl,
  children,
}: HomeSectionProps) {
  return (
    <section className="mt-14">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-fancy font-semibold text-3xl text-gray-950">
            {title}
          </h2>
          {!!description && <p className="mt-1 text-gray-600">{description}</p>}
        </div>
        <Link
          href={linkUrl}
          className="p-2 pb-0 flex items-center gap-2 text-gray-600 text-sm"
        >
          {linkText}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

interface QuizCardShortProps {
  title: string;
  image: string;
  time: number | null;
  questionsCount: number;
  slug: string;
  status: "none" | "started" | "passed" | "failed";
}

const APPROX_MAX_CHARACTERS_PER_LINE = 23;
const APPROX_ONE_LINE_HEIGHT = 30;

function QuizCardShort({
  title,
  image,
  time,
  questionsCount,
  slug,
  status,
}: QuizCardShortProps) {
  const [isTwoLines, setIsTwoLines] = useState(
    title.length > APPROX_MAX_CHARACTERS_PER_LINE
  );

  return (
    <div className="w-80 rounded-lg drop-shadow-sm">
      <div
        role="presentation"
        aria-label="quiz cover image"
        className="h-16 bg-center rounded-t-[inherit]"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "320px",
        }}
      />
      <div className="px-6 py-4 bg-gray-100 h-36">
        <div className="flex gap-2 items-baseline">
          {status === "none" ? (
            <BookText className="stroke-gray-900 w-6 h-6 shrink-0" />
          ) : status === "started" ? (
            <BookType className="stroke-gray-900 w-6 h-6 shrink-0" />
          ) : status === "passed" ? (
            <BookCheck className="stroke-gray-900 w-6 h-6 shrink-0" />
          ) : (
            <BookX className="stroke-gray-900 w-6 h-6 shrink-0" />
          )}
          <p
            className="text-lg text-gray-900 line-clamp-2 hyphens-auto"
            ref={(elem) => {
              if (!elem) return;
              setIsTwoLines(elem.clientHeight > APPROX_ONE_LINE_HEIGHT);
            }}
          >
            {title}
          </p>
        </div>
        <div
          className={clsx("mt-3 p-2 flex", {
            "flex-row items-center gap-5": isTwoLines,
            "flex-col gap-3": !isTwoLines,
          })}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 stroke-gray-500" />
            <p className="text-sm">{time ? `${time} minutes` : "Unlimited"}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotebookPen className="w-4 h-4 stroke-gray-500" />
            <p className="text-sm">{questionsCount} questions</p>
          </div>
        </div>
      </div>
      <div
        className={clsx("h-12 grid rounded-b-[inherit] overflow-hidden group", {
          "grid-cols-[1fr_auto_1fr]": status !== "started",
          "grid-cols-1": status === "started",
        })}
      >
        {status !== "started" && (
          <>
            <Link
              href={`/quiz/${slug}/view`}
              className="h-full text-sm bg-gray-200 hover:bg-gray-300 flex justify-center items-center"
            >
              See more
            </Link>
            <div className="bg-gray-200 flex items-center pointer-events-none group-hover:bg-gray-400 transition-colors">
              <div className="w-[1px] h-6 bg-gray-400" />
            </div>
          </>
        )}
        <Link
          href={`/quiz/${slug}/start`}
          className="h-full text-sm bg-gray-200 hover:bg-gray-300 flex justify-center items-center"
        >
          {status === "none" || status === "passed"
            ? "Start"
            : status === "failed"
              ? "Try again"
              : "Continue"}
        </Link>
      </div>
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  image: string;
  slug: string;
}

function CategoryCard({ title, image, slug }: CategoryCardProps) {
  return (
    <div
      className="w-48 h-52 bg-center relative rounded-md overflow-hidden"
      style={{ backgroundImage: `url(${image})`, backgroundSize: "auto 208px" }}
    >
      <div className="absolute inset-0 bg-gray-900/50 flex justify-center items-center">
        <Link
          href={`/categories/${slug}`}
          className="text-gray-50 text-xl font-semibold"
          aria-label={`open category '${title}'`}
        >
          {title}
        </Link>
      </div>
    </div>
  );
}
