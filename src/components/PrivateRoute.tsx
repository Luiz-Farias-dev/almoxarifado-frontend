import { Navigate } from "react-router-dom";

function PrivateRoute({ element }: { element: JSX.Element }) {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/almoxarifado/login" replace />;
  }
  return element;
}

export default PrivateRoute;
