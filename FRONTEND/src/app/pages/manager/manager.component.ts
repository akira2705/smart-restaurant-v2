import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QueueService } from '../../services/queue.service';
import { ManagerService } from '../../services/manager.service';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-manager',
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit, OnDestroy {

  loading = false;
  queueCount = 0;
  dashboard: any = null;
  recentActivities: any[] = [];
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private queueService: QueueService,
    private managerService: ManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    interval(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.managerService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.fetchQueueCount();
      },
      error: (err) => {
        console.error('Failed to load dashboard', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to load dashboard';
      }
    });
  }

  fetchQueueCount(): void {
    this.queueService.getQueueLength().subscribe({
      next: (res: any) => {
        this.queueCount = res.count || 0;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load queue count', err);
        this.queueCount = 0;
        this.loading = false;
      }
    });
  }

  seatNextCustomer(): void {
    if (this.queueCount === 0) {
      this.snackBar.open('No customers in queue', 'OK', { duration: 3000 });
      return;
    }
    this.loading = true;
    this.queueService.seatCustomer({}).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.snackBar.open(res.message || 'Customer seated successfully', 'OK', { duration: 3000 });
        this.fetchQueueCount();
      },
      error: (err: any) => {
        this.loading = false;
        const msg = err.error?.message || 'No customers to seat';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      }
    });
  }

  viewQueue(): void {
    this.snackBar.open('Navigate to Queue page', 'OK', { duration: 2000 });
  }

  viewTables(): void {
    this.snackBar.open('Navigate to Tables page', 'OK', { duration: 2000 });
  }

  viewReservations(): void {
    this.snackBar.open('Navigate to Reservations page', 'OK', { duration: 2000 });
  }

  getQueueCount(): number {
    return this.queueCount;
  }

  getAvailableTables(): number {
    return this.dashboard?.availableTables || 0;
  }

  getReservedTables(): number {
    return this.dashboard?.reservedTables || 0;
  }

  getOccupiedTables(): number {
    return this.dashboard?.occupiedTables || 0;
  }

  getOccupancyRate(): number {
    if (!this.dashboard?.totalTables) return 0;
    return Math.round((this.getOccupiedTables() / this.dashboard.totalTables) * 100);
  }

  getAvgWaitTime(): number {
    return this.queueCount > 0 ? Math.ceil(this.queueCount * 2.5) : 0;
  }

  getLongestWait(): number {
    return this.getAvgWaitTime() + (this.queueCount > 2 ? 10 : 0);
  }
}
