import { cn } from "./cn";

describe("cn", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-300");
    expect(result).toBe("text-red-500 bg-blue-300");
  });

  it("should handle conditional class names", () => {
    const isActive = true;
    const result = cn("base-class", {
      "conditional-class": isActive,
      "inactive-class": !isActive,
    });
    expect(result).toBe("base-class conditional-class");
  });

  it("should merge Tailwind classes properly", () => {
    // Testing that conflicting Tailwind classes are properly merged
    const result = cn("p-4 p-8 m-2");
    // twMerge should keep the last conflicting class, so p-8 should win over p-4
    expect(result).toBe("p-8 m-2");
  });

  it("should handle mixed inputs", () => {
    const isActive = true;
    const result = cn(
      "font-bold",
      { "text-lg": isActive },
      ["underline", { "no-underline": !isActive }],
      null,
      undefined,
      false
    );
    expect(result).toBe("font-bold text-lg underline");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle falsy values", () => {
    const result = cn(null, undefined, false, "", "valid-class");
    expect(result).toBe("valid-class");
  });

  it("should merge complex Tailwind responsive classes", () => {
    const result = cn(
      "text-sm md:text-base lg:text-lg",
      "text-base sm:text-lg",
      "lg:text-xl"
    );
    expect(result).toBe("md:text-base text-base sm:text-lg lg:text-xl");
  });

  it("should handle array inputs", () => {
    const result = cn(["class-a", "class-b"], ["class-c", "class-d"]);
    expect(result).toBe("class-a class-b class-c class-d");
  });

  it("should handle nested array inputs", () => {
    const result = cn([["class-a", "class-b"], ["class-c", "class-d"]]);
    expect(result).toBe("class-a class-b class-c class-d");
  });

  it("should merge margin and padding classes correctly", () => {
    const result = cn("p-2 p-4 m-1 m-3");
    // The last specified values should win
    expect(result).toBe("p-4 m-3");
  });
});