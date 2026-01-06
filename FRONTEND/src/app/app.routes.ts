import { Routes } from "@angular/router";

import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { TablesComponent } from "./pages/tables/tables.component";
import { QueueComponent } from "./pages/queue/queue.component";
import { ReservationComponent } from "./pages/reservation/reservation.component";
import { ManagerComponent } from "./pages/manager/manager.component";
import { LoginComponent } from "./login/login.component";
import { TableOrdersComponent } from "./pages/table-orders/table-orders.component";
import { authGuard } from "./guards/auth.guard";
import { managerGuard } from "./guards/manager.guard";

export const routes: Routes = [
  // LOGIN FIRST
  { path: "login", component: LoginComponent },

  // PROTECTED APP ROUTES
  { path: "", component: DashboardComponent },
  { path: "tables", component: TablesComponent },
  { path: "queue", component: QueueComponent },
  { path: "reserve", component: ReservationComponent },
  { path: "table-orders", component: TableOrdersComponent },
  { path: "manager", component: ManagerComponent },
  { path: "", component: DashboardComponent, canActivate: [authGuard] },
  { path: "tables", component: TablesComponent, canActivate: [authGuard] },
  { path: "queue", component: QueueComponent, canActivate: [authGuard] },
  { path: "reserve", component: ReservationComponent, canActivate: [authGuard] },
  { path: "table-orders", component: TableOrdersComponent, canActivate: [authGuard] },
  { path: "manager", component: ManagerComponent, canActivate: [authGuard, managerGuard] },

  // FALLBACK
  { path: "**", redirectTo: "login" },
];
