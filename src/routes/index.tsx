import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () => {
    const isAuthenticated = localStorage.getItem("passxyz-token") !== null;
    throw redirect({
      to: isAuthenticated ? "/vault" : "/login",
    });
  },
});