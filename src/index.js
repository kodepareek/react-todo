import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import './index.css';
import expect from 'expect';
import deepFreeze from 'deepfreeze';
import { createStore, combineReducers } from 'redux';

const todo = (state, action ) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ];
    case 'TOGGLE_TODO':
      return state.map(todo => {
          if (todo.id !== action.id) {
            return todo;
          } else {
              return {
                ...todo,
                completed: !todo.completed
            };
          }
        })
    default:
      return state
  }
}

const todos = (state=[], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return todo(state, action)
    case 'TOGGLE_TODO':
      return todo(state, action)
    default:
      return state;
  }
}

const visibilityFilter = (
  state='SHOW_ALL',
  action
  ) => {
    switch(action.type) {
      case 'SET_VISIBILITY_FILTER':
        return action.filter;
      default:
        return state;
    }
}

const todoApp = combineReducers({ //helper function which is a stand in for the todoApp function commented out below
  todos,
  visibilityFilter
})

// const todoApp = (state = {}, action) => {
//   return {
//     todos: todos(
//       state.todos,
//       action
//     ),
//     visibilityFilter: visibilityFilter(
//       state.visibilityFilter,
//       action
//     )
//   }
// }

const testToggleTodo = () => {
  const stateBefore = [
    {
      id: 0,
      text: 'learn',
      completed: false
    },
    {
      id: 1,
      text: 'eating',
      completed: false
    }
  ]
  const action = {
    type: 'TOGGLE_TODO',
    id: 1
  }
  const stateAfter = [
    {
      id: 0,
      text: 'learn',
      completed: false
    },
    {
      id: 1,
      text: 'eating',
      completed: true
    }
  ]
  deepFreeze(stateBefore)
  deepFreeze(action)

  expect(todos(stateBefore, action)).toEqual(stateAfter)
}

testToggleTodo()

const store = createStore(todoApp)
let nextTodoId = 0;

const Todos = ({
  todos,
  handleTodoToggle
}) => (
  <ul>
    {todos.map(todo => {
      return (
        <li key={todo.id}
          onClick={() => handleTodoToggle(todo.id)} // the prop has to be called by a function because we want to execute it
          style={{
            textDecoration: todo.completed ? 'line-through': 'none'
          }}
          >
          {todo.text}
        </li>
        )
      }
    )}
  </ul>
)

const getVisibleTodos = (
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      );
    default:
      return todos
  }
}

const AddTodo = (
  {
    onAddClick
  }
) => {
  let input;
  return (
    <div>
      <input ref={
        node => {
          input = node
        }
      }/>
      <button onClick={() => {
        onAddClick(input.value)
        input.value = ''
      }}>
      Add TODO
      </button>
    </div>
  )
}

const Link = ({
  active,
  display,
  onClick
}) => {
  if (active) {
    return <span> {display} </span>
  }
  return (
    <a href="#"
      onClick={e => {
            e.preventDefault();
            onClick();
          }
        }
      >
      { display }
    </a>
  )
}

class FilterLink extends Component  {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.forceUpdate()) //store.subscribe returns unsibscribe fnxn
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {
    const props = this.props;
    const state = store.getState()
    return (
      <Link
        active={
          props.filter === state.visibilityFilter
        }
        display={props.display}
        onClick={() => {
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
            })
          }
        }
      />
    )
  }
}

const Footer = ({
  visibilityFilter,
  onFilterClick
}) => (
  <p>
    Show:
    {' '}
    <FilterLink
      display='All'
      filter='SHOW_ALL'
    />
    {' '}
    <FilterLink
      display='Completed'
      filter="SHOW_COMPLETED"
    />
    {' '}
    <FilterLink
      display='Active'
      filter='SHOW_ACTIVE'
    />
  </p>
)

const TodoApp = (
  {
    todos,
    visibilityFilter
  }
) => (
  <div>
    <AddTodo
      onAddClick={text =>
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text
        })
      }
    />
    <Todos
      todos={
        getVisibleTodos(
            todos,
            visibilityFilter
        )
      }
      handleTodoToggle={id => {
          store.dispatch({
            type: 'TOGGLE_TODO',
            id
          })
        }
      }
    />
  <Footer />
  </div>
)

const render = () => {
  ReactDOM.render(
    <TodoApp
      {...store.getState()}
    />,
    document.getElementById('root')
  )
}

store.subscribe(render)
render() //to initialize the app
