import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngFor
import { FormsModule } from '@angular/forms';   // Required for [(ngModel)]
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss',
})
export class TodoList implements OnInit {

  todos: Todo[] = [];
  newTitle = '';
  newPriority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'; // Default value

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe(data => this.todos = data);
  }

  addTodo() {
    if (this.newTitle.trim()) {
      // Create the object with the required priority
      const todoToAdd: Todo = {
        title: this.newTitle,
        completed: false,
        priority: this.newPriority
      };

      this.todoService.addTodo(todoToAdd).subscribe(todo => {
        this.todos.push(todo);
        this.newTitle = '';
        this.newPriority = 'MEDIUM'; // Reset to default
      });
    }
  }

  toggle(todo: Todo) {
    todo.completed = !todo.completed;
    this.todoService.updateTodo(todo).subscribe();
  }

  delete(todo: Todo) {
    if (todo.id) {
      this.todoService.deleteTodo(todo.id).subscribe(() => {
        this.todos = this.todos.filter(t => t.id !== todo.id);
      });
    }
  }
}
