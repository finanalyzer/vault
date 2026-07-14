import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "../pages/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    username: (search.username as string) || '',
  }),
});