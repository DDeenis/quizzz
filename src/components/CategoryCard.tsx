import Link from "next/link";

interface CategoryCardProps {
  title: string;
  image: string;
  slug: string;
}

export function CategoryCard({ title, image, slug }: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} aria-label={`open category '${title}'`}>
      <div
        className="w-48 h-52 bg-center relative rounded-md overflow-hidden"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "auto 208px",
        }}
      >
        <div className="absolute inset-0 bg-gray-900/50 flex justify-center items-center">
          <p className="text-gray-50 md:text-lg font-semibold">{title}</p>
        </div>
      </div>
    </Link>
  );
}
