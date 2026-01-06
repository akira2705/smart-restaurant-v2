import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ReservationComponent implements OnInit, OnDestroy {

  loading = false;
  reservationsList: any[] = [];
  private destroy$ = new Subject<void>();

  form = {
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 4,
    tableType: 'standard',
    notes: ''
  };

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.fetchReservations();
    interval(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.fetchReservations();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ---------------- FETCH ---------------- */

  fetchReservations(): void {
    this.loading = true;

    this.reservationService.getReservations().subscribe(
      (data: any) => {
        this.reservationsList = (data || []).map((res: any) => ({
          id: res.id,
          name: res.name,
          email: res.email,
          phone: res.phone,
          date: res.reservation_date,
          time: res.reservation_time,
          guests: res.guests,
          tableType: res.table_type,
          notes: res.special_requests,
          status: (res.status || '').toUpperCase(),
          table_number: res.table_number
        }));
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      }
    );
  }

  /* ---------------- SUBMIT ---------------- */

  submitReservation(): void {
    if (!this.form.name || !this.form.email || !this.form.date || !this.form.time) {
      return;
    }

    this.loading = true;

    const payload = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      date: this.form.date,
      time: this.form.time,
      guests: this.form.guests,
      tableType: this.form.tableType,
      specialRequests: this.form.notes
    };

    this.reservationService.createReservation(payload).subscribe(
      () => {
        this.resetForm();
        this.fetchReservations();
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      }
    );
  }

  /* ---------------- ACTIONS ---------------- */

  confirmReservation(res: any): void {
    this.loading = true;

    this.reservationService.confirmReservation(res.id).subscribe(
      () => {
        this.fetchReservations();
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      }
    );
  }

  cancelReservation(res: any): void {
    this.loading = true;

    this.reservationService.cancelReservation(res.id).subscribe(
      () => {
        this.fetchReservations();
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      }
    );
  }

  /* ---------------- HELPERS ---------------- */

  resetForm(): void {
    this.form = {
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: 4,
      tableType: 'standard',
      notes: ''
    };
  }

  getTotalReservations(): number {
    return this.reservationsList.length;
  }

  getTodayReservations(): number {
    const today = new Date().toDateString();
    return this.reservationsList.filter(
      res => new Date(res.date).toDateString() === today
    ).length;
  }

  getPendingReservations(): number {
    return this.reservationsList.filter(
      res => res.status === 'PENDING'
    ).length;
  }
}
