import { Routes } from "@angular/router";

import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { TablesComponent } from "./pages/tables/tables.component";
import { QueueComponent } from "./pages/queue/queue.component";
import { ReservationComponent } from "./pages/reservation/reservation.component";
import { ManagerComponent } from "./pages/manager/manager.component";
import { LoginComponent } from "./login/login.component";

export const routes: Routes = [
  // LOGIN FIRST
  { path: "login", component: LoginComponent },

  // PROTECTED APP ROUTES
  { path: "", component: DashboardComponent },
  { path: "tables", component: TablesComponent },
  { path: "queue", component: QueueComponent },
  { path: "reserve", component: ReservationComponent },
  { path: "manager", component: ManagerComponent },

  // FALLBACK
  { path: "**", redirectTo: "login" },
];
