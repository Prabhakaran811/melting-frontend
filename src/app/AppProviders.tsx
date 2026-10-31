
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { restoreSession } from "../features/auth/authThunks";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return <>{children}</>;
}
