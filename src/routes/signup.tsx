import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "../pages/SignUpPage";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || '',
  }),
});