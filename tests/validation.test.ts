import { describe, expect, it } from "vitest";

import { createPostSchema, MINIMUM_PASSWORD_LENGTH, signupSchema } from "@/lib/validation";

describe("signupSchema", () => {
  it("trims and lowercases the email", () => {
    const result = signupSchema.safeParse({
      email: "  USER@Example.COM ",
      password: "a".repeat(MINIMUM_PASSWORD_LENGTH),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects passwords shorter than the minimum", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(MINIMUM_PASSWORD_LENGTH - 1),
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed emails", () => {
    const result = signupSchema.safeParse({
      email: "not-an-email",
      password: "a".repeat(MINIMUM_PASSWORD_LENGTH),
    });

    expect(result.success).toBe(false);
  });
});

describe("createPostSchema", () => {
  it("defaults published to true when omitted", () => {
    const result = createPostSchema.safeParse({ title: "Hello", body: "Some body" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.published).toBe(true);
    }
  });

  it("rejects a title that is empty after trimming", () => {
    const result = createPostSchema.safeParse({ title: "   ", body: "Some body" });

    expect(result.success).toBe(false);
  });

  it("rejects a body over the length limit", () => {
    const result = createPostSchema.safeParse({ title: "Hello", body: "a".repeat(10_001) });

    expect(result.success).toBe(false);
  });
});
