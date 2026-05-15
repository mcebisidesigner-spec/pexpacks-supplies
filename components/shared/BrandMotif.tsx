import styles from "./BrandMotif.module.css";

type BrandMotifProps = {
  position?: "topRight" | "bottomLeft";
  className?: string;
};

export function BrandMotif({
  position = "topRight",
  className,
}: BrandMotifProps) {
  return (
    <div
      className={[styles.motif, styles[position], className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}
