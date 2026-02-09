// Ambient declarations for UI dependencies (types may be missing or not installed).
// Minimal fix so TypeScript does not report "Cannot find module" in client/src only.

declare module "react-day-picker" {
  export const DayPicker: any;
  export const DayButton: any;
  export function getDefaultClassNames(): Record<string, string>;
}

declare module "embla-carousel-react" {
  export default function useEmblaCarousel(options?: any, plugins?: any): [any, any];
}

declare module "cmdk" {
  export const Command: any;
}

declare module "vaul" {
  export const Drawer: any;
}

declare module "react-hook-form" {
  export function useForm(options?: any): any;
  export function useFormContext(): any;
  export function useWatch(options?: any): any;
  export function useController(props: any): any;
  export const FormProvider: any;
  export const Controller: any;
}

declare module "input-otp" {
  export const InputOTP: any;
  export const InputOTPGroup: any;
  export const InputOTPSlot: any;
  export const InputOTPSeparator: any;
  export function useInputOTP(config?: any): any;
}

declare module "react-resizable-panels" {
  export const PanelGroup: any;
  export const Panel: any;
  export const PanelResizeHandle: any;
  export function useImperativePanelHandle(ref: any): void;
}
