import { Suspense } from "react";
import { DashboardPage } from "./components/DashboardPage";

export default async function page() {
  // return <DashboardPage />;
  return <Suspense><DashboardPage /></Suspense>;
}
