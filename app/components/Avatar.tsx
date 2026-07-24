import type { StaticImageData } from "next/image";

type AvatarProps = {
  src: StaticImageData;
  alt?: string;
};

export default function Avatar({ src, alt = "" }: AvatarProps) {
  return (
    <img
      src={src.src}
      alt={alt}
      className="aspect-square w-40 rounded-lg object-cover"
    />
  );
}
