import { createFileRoute } from "@tanstack/react-router";
import IconsPage from "../../pages/IconsPage";

export const Route = createFileRoute("/vault/icons")({
  component: IconsPage,
});