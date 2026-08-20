import { describe, expect, it } from "vitest";

import { addMoney, formatMoney, money, multiplyMoney } from "./money";

describe("money", () => {
  it("keeps all arithmetic in integer cents", () => {
    const unitPrice = money(3800);

    expect(multiplyMoney(unitPrice, 3)).toEqual({
      amountInCents: 11400,
      currency: "EUR",
    });
    expect(addMoney(unitPrice, money(2500))).toEqual({
      amountInCents: 6300,
      currency: "EUR",
    });
  });

  it("rejects fractional cent values", () => {
    expect(() => money(10.5)).toThrow(/integer amount in cents/i);
  });

  it("formats both supported storefront locales", () => {
    expect(formatMoney(money(3800), "it")).toContain("38,00");
    expect(formatMoney(money(3800), "en")).toContain("38.00");
  });
});
