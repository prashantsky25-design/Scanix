import compactLight from "../assets/logo-compact-light.png";
import compactDark from "../assets/logo-compact-dark.png";
import fullLight from "../assets/logo-full-light.png";
import fullDark from "../assets/logo-full-dark.png";

const LOGOS = {
  compact: { light: compactLight, dark: compactDark },
  full: { light: fullLight, dark: fullDark },
};

// Shows the light or dark version of the logo depending on the theme
export default function Logo({ variant = "compact", className = "" }) {
  const { light, dark } = LOGOS[variant];
  return (
    <>
      <img src={light} alt="Scanix" className={`block dark:hidden ${className}`} />
      <img src={dark} alt="Scanix" className={`hidden dark:block ${className}`} />
    </>
  );
}
