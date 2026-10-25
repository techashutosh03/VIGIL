import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import RiskDNAGauge from "@/components/RiskDNAGauge";

const malformedResponses = [
  {},                                    // empty object
  { score: "not-a-number" },             // wrong type
  { score: null },                       // null
  { score: 99999 },                      // out of 0-100 range
  { score: -50 },                        // negative
  undefined,                             // completely missing body
];

malformedResponses.forEach((payload, idx) => {
  test(`RiskDNAGauge survives malformed response #${idx}`, async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    render(<RiskDNAGauge institutionId="inst-1" />);

    await waitFor(() => {
      // Must render SOMETHING (error state or fallback or meter), never crash the component tree
      expect(screen.queryByText(/error/i) || screen.queryByText(/demo/i) || screen.queryByRole("meter")).toBeTruthy();
    });
  });
});

test("RiskDNAGauge survives fetch throwing network error", async () => {
  global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  render(<RiskDNAGauge institutionId="inst-1" />);
  await waitFor(() => {
    expect(screen.getByText(/demo mode|unavailable|error/i)).toBeInTheDocument();
  });
});
