import { createFileRoute } from "@tanstack/react-router";
import NewItemPage from "../../../pages/NewItemPage";

export const Route = createFileRoute("/vault/new/$groupId")({
  component: NewItemPage,
});