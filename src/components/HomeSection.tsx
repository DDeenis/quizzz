import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface HomeSectionProps {
  title: string;
  description?: string;
  linkText: string;
  linkUrl: string;
  children: React.ReactNode;
}

export function HomeSection({
  title,
  description,
  linkText,
  linkUrl,
  children,
}: HomeSectionProps) {
  return (
    <section className="mt-10 xl:mt-14">
      <div className="flex flex-col xl:flex-row justify-between xl:items-end">
        <div>
          <h2 className="font-fancy font-semibold text-xl xl:text-3xl text-gray-950">
            {title}
          </h2>
          {!!description && (
            <p className="mt-2 text-gray-600 text-sm">{description}</p>
          )}
        </div>
        <Link
          href={linkUrl}
          className="flex items-center gap-2 text-gray-500 text-sm bg-gray-100 xl:bg-transparent px-4 py-2 xl:p-2 xl:pb-0 rounded-md w-max mt-4"
        >
          {linkText}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
