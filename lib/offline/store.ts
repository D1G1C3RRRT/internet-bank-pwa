import { create } from 'zustand'
import { syncMiddleware } from './sync-middleware'
const uuidv4 = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  updatedAt: number
}

interface OfflineStore {
  todos: Record<string, Todo>
  formDraft: Record<string, any>
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  updateFormDraft: (data: Record<string, any>) => void
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const useOfflineStore = create<OfflineStore>()(
  syncMiddleware(
    (set: any) => ({
      todos: {},
      formDraft: {},
      _hasHydrated: false as boolean,
      
      addTodo: (text: string) => 
        set((state: OfflineStore) => {
          const id = uuidv4()
          return {
            todos: {
              ...state.todos,
              [id]: { id, text, completed: false, updatedAt: Date.now() }
            }
          }
        }),
        
      toggleTodo: (id: string) =>
        set((state: OfflineStore) => {
          const todo = state.todos[id]
          if (!todo) return state
          
          return {
            todos: {
              ...state.todos,
              [id]: { ...todo, completed: !todo.completed, updatedAt: Date.now() }
            }
          }
        }),
        
      updateFormDraft: (data: Record<string, any>) =>
        set((state: OfflineStore) => ({
          formDraft: { ...state.formDraft, ...data, updatedAt: Date.now() }
        })),
        
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state })
    }),
    'offline_store'
  )
)
