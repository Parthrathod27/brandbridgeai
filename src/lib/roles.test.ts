import { describe, it, expect } from "vitest";
import {
  getDashboardPath,
  getRoleNavItems,
  isValidRole,
  ROLE_OPTIONS,
  ROLE_LABELS,
  type UserRole,
} from "./roles";

const ALL_ROLES: UserRole[] = ["brand", "product_owner", "freelancer", "hirer"];

describe("isValidRole", () => {
  it.each(ALL_ROLES)("accepts the real role %s", (role) => {
    expect(isValidRole(role)).toBe(true);
  });

  it.each(["admin", "", "BRAND", "product owner", "undefined"])(
    "rejects %j",
    (value) => {
      expect(isValidRole(value)).toBe(false);
    },
  );
});

describe("getDashboardPath", () => {
  it.each(ALL_ROLES)("builds the dashboard path for %s", (role) => {
    expect(getDashboardPath(role)).toBe(`/dashboard/${role}`);
  });

  it.each([null, undefined, ""])(
    "falls back to the generic dashboard for %j",
    (value) => {
      expect(getDashboardPath(value as never)).toBe("/dashboard");
    },
  );
});

describe("getRoleNavItems", () => {
  it.each(ALL_ROLES)("returns navigation for %s", (role) => {
    const items = getRoleNavItems(role);
    expect(items.length).toBeGreaterThan(0);
  });

  it.each(ALL_ROLES)("scopes every %s link to that role's namespace", (role) => {
    for (const item of getRoleNavItems(role)) {
      expect(item.href.startsWith(`/dashboard/${role}`)).toBe(true);
    }
  });

  it.each(ALL_ROLES)("gives %s a label and icon for every item", (role) => {
    for (const item of getRoleNavItems(role)) {
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
    }
  });

  it.each(ALL_ROLES)("never repeats a destination for %s", (role) => {
    const hrefs = getRoleNavItems(role).map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("leads every role with its dashboard root", () => {
    for (const role of ALL_ROLES) {
      expect(getRoleNavItems(role)[0].href).toBe(getDashboardPath(role));
    }
  });
});

describe("role metadata", () => {
  it("exposes one option per supported role", () => {
    expect(ROLE_OPTIONS).toHaveLength(ALL_ROLES.length);
    expect(ROLE_OPTIONS.map((o) => o.id).sort()).toEqual([...ALL_ROLES].sort());
  });

  it("labels every role", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
    }
  });

  it("gives every role option display copy", () => {
    for (const option of ROLE_OPTIONS) {
      expect(option.title).toBeTruthy();
      expect(option.shortTitle).toBeTruthy();
      expect(option.desc).toBeTruthy();
    }
  });
});
