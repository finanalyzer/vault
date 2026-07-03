import { createFileRoute } from "@tanstack/react-router";
import ItemsPage from "../../../pages/ItemsPage";

export const Route = createFileRoute("/vault/groups/$groupId")({
  component: ItemsPage,
});