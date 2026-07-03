import { createFileRoute } from "@tanstack/react-router";
import FieldEditPage from "../../../../pages/FieldEditPage";

export const Route = createFileRoute("/vault/entries/$entryId/fields")({
  component: FieldEditPage,
});