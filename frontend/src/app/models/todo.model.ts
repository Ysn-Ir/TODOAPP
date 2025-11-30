export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string | null; // Add this
}
