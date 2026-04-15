interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}

export default function SectionHeading({ eyebrow, title, body, align = "left" }: SectionHeadingProps) {
  return (
    <div className={`grid gap-4 ${align === "center" ? "justify-items-center text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title max-w-3xl">{title}</h2>
      {body ? <p className="section-body max-w-2xl">{body}</p> : null}
    </div>
  );
}
