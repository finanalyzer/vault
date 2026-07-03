import { createFileRoute } from "@tanstack/react-router";
import ImagePreviewPage from "../../../../pages/ImagePreviewPage";

export const Route = createFileRoute("/vault/preview/$entryId/$attachmentId")({
  component: ImagePreviewPage,
});