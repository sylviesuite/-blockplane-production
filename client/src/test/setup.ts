/**
 * Extend Vitest expect with @testing-library/jest-dom matchers (e.g. toBeInTheDocument).
 * Must run after Vitest sets up; use setupFiles in vitest.config.ts.
 */
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom";
expect.extend(matchers);
