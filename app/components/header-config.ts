export const HEADER_CONFIG = {
  scrollThreshold: 20,
  transitionDuration: 0.3,
  transitionEasing: [0.4, 0, 0.2, 1] as [number, number, number, number],
  
  logo: {
    expanded: {
      width: 180,
      height: 56,
    },
    compact: {
      width: 140,
      height: 44,
    },
  },
  
  spacing: {
    expanded: {
      paddingY: "1.5rem",
    },
    compact: {
      paddingY: "0.75rem",
    },
  },
  
  mobile: {
    menuWidth: "100%",
    menuWidthSm: "20rem",
    springConfig: {
      damping: 30,
      stiffness: 300,
    },
  },
  
  animation: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slideIn: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
    expandHeight: {
      initial: { height: 0, opacity: 0 },
      animate: { height: "auto", opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: { duration: 0.2 },
    },
  },
};

export const MAIN_NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
] as const;

export type MainNavItem = typeof MAIN_NAVIGATION[number];
