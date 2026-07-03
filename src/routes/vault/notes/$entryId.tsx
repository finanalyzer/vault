import { createFileRoute } from "@tanstack/react-router";
import NotesPage from "../../../pages/NotesPage";

export const Route = createFileRoute("/vault/notes/$entryId")({
  component: NotesPage,
});