import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../../services/table.service';
import { Subject, interval, takeUntil } from 'rxjs';

type TableStage = 'ORDERING' | 'EATING' | 'LEFT';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface TableOrderState {
  stage: TableStage;
  orders: OrderItem[];
  total: number;
  updatedAt: Date;
}

@Component({
  standalone: true,
  selector: 'app-table-orders',
  imports: [CommonModule],
  templateUrl: './table-orders.component.html',
  styleUrls: ['./table-orders.component.css']
})
export class TableOrdersComponent implements OnInit, OnDestroy {
  tables: any[] = [];
  orderStates = new Map<number, TableOrderState>();
  loading = false;
  private destroy$ = new Subject<void>();

  private dishes = [
    { name: 'Butter Chicken', price: 18 },
    { name: 'Paneer Tikka', price: 14 },
    { name: 'Masala Dosa', price: 12 },
    { name: 'Chole Bhature', price: 11 },
    { name: 'Biryani', price: 16 },
    { name: 'Dal Makhani', price: 13 },
    { name: 'Palak Paneer', price: 14 },
    { name: 'Chicken Tikka', price: 17 },
    { name: 'Rogan Josh', price: 19 },
    { name: 'Pani Puri', price: 8 },
    { name: 'Aloo Gobi', price: 12 },
    { name: 'Samosa Chaat', price: 9 }
  ];

  constructor(private tableService: TableService) {}

  ngOnInit(): void {
    this.fetchTables();
    interval(10000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.advanceStages();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchTables(): void {
    this.loading = true;
    this.tableService.getAllTables().subscribe({
      next: (data) => {
        this.tables = data;
        this.tables.forEach((table) => {
          if (!this.orderStates.has(table.id)) {
            this.orderStates.set(table.id, {
              stage: 'ORDERING',
              orders: [],
              total: 0,
              updatedAt: new Date()
            });
          }
        });
        this.loading = false;
        this.advanceStages();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  advanceStages(): void {
    this.tables.forEach((table) => {
      const current = this.orderStates.get(table.id);
      const nextStage: TableStage = current?.stage === 'ORDERING'
        ? 'EATING'
        : current?.stage === 'EATING'
          ? 'LEFT'
          : 'ORDERING';

      if (nextStage === 'ORDERING') {
        const orders = this.generateOrders();
        const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
        this.orderStates.set(table.id, {
          stage: nextStage,
          orders,
          total,
          updatedAt: new Date()
        });
        this.tableService.updateTableStatus(table.id, 'OCCUPIED').subscribe();
      }

      if (nextStage === 'EATING') {
        this.orderStates.set(table.id, {
          stage: nextStage,
          orders: current?.orders || [],
          total: current?.total || 0,
          updatedAt: new Date()
        });
        this.tableService.updateTableStatus(table.id, 'OCCUPIED').subscribe();
      }

      if (nextStage === 'LEFT') {
        this.orderStates.set(table.id, {
          stage: nextStage,
          orders: [],
          total: 0,
          updatedAt: new Date()
        });
        this.tableService.updateTableStatus(table.id, 'AVAILABLE').subscribe();
      }
    });
  }

  generateOrders(): OrderItem[] {
    const count = Math.max(1, Math.floor(Math.random() * 10) + 1);
    const selected: OrderItem[] = [];
    const shuffled = [...this.dishes].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count && i < shuffled.length; i += 1) {
      const dish = shuffled[i];
      selected.push({
        name: dish.name,
        price: dish.price,
        quantity: Math.floor(Math.random() * 3) + 1
      });
    }
    return selected;
  }

  getStageLabel(stage: TableStage): string {
    if (stage === 'ORDERING') return 'Ordering';
    if (stage === 'EATING') return 'Eating';
    return 'Left';
  }
}
