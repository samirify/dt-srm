import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheckToSlot, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";

export type HeaderMessage = {
  text: string;
  variant: "default" | "success" | "danger" | "warning" | "info" | "primary" | "secondary" | "light";
  isLoading: boolean;
  loadingMessage?: string;
  icon?: IconProp;
};

export type Steps = {
  [key: string]: HeaderMessage;
};

export const steps: Steps = {
  selectProject: {
    text: "Select a project",
    variant: "light",
    isLoading: true,
    loadingMessage: "Loading projects...",
    icon: faCheckToSlot,
  },
  selectBranch: {
    text: "Select a branch",
    variant: "light",
    isLoading: true,
    loadingMessage: "Loading branches...",
    icon: faCheckToSlot,
  },
  deploy: {
    text: "Ready to deply",
    variant: "success",
    isLoading: true,
    loadingMessage: "Deploying...",
    icon: faCloudArrowUp,
  },
};
