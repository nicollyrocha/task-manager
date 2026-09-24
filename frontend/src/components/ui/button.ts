type ButtonVariant = "primary" | "secondary" | "danger";

const base =
  "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  secondary: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
  danger: "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950",
};

/** Classes de botão, reaproveitáveis também em `<Link>`. */
export function buttonStyles(variant: ButtonVariant = "primary") {
  return `${base} ${variants[variant]}`;
}
