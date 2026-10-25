import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommandPalette from "@/components/CommandPalette";

test("CommandPalette does not execute injected script in query input", async () => {
  render(<CommandPalette />);
  fireEvent.keyDown(document, { key: "k", metaKey: true });

  const input = screen.getByRole("combobox");
  const maliciousInput = '<img src=x onerror="window.__xss_fired=true">';

  await userEvent.type(input, maliciousInput);

  expect((window as any).__xss_fired).toBeUndefined();
  // Confirm it's rendered as literal text if echoed anywhere, not injected as HTML
  expect(document.querySelector('img[src="x"]')).toBeNull();
});

test("Rapid double-submit does not fire duplicate API calls", async () => {
  const fetchSpy = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [], data: { answer: "Test response" } }) });
  global.fetch = fetchSpy;

  render(<CommandPalette />);
  fireEvent.keyDown(document, { key: "k", metaKey: true });
  const input = screen.getByRole("combobox");

  await userEvent.type(input, "fee complaints");
  // Simulate user mashing Enter 10 times rapidly
  for (let i = 0; i < 10; i++) {
    fireEvent.keyDown(input, { key: "Enter" });
  }

  await new Promise((r) => setTimeout(r, 300));
  expect(fetchSpy.mock.calls.length).toBeLessThanOrEqual(2); // debounced/guarded, not 10 calls
});
