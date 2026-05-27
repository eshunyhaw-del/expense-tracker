import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/expense';

@Component({
  selector: 'app-notebook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notebook">
      <div class="header">
        <h2>📓 Personal Notebook</h2>
        <button class="add-btn" (click)="showNewNote.set(true)">+ New Note</button>
      </div>

      @if (showNewNote()) {
        <div class="note-editor">
          <input 
            [(ngModel)]="newTitle" 
            placeholder="Note title..." 
            class="title-input"
          />
          <textarea 
            [(ngModel)]="newContent" 
            placeholder="Write your note here..." 
            rows="4"
            class="content-input"
          ></textarea>
          <div class="editor-buttons">
            <button class="save-btn" (click)="saveNote()">Save Note</button>
            <button class="cancel-btn" (click)="cancelNote()">Cancel</button>
          </div>
        </div>
      }

      @if (editingNote()) {
        <div class="note-editor">
          <input 
            [(ngModel)]="editTitle" 
            placeholder="Note title..." 
            class="title-input"
          />
          <textarea 
            [(ngModel)]="editContent" 
            placeholder="Write your note here..." 
            rows="4"
            class="content-input"
          ></textarea>
          <div class="editor-buttons">
            <button class="save-btn" (click)="updateNote()">Update Note</button>
            <button class="cancel-btn" (click)="cancelEdit()">Cancel</button>
          </div>
        </div>
      }

      <div class="notes-list">
        @for (note of notes(); track note.id) {
          <div class="note-card">
            <div class="note-header">
              <h3>{{ note.title }}</h3>
              <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            </div>
            <p class="note-content">{{ note.content }}</p>
            <div class="note-actions">
              <button class="edit-btn" (click)="startEdit(note)">✏️ Edit</button>
              <button class="delete-btn" (click)="deleteNote(note.id)">🗑️ Delete</button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>📝 No notes yet. Start writing!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notebook {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .add-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .note-editor {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .title-input, .content-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 10px;
      font-size: 14px;
      box-sizing: border-box;
    }
    
    .content-input {
      resize: vertical;
      min-height: 100px;
    }
    
    .editor-buttons {
      display: flex;
      gap: 10px;
    }
    
    .save-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
    }
    
    .cancel-btn {
      background: #f5f5f5;
      color: #333;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
    }
    
    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .note-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
    }
    
    .note-header h3 {
      margin: 0;
      color: #333;
    }
    
    .note-date {
      font-size: 12px;
      color: #999;
    }
    
    .note-content {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.5;
    }
    
    .note-actions {
      display: flex;
      gap: 10px;
    }
    
    .edit-btn, .delete-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .edit-btn {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .delete-btn {
      background: #ffebee;
      color: #d32f2f;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  `]
})
export class NotebookComponent {
  private notesService = inject(NotesService);
  
  notes = this.notesService.allNotes;
  
  showNewNote = signal(false);
  newTitle = '';
  newContent = '';
  
  editingNote = signal<Note | null>(null);
  editTitle = '';
  editContent = '';

  saveNote() {
    if (this.newTitle && this.newContent) {
      this.notesService.addNote(this.newTitle, this.newContent);
      this.cancelNote();
    }
  }

  cancelNote() {
    this.showNewNote.set(false);
    this.newTitle = '';
    this.newContent = '';
  }

  startEdit(note: Note) {
    this.editingNote.set(note);
    this.editTitle = note.title;
    this.editContent = note.content;
  }

  updateNote() {
    const note = this.editingNote();
    if (note && this.editTitle && this.editContent) {
      this.notesService.updateNote(note.id, this.editTitle, this.editContent);
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingNote.set(null);
    this.editTitle = '';
    this.editContent = '';
  }

  deleteNote(id: string) {
    if (confirm('Delete this note?')) {
      this.notesService.deleteNote(id);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}