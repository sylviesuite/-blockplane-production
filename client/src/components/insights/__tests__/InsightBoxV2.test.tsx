import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import InsightBoxV2 from "@/components/insights/InsightBoxV2";
import { buildMaterialInsightPrompt } from "@/lib/ai/prompts/materialInsightPrompt";
import type { InsightProvider } from "@/lib/ai/insightProviderTypes";
import { localMaterials } from "@/data/materials";

const baseProps = {
  materialId: "test-material",
  materialName: "Test material",
  lis: 15,
  ris: 65,
  cpi: 120,
};

describe("InsightBoxV2", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the static fallback when AI is not selected", () => {
    render(<InsightBoxV2 {...baseProps} />);
    expect(screen.getByText(/LIS 15\.0/)).toBeInTheDocument();
    expect(screen.getByText(/RIS 65\.0/)).toBeInTheDocument();
    expect(screen.getByText(/CPI 120\.00/)).toBeInTheDocument();
  });

  it("toggles between static and AI modes", async () => {
    const user = userEvent.setup();
    render(<InsightBoxV2 {...baseProps} />);
    const aiButton = screen.getByRole("button", { name: /ai \(beta\)/i });
    await user.click(aiButton);
    expect(aiButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /ai \(beta\)/i })).toBeInTheDocument();
  });

  it("shows cached AI output when available", async () => {
    const user = userEvent.setup();
    const cacheKey = "insightv2:test-material:15.00:65.00:120.00";
    localStorage.setItem(cacheKey, "cached insight text");
    render(<InsightBoxV2 {...baseProps} />);
    const aiButton = screen.getByRole("button", { name: /ai \(beta\)/i });
    await user.click(aiButton);
    expect(await screen.findByText(/cached insight text/)).toBeInTheDocument();
  });

  it("keeps static fallback and surfaces an error when AI generation fails", async () => {
    const user = userEvent.setup();
    const failingProvider: InsightProvider = {
      generateMaterialInsight: async () => {
        throw new Error("fail");
      },
    };
    render(<InsightBoxV2 {...baseProps} insightProvider={failingProvider} />);
    const aiButton = screen.getByRole("button", { name: /ai \(beta\)/i });
    await user.click(aiButton);
    const generateButton = screen.getByRole("button", { name: /generate insight/i });
    await user.click(generateButton);
    expect(await screen.findByText(/AI insight unavailable right now/i)).toBeInTheDocument();
    expect(screen.getByText(/Static fallback/i)).toBeInTheDocument();
  });

  it("displays loading state while generating an AI insight", async () => {
    const user = userEvent.setup();
    let resolveDeferred: (value: { text: string }) => void = () => {};
    const promise = new Promise<{ text: string }>((resolve) => {
      resolveDeferred = resolve;
    });

    const slowProvider: InsightProvider = {
      generateMaterialInsight: () => promise,
    };

    render(<InsightBoxV2 {...baseProps} insightProvider={slowProvider} />);
    const aiButton = screen.getByRole("button", { name: /ai \(beta\)/i });
    await user.click(aiButton);
    const generateButton = screen.getByRole("button", { name: /generate insight/i });
    await user.click(generateButton);
    await waitFor(() => expect(generateButton).toHaveTextContent(/generating/i));
    resolveDeferred({ text: "AI result" });
    expect(await screen.findByText(/AI result/)).toBeInTheDocument();
  });

  it("works with local material props and AI toggle", async () => {
    const user = userEvent.setup();
    const material = localMaterials[0];
    const mockProvider: InsightProvider = {
      generateMaterialInsight: vi.fn(async () => ({ text: "Local AI insight" })),
    };

    render(
      <InsightBoxV2
        materialId={material.id}
        materialName={material.name}
        lis={material.lis}
        ris={material.ris}
        cpi={material.cpi}
        insightProvider={mockProvider}
      />
    );

    expect(
      screen.getByText(new RegExp(`${material.name}: LIS ${material.lis}`))
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: material.name, level: 3 })
    ).toBeInTheDocument();

    const aiToggle = screen.getByRole("button", { name: /ai \(beta\)/i });
    await user.click(aiToggle);

    const generateButton = screen.getByRole("button", { name: /generate insight/i });
    await user.click(generateButton);

    expect(await screen.findByText(/Local AI insight/)).toBeInTheDocument();
    expect(mockProvider.generateMaterialInsight).toHaveBeenCalledWith(
      expect.objectContaining({
        materialId: material.id,
        materialName: material.name,
        lis: material.lis,
        ris: material.ris,
        cpi: material.cpi,
      })
    );
  });

  it("builds prompts that mention the material and scores", () => {
    const prompt = buildMaterialInsightPrompt({
      materialName: "Clayboard",
      lis: 32,
      ris: 70,
      cpi: 85,
    });
    expect(prompt).toMatch(/Material: Clayboard/);
    expect(prompt).toMatch(/LIS: 32/);
    expect(prompt).toMatch(/RIS: 70/);
    expect(prompt).toMatch(/CPI: 85/);
  });
});

