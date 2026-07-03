import { createFileRoute } from "@tanstack/react-router";
import QrCodePage from "../../pages/QrCodePage";

export const Route = createFileRoute("/vault/qrcode")({
  component: QrCodePage,
});