import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ArrowRight, Check } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const ONBOARDING_STEPS = [
  {
    title: "Welcome to BlockPlane",
    description: "Compare building materials by their environmental impact and regenerative potential.",
    image: "🌿",
    details: [
      "View lifecycle carbon emissions (LIS)",
      "Assess regenerative impact (RIS)",
      "Compare cost-performance (CPI)",
    ],
  },
  {
    title: "Understanding the Quadrants",
    description: "Materials are classified into four categories based on their LIS and RIS scores.",
    image: "📊",
    details: [
      "Regenerative: Low impact + High regeneration (Best)",
      "Transitional: Mixed performance (Acceptable)",
      "Costly: Low impact but not regenerative",
      "Problematic: High impact + Low regeneration (Worst)",
    ],
  },
  {
    title: "Start Exploring",
    description: "Browse materials, compare options, and make informed decisions for your projects.",
    image: "🚀",
    details: [
      "Filter by material type or region",
      "Click materials to see detailed breakdowns",
      "Export comparisons for your team",
    ],
  },
];

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      localStorage.setItem("blockplane_onboarding_complete", "true");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onClose();
    localStorage.setItem("blockplane_onboarding_complete", "true");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="text-6xl text-center mb-4">{step.image}</div>
          <DialogTitle className="text-2xl text-center">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-6">
          {step.details.map((detail, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{detail}</p>
            </div>
          ))}
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-4">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {isLastStep ? "Get Started" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
