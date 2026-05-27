import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Note } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly STORAGE_KEY = 'expense-tracker-notes';
  
  private notes = signal<Note[]>([]);
  
  readonly allNotes = this.notes.asReadonly();
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNotes();
      
      effect(() => {
        if (this.initialized) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notes()));
        }
      });
      
      this.initialized = true;
    }
  }

  private loadNotes(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.notes.set(parsed || []);
      } catch {
        this.notes.set([]);
      }
    } else {
      this.notes.set([]);
    }
  }

  addNote(title: string, content: string) {
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.notes.update(list => [note, ...list]);
  }

  updateNote(id: string, title: string, content: string) {
    this.notes.update(list =>
      list.map(n => n.id === id 
        ? { ...n, title, content, updatedAt: new Date().toISOString() }
        : n
      )
    );
  }

  deleteNote(id: string) {
    this.notes.update(list => list.filter(n => n.id !== id));
  }
}