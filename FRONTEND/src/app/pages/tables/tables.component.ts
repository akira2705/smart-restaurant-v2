import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TableService } from '../../services/table.service';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-tables',
  imports: [CommonModule, MatCardModule],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit, OnDestroy {

  tables: any[] = [];
  loading = true;
  selectedTable: any = null;
  private destroy$ = new Subject<void>();

  constructor(private tableService: TableService) {}

  ngOnInit(): void {
    this.fetchTables();
    interval(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.fetchTables();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchTables(): void {
    this.tableService.getAllTables().subscribe({
      next: (data) => {
        this.tables = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tables', err);
        this.loading = false;
      }
    });
  }

  getTabulatedTables(): any[] {
    const positions = [
      { x: 10, y: 15 },
      { x: 25, y: 15 },
      { x: 40, y: 15 },
      { x: 55, y: 15 },
      { x: 70, y: 15 },
      { x: 85, y: 15 },
      { x: 10, y: 40 },
      { x: 25, y: 40 },
      { x: 40, y: 40 },
      { x: 55, y: 40 },
      { x: 70, y: 40 },
      { x: 85, y: 40 },
      { x: 10, y: 65 },
      { x: 25, y: 65 },
      { x: 40, y: 65 },
      { x: 55, y: 65 },
      { x: 70, y: 65 },
      { x: 85, y: 65 }
    ];

    return this.tables.map((table, index) => ({
      ...table,
      position: positions[index % positions.length]
    }));
  }

  selectTable(table: any): void {
    this.selectedTable = table;
  }

  getSeatsArray(capacity: number): any[] {
    return Array(capacity).fill(0);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'available';
      case 'RESERVED': return 'reserved';
      case 'OCCUPIED': return 'occupied';
      default: return '';
    }
  }
}
