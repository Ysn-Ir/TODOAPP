import { Component, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip'; // Tooltip for exact date

import { TodoService } from './services/todo.service';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule
  ],
  providers: [DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  todos = signal<Todo[]>([]);
  isLoading = signal(true);
  isDark = signal(window.matchMedia('(prefers-color-scheme: dark)').matches);

  newPriority = signal<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  newDueDate = signal<Date | null>(null);

  constructor(private todoService: TodoService, private datePipe: DatePipe) {
    this.loadTodos();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', e => this.isDark.set(e.matches));
    effect(() => document.documentElement.dataset['theme'] = this.isDark() ? 'dark' : 'light');
  }

  loadTodos() {
    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todos.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  addTodo(title: string) {
    if (!title.trim()) return;
    const formattedDate = this.newDueDate() ? this.datePipe.transform(this.newDueDate(), 'yyyy-MM-dd') : null;

    this.todoService.addTodo({
      title,
      completed: false,
      priority: this.newPriority(),
      dueDate: formattedDate
    }).subscribe(todo => {
      this.todos.update(t => [...t, todo]);
      this.newPriority.set('MEDIUM');
      this.newDueDate.set(null);
    });
  }

  // --- NEW: COUNTDOWN LOGIC ---
  getRelativeTime(dateString?: string | null): string {
    if (!dateString) return '';

    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);

    // Calculate difference in days
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;

    // Return formatted date if far away
    return this.datePipe.transform(dateString, 'dd MMM') || '';
  }

  // Determines color class: 'critical', 'urgent', 'safe'
  getUrgencyClass(dateString?: string | null): string {
    if (!dateString) return '';
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'critical'; // Overdue (Red)
    if (diffDays <= 2) return 'urgent';  // Next 2 days (Orange)
    return 'safe';                       // Future (Blue/Green)
  }

  toggle(todo: Todo) {
    this.todoService.updateTodo({ ...todo, completed: !todo.completed }).subscribe(() => {
      this.todos.update(t => t.map(x => x.id === todo.id ? { ...x, completed: !x.completed } : x));
    });
  }

  delete(id?: number) {
    if (!id) return;
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos.update(t => t.filter(x => x.id !== id));
    });
  }

  toggleTheme() {
    this.isDark.set(!this.isDark());
  }
}
