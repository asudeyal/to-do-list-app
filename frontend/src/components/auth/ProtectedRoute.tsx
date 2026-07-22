import {
    Navigate,
    Outlet,
} from "react-router";

import { getAccessToken } from "../../services/auth-storage";

export function ProtectedRoute() {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}