"use client";

import { BadgeCheck, BookText, ChartNoAxesCombined, Quote } from "lucide-react";
import React from "react";
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
    <div>
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
          <section className="mt-10 xl:mt-14">
            <div
              className="w-full xl:h-64 rounded-xl relative bg-gray-200"
              aria-label="quote of the day"
            >
              <div
                role="presentation"
                aria-label="background pattern"
                className="absolute inset-0 bg-slate-100 opacity-80"
                style={{ maskImage: "url(charlie-brown.svg)" }}
              />
              <div
                role="presentation"
                aria-label="background gradient"
                className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent"
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
                      To know, is to know that you know nothing. That is the
                      meaning of true knowledge.
                    </p>
                  </blockquote>
                  <Quote
                    role="presentation"
                    aria-label="end quote"
                    className="xl:absolute -bottom-1/3 -right-24 rotate-180 w-16 h-16 stroke-gray-300/60 ml-auto"
                  />
                  <figcaption className="xl:absolute -bottom-9 right-0 text-sm xl:text-base font-medium text-gray-400">
                    Socrates
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
