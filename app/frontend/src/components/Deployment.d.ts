export const inProgressStatuses = ["NEW", "STARTED"]

export type DeploymentSocketMessage = {
  id: string;
  deploymentId: number | undefined;
  content: string;
  textColor?: string;
  icon?: string;
  deploymentStatus?: string;
};

export interface DeploymentStatusProps { }
