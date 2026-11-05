import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated, setPermissions } from "../store/authSlice";
import { useGetMyPermissionsQuery } from "../store/api/coworkersApi";

export const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  const isLoggedIn = isAuthenticated || localStorage.getItem("isLoggedIn") === "true";

  const { data: permissionsData } = useGetMyPermissionsQuery(undefined, {
    skip: !isLoggedIn,
  });

  useEffect(() => {
    if (permissionsData) {
      dispatch(setPermissions(permissionsData));
    }
  }, [permissionsData, dispatch]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
