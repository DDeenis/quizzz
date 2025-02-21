import * as React from "react";

import { Input } from "./input";
import clsx from "clsx";
import { ImageUp, Replace, Trash2 } from "lucide-react";

const ImageUpload = React.forwardRef<
  HTMLInputElement,
  Omit<
    React.ComponentProps<"input">,
    "value" | "onChange" | "type" | "className"
  > & {
    value: File | undefined;
    onChange: (value: File | undefined) => void;
  }
>(({ value, onChange, ...props }, ref) => {
  const imageSelected = value !== undefined;
  const imagePreview = React.useMemo(() => {
    const url = value ? URL.createObjectURL(value) : undefined;
    return url;
  }, [value]);

  const [prevImagePreview, setPrevImagePreview] = React.useState(imagePreview);

  if (prevImagePreview !== imagePreview) {
    if (prevImagePreview) {
      URL.revokeObjectURL(prevImagePreview);
    }
    setPrevImagePreview(imagePreview);
  }

  return (
    <div>
      <div
        className={clsx(
          "relative h-28 rounded-md overflow-hidden border border-gray-300 flex justify-center items-center",
          { "bg-gray-100 inset-shadow-sm": !imageSelected }
        )}
        style={{
          backgroundImage: `url(${prevImagePreview})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Input
          type="file"
          {...props}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
          className="h-full absolute inset-0 opacity-0"
          ref={ref}
        />
        {imageSelected ? (
          <button
            type="button"
            className="p-2 flex items-center gap-2 bg-gray-950 text-gray-50 rounded-lg"
          >
            <Replace
              className="w-4 h-4"
              role="presentation"
              aria-label="replace"
            />
            <span className="text-sm font-medium">Replace image</span>
          </button>
        ) : (
          <p className="flex items-center gap-2">
            <ImageUp
              className="w-6 h-6 stroke-gray-400"
              role="presentation"
              aria-label="image upload"
            />
            <span className="text-gray-500 text-sm font-medium">
              Upload image
            </span>
          </p>
        )}
      </div>
      {imageSelected && (
        <button
          className="mt-2 text-gray-500 text-sm flex items-center gap-2"
          onClick={() => {
            if (imagePreview) {
              URL.revokeObjectURL(imagePreview);
            }
            onChange(undefined);
          }}
        >
          <Trash2
            role="presentation"
            aria-label="trash can"
            className="w-4 h-4"
          />
          Remove image
        </button>
      )}
    </div>
  );
});
ImageUpload.displayName = "Input";

export { ImageUpload };
