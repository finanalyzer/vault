import { createFileRoute } from "@tanstack/react-router";
import ItemDetailPage from "../../../pages/ItemDetailPage";

export const Route = createFileRoute("/vault/entries/$entryId")({
  component: ItemDetailPage,
});