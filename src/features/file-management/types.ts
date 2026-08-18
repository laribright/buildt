export type ProjectFile = {
  children?: ProjectFile[];
  content?: string;
  id: string;
  language?: string;
  name: string;
  path: string;
  projectId: string;
  type?: "json" | "markdown" | "script" | "typescript";
};

export type FileActionState = {
  success: boolean;
  message: string | null;
  fieldErrors?: {
    intent?: string[];
    path?: string[];
    projectId?: string[];
  };
};
