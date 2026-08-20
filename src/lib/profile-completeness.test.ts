import { describe, it, expect } from "vitest";
import { calculateProfileCompleteness } from "./profile-completeness";

describe("calculateProfileCompleteness", () => {
  it("reports 0% and a prompt when there is no profile at all", () => {
    const result = calculateProfileCompleteness(null, "brand");

    expect(result.percent).toBe(0);
    expect(result.missing).toHaveLength(1);
  });

  describe("brand role", () => {
    const completeBrand = {
      companyName: "Solace Audio",
      logo: "https://example.com/logo.png",
      bio: "Premium audio gear",
      industry: "Consumer Electronics",
      location: "Mumbai",
      website: "https://solace.example",
      targetAudience: "25-40 urban professionals",
      budgetRange: "$5k-$10k",
      collaborationLookingFor: ["Co-branded Social Post"],
      businessType: "Private Limited",
    };

    it("reports 100% with no missing fields when every field is filled", () => {
      const result = calculateProfileCompleteness(completeBrand as never, "brand");

      expect(result.percent).toBe(100);
      expect(result.missing).toEqual([]);
    });

    it("reports 0% for an empty profile object", () => {
      const result = calculateProfileCompleteness({}, "brand");

      expect(result.percent).toBe(0);
      expect(result.missing).toHaveLength(10);
    });

    it("scales the percentage with the number of filled fields", () => {
      const half = {
        companyName: "Solace Audio",
        logo: "https://example.com/logo.png",
        bio: "Premium audio gear",
        industry: "Consumer Electronics",
        location: "Mumbai",
      };

      const result = calculateProfileCompleteness(half as never, "brand");

      expect(result.percent).toBe(50);
      expect(result.missing).toHaveLength(5);
    });

    it("treats an empty string as unfilled", () => {
      const result = calculateProfileCompleteness(
        { ...completeBrand, website: "" } as never,
        "brand",
      );

      expect(result.percent).toBe(90);
      expect(result.missing).toContain("Add website URL");
    });

    it("returns human-readable labels rather than raw field names", () => {
      const result = calculateProfileCompleteness({}, "brand");

      expect(result.missing).toContain("Upload brand logo");
      expect(result.missing).not.toContain("logo");
    });
  });

  describe("freelancer role", () => {
    it("reports 100% when profile and freelancer metadata are both complete", () => {
      const result = calculateProfileCompleteness(
        { avatar: "a.png", bio: "Designer", location: "Pune" } as never,
        "freelancer",
        {
          skills: ["Figma"],
          categories: ["Design"],
          hourlyRate: 40,
          portfolioCount: 3,
        },
      );

      expect(result.percent).toBe(100);
      expect(result.missing).toEqual([]);
    });

    it("counts a zero hourly rate as unset", () => {
      const result = calculateProfileCompleteness(
        { avatar: "a.png", bio: "Designer", location: "Pune" } as never,
        "freelancer",
        {
          skills: ["Figma"],
          categories: ["Design"],
          hourlyRate: 0,
          portfolioCount: 3,
        },
      );

      expect(result.missing).toContain("Set hourly rate");
      expect(result.percent).toBeLessThan(100);
    });

    it("flags every freelancer requirement when metadata is absent", () => {
      const result = calculateProfileCompleteness({} as never, "freelancer");

      expect(result.percent).toBe(0);
      expect(result.missing).toHaveLength(7);
    });
  });

  describe("other roles", () => {
    it("uses the shorter four-field checklist", () => {
      const result = calculateProfileCompleteness(
        {
          companyName: "Northwind",
          bio: "Foods",
          industry: "FMCG",
          targetAudience: "Families",
        } as never,
        "hirer",
      );

      expect(result.percent).toBe(100);
    });

    it("scores partial completion against the four-field list", () => {
      const result = calculateProfileCompleteness(
        { companyName: "Northwind", bio: "Foods" } as never,
        "hirer",
      );

      expect(result.percent).toBe(50);
    });
  });
});
