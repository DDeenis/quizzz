"use client";

import {
  BadgeCheck,
  BookText,
  ChartNoAxesCombined,
  Palmtree,
  Projector,
  Quote,
  Sprout,
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
import Header from "@/components/Header";
import { HomeSection } from "@/components/HomeSection";
import type { User } from "@/types/user";
import type { QuizPreview } from "@/types/quiz";
import { type Category } from "@/types/categories";

interface Props {
  user: User;
  userStats?: {
    quizzesStarted?: number;
    quizzesPassedPercentage?: number;
    streak?: number;
  };
  recommendations: QuizPreview[];
  latestQuizzes: QuizPreview[];
  categories: Category[];
  quoteOfTheDay: {
    quote: string;
    author: string;
  };
}

export default function HomePage({
  user,
  userStats,
  recommendations,
  latestQuizzes,
  categories,
  quoteOfTheDay,
}: Props) {
  return (
    <div>
      <Header user={user} />
      <main className="w-full mt-8 px-2" id="content">
        <div className="container mx-auto">
          <section>
            <p className="text-sm xl:text-base font-semibold text-gray-950">
              Last 30 days
            </p>
            <div className="mt-3 xl:mt-5 grid grid-rows-3 md:grid-rows-1 md:grid-cols-3 gap-3 xl:gap-5">
              <StatsElement
                name="Quizzes Started"
                value={
                  userStats?.quizzesStarted
                    ? `${userStats?.quizzesStarted}`
                    : undefined
                }
                icon={
                  <BookText className="w-6 h-6 xl:w-8 xl:h-8 stroke-gray-600" />
                }
              />
              <StatsElement
                name="Passed Successfully"
                value={
                  userStats?.quizzesPassedPercentage
                    ? `${userStats.quizzesPassedPercentage}%`
                    : undefined
                }
                icon={
                  <BadgeCheck className="w-6 h-6 xl:w-8 xl:h-8 stroke-gray-600" />
                }
              />
              <StatsElement
                name="Streak"
                value={
                  userStats?.streak ? `${userStats.streak} days` : undefined
                }
                icon={
                  <ChartNoAxesCombined className="w-6 h-6 xl:w-8 xl:h-8 stroke-gray-600" />
                }
              />
            </div>
          </section>
          <HomeSection
            title="Recommended to you"
            description="These recommendations are based on the quizzes you have previously taken"
            linkText="More recommendations"
            linkUrl="/quizzes/popular"
          >
            {recommendations.length > 0 ? (
              <Carousel
                opts={{
                  align: "end",
                  breakpoints: { "(min-width: 768px)": { slidesToScroll: 2 } },
                }}
              >
                <CarouselContent>
                  {recommendations.map((_, i) => (
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
            ) : (
              <div className="h-64 rounded-sm border border-dashed border-gray-300 flex justify-center items-center gap-2 relative">
                <div
                  role="presentation"
                  aria-label="background pattern"
                  className="absolute inset-0 bg-gray-200 opacity-80 -z-1"
                  style={{ maskImage: "url('/patterns/texture.svg')" }}
                />
                <Palmtree className="stroke-gray-400 mb-1 w-5 h-5 lg:w-6 lg:h-6" />
                <p className="text-sm xl:text-base font-medium text-gray-500">
                  Recommendations are on vacation
                </p>
              </div>
            )}
          </HomeSection>
          <HomeSection
            title="Popular categories"
            description="Choose the most interesting and explore thematic quizzes"
            linkText="See all"
            linkUrl="/categories/all"
          >
            {categories.length > 0 ? (
              <Carousel
                opts={{
                  align: "center",
                  breakpoints: { "(min-width: 768px)": { slidesToScroll: 2 } },
                }}
              >
                <CarouselContent className="-ml-2">
                  {categories.map((_, i) => (
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
            ) : (
              <div className="h-64 rounded-sm border border-dashed border-gray-300 flex justify-center items-center gap-2 relative">
                <div
                  role="presentation"
                  aria-label="background pattern"
                  className="absolute inset-0 bg-gray-200 opacity-80 -z-1"
                  style={{ maskImage: "url('/patterns/texture.svg')" }}
                />
                <Projector className="stroke-gray-400 mb-1 w-5 h-5 lg:w-6 lg:h-6" />
                <p className="text-sm xl:text-base font-medium text-gray-500">
                  Categories are waiting to be revealed
                </p>
              </div>
            )}
          </HomeSection>
          <HomeSection
            title="Explore latest quizzes"
            description="See the most recent and popular quizzes and choose the one you like the most"
            linkText="Browse more"
            linkUrl="/quizzes/latest"
          >
            {latestQuizzes.length > 0 ? (
              <Carousel
                opts={{
                  align: "end",
                  breakpoints: { "(min-width: 768px)": { slidesToScroll: 2 } },
                }}
              >
                <CarouselContent>
                  {latestQuizzes.map((_, i) => (
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
            ) : (
              <div className="h-64 rounded-sm border border-dashed border-gray-300 flex justify-center items-center gap-2 relative">
                <div
                  role="presentation"
                  aria-label="background pattern"
                  className="absolute inset-0 bg-gray-200 opacity-80 -z-1"
                  style={{ maskImage: "url('/patterns/texture.svg')" }}
                />
                <Sprout className="stroke-gray-400 mb-1 w-5 h-5 lg:w-6 lg:h-6" />
                <p className="text-sm xl:text-base font-medium text-gray-500">
                  Waiting for incoming quizzes
                </p>
              </div>
            )}
          </HomeSection>
          <section className="mt-10 xl:mt-14">
            <div
              className="w-full xl:h-64 rounded-xl relative bg-gray-200"
              aria-label="quote of the day"
            >
              <div
                role="presentation"
                aria-label="background pattern"
                className="absolute inset-0 bg-slate-100 opacity-80"
                style={{ maskImage: "url('/patterns/charlie-brown.svg')" }}
              />
              <div
                role="presentation"
                aria-label="background gradient"
                className="absolute inset-0 bg-linear-to-b from-transparent via-gray-200 to-transparent"
              />
              <div className="xl:absolute inset-0 flex justify-center items-center p-4">
                <figure className="relative w-full max-w-[600px]">
                  <Quote
                    role="presentation"
                    aria-label="start quote"
                    className="static xl:absolute -top-1/3 -left-24 w-16 h-16 stroke-gray-300/60"
                  />
                  <blockquote className="my-4">
                    <p className="font-fancy font-semibold text-2xl xl:text-3xl text-gray-700 leading-snug text-balance xl:line-clamp-3">
                      {quoteOfTheDay.quote}
                    </p>
                  </blockquote>
                  <Quote
                    role="presentation"
                    aria-label="end quote"
                    className="xl:absolute -bottom-1/3 -right-24 rotate-180 w-16 h-16 stroke-gray-300/60 ml-auto"
                  />
                  <figcaption className="xl:absolute -bottom-9 right-0 text-sm xl:text-base font-medium text-gray-400">
                    {quoteOfTheDay.author}
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="mt-16 bg-gray-100 h-10 flex justify-center items-center">
        <p className="text-sm text-gray-400">
          © 2024, Quizzz. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

interface StatsElementProps {
  name: string;
  value?: string;
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
          {value ?? "--"}
        </p>
      </div>
    </div>
  );
}
