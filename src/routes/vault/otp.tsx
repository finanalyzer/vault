import { createFileRoute } from "@tanstack/react-router";
import OtpListPage from "../../pages/OtpListPage";

export const Route = createFileRoute("/vault/otp")({
  component: OtpListPage,
});