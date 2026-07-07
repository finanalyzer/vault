import { createFileRoute } from "@tanstack/react-router";
import IconsPage from "../../pages/IconsPage";

export const Route = createFileRoute("/vault/icons")({
  component: IconsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    itemId: search.itemId as string,
    isGroup: search.isGroup === 'true',
  }),
});