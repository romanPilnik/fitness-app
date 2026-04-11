import { createAuthClient } from "better-auth/react";
import { getApiOrigin } from "@/api/config";

export const authClient = createAuthClient({
  baseURL: getApiOrigin(),
});
