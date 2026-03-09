import { useEffect, useRef, useState } from "react";

export function useFlash(value: number) {
  const prev  = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | "">("");

  useEffect(() => {
    if (value === prev.current) return;
    setFlash(value > prev.current ? "up" : "down");
    prev.current = value;
    const t = setTimeout(() => setFlash(""), 600);
    return () => clearTimeout(t);
  }, [value]);

  return flash;
}
