const PALETTES = [
  ["#d8ed68", "#173326", "#0b1712"],
  ["#ff795f", "#3d1834", "#180b16"],
  ["#85a8ff", "#172949", "#0b1426"],
  ["#f4bc4d", "#4a2c12", "#1f1309"],
  ["#cf9bff", "#312044", "#160d20"],
] as const;

function hash(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0);
}

export default function PostThumbnail({ title, keyword }: { title: string; keyword?: string }) {
  const seed = hash(title);
  const [accent, middle, dark] = PALETTES[seed % PALETTES.length];
  const label = keyword ?? "privacy";

  return (
    <div
      role="img"
      aria-label={`Thumbnail for ${title}`}
      className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10"
      style={{ background: `linear-gradient(145deg, ${middle}, ${dark})` }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ color: accent }}>
        <circle cx={25 + seed % 35} cy={24 + seed % 22} r="29" fill="currentColor" opacity=".16" />
        <path d="M-8 83 C20 46 49 108 108 49 L108 108 L-8 108 Z" fill="currentColor" opacity=".22" />
        <path d="M-5 73 C23 37 55 97 108 37" fill="none" stroke="currentColor" strokeWidth="2" opacity=".62" />
      </svg>
    </div>
  );
}
