import { useOfflineStore } from '@/lib/offline/store'

describe('Category 4: Offline Zustand Store Actions', () => {
  beforeEach(() => {
    // Reset state before each test
    useOfflineStore.setState({
      todos: {},
      formDraft: {},
      _hasHydrated: false
    })
  })

  it('Test 1: should add a todo with draft properties and a valid timestamp', () => {
    const store = useOfflineStore.getState()
    store.addTodo('Buy groceries')
    
    const updatedState = useOfflineStore.getState()
    const todoIds = Object.keys(updatedState.todos)
    expect(todoIds.length).toBe(1)
    
    const todo = updatedState.todos[todoIds[0]]
    expect(todo.text).toBe('Buy groceries')
    expect(todo.completed).toBe(false)
    expect(todo.updatedAt).toBeLessThanOrEqual(Date.now())
  })

  it('Test 2: should toggle the completed status of an existing todo', () => {
    const store = useOfflineStore.getState()
    store.addTodo('Toggle Me')
    
    const addedState = useOfflineStore.getState()
    const id = Object.keys(addedState.todos)[0]
    
    // Toggle to true
    addedState.toggleTodo(id)
    let toggledState = useOfflineStore.getState()
    expect(toggledState.todos[id].completed).toBe(true)

    // Toggle back to false
    toggledState.toggleTodo(id)
    toggledState = useOfflineStore.getState()
    expect(toggledState.todos[id].completed).toBe(false)
  })

  it('Test 3: should merge and persist form drafts incrementally', () => {
    const store = useOfflineStore.getState()
    
    // Step 1: Update draft with name
    store.updateFormDraft({ name: 'John Doe' })
    let draftState = useOfflineStore.getState()
    expect(draftState.formDraft.name).toBe('John Doe')

    // Step 2: Update draft with email (name should be preserved)
    draftState.updateFormDraft({ email: 'john@example.com' })
    draftState = useOfflineStore.getState()
    expect(draftState.formDraft.name).toBe('John Doe')
    expect(draftState.formDraft.email).toBe('john@example.com')
  })
})
