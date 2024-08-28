/*
Samir: Found this nice hook here: https://stackoverflow.com/a/65008608/771174
It's always good to give people the credit they deserve ;-)
*/
import { useEffect, useState } from "react";

export default function useOnScreen(ref: any) {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = new IntersectionObserver(([entry]) =>
    setIntersecting(entry.isIntersecting)
  );

  useEffect(() => {
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  });

  return isIntersecting;
}
