import { createFileRoute } from "@tanstack/react-router";
import GroupEditPage from "../../../../pages/GroupEditPage";

export const Route = createFileRoute("/vault/groups/$groupId/fields")({
  component: GroupEditPage,
});