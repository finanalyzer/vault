import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vault/entries/$entryId")({
  component: Outlet,
});