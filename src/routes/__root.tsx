import { createRootRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "../contexts/AuthContext";
import { NavigationProvider } from "../contexts/NavigationContext";

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <NavigationProvider>
        <Outlet />
      </NavigationProvider>
    </AuthProvider>
  ),
});