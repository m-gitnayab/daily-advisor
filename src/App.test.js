import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the advisor experience", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /make room for a better thought/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /give me perspective/i }),
  ).toBeInTheDocument();
});
