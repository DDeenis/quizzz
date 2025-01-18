import clsx from "clsx";
import {
  BookCheck,
  BookText,
  BookType,
  BookX,
  Clock,
  NotebookPen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export function QuizCardShort({
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
    <div className="w-full lg:w-80 rounded-lg">
      <div
        role="presentation"
        aria-label="quiz cover image"
        className="h-16 bg-center rounded-t-[inherit]"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
        }}
      />
      <div className="px-6 py-4 bg-gray-100 h-36 border-x border-x-gray-200">
        <div className="flex gap-2">
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
            className="md:text-lg font-semibold md:font-medium text-gray-900 line-clamp-2 hyphens-auto"
            ref={(elem) => {
              if (!elem) return;
              setIsTwoLines(elem.clientHeight > APPROX_ONE_LINE_HEIGHT);
            }}
          >
            {title}
          </p>
        </div>
        <div
          className={clsx("mt-3 p-2 flex text-gray-800", {
            "flex-row items-center justify-between": isTwoLines,
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
              className="h-full text-sm bg-gray-200 hover:bg-gray-300 flex justify-center items-center font-medium"
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
          className="h-full text-sm bg-gray-200 hover:bg-gray-300 flex justify-center items-center font-medium"
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
