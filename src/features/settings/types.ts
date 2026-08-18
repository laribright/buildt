export type SettingsActionState = {
  success: boolean;
  message: string | null;
  fieldErrors?: {
    name?: string[];
    theme?: string[];
  };
};
