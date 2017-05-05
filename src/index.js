import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import './index.css';
import expect from 'expect';
import deepFreeze from 'deepfreeze';
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';

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

const getVisibleTodos = ( //function to decide which todos to show based on currently selected filter - not a reducer
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter( // filtering the todos passed as args
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

let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

let AddTodo = ({ dispatch }) => { // functional components get store as second argument when store is in context
  let input;
  return (
    <div>
      <input ref={
        node => {
          input = node
        }
      }/>
      <button onClick={() => {
        console.log('beam', addTodo(input.value))
        dispatch(addTodo(input.value))
        input.value = '' // clear the text box
      }}>
      Add TODO
      </button>
    </div>
  )
}
AddTodo = connect(
  null, // this comp does not need to subscribe to the store. It does not NEEd anything from store. It only adds elements to it.
  null  // dispatch is passed by default. No need to explicitly pass default
)(AddTodo)

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


const mapStateToLinkProps = (
  state,
  ownProps //the props passed from the parent component
) => {
  return {
    active: ownProps.filter === state.visibilityFilter,
    display: ownProps.display
  }
}
const mapDispatchToLinkProps = (
  dispatch,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      })
    }
  }
}
const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link)

// class FilterLink extends Component  {
//   componentDidMount() {
//     const { store } = this.context;
//     this.unsubscribe = store.subscribe(() => this.forceUpdate()) //store.subscribe returns unsibscribe fnxn
//   }
//   componentWillUnmount() {
//     this.unsubscribe()
//   }
//   render() {
//     const props = this.props;
//     const { store } = this.context;
//     const state = store.getState()
//     return (
//       <Link
//
//         display={props.display}
//         onClick={() => {
//           store.
//           }
//         }
//       />
//     )
//   }
// }
// FilterLink.contextTypes = {
//   store: React.PropTypes.object
// }


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

const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo => {
      return (
        <li key={todo.id}
          onClick={() => onTodoClick(todo.id)} // the prop has to be called by a function because we want to execute it
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

const mapVisibleTodoListStateToProps = (
  state
) => {
  return {
      todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  }
}
const mapVisibleTodoListDispatchToProps = (
  dispatch
) => {
  return {
    onTodoClick: (id) => {
      dispatch({
        type: 'TOGGLE_TODO',
        id
      })
    }
  }
}
const VisibleTodoList = connect( //the VisibleTodoList comp is created by connect is a representation of the below commented out function
  mapVisibleTodoListStateToProps,
  mapVisibleTodoListDispatchToProps
)(TodoList)                      //connect is a curried function which can be called many times. call with presentational comp here

// class VisibleTodoList extends Component {
//   componentDidMount() {
//     const {store} = this.context;
//     this.unsubscribe = store.subscribe(() => {
//       this.forceUpdate()
//     })
//   }
//   componentWillUnmount() {
//     this.unsubscribe()
//   }
//   render() {
//     const props = this.props;
//     const { store } = this.context;
//     const state = store.getState();
//
//     return (
//       <TodoList
//         todos={
//         }
//         onTodoClick={
//         }
//       />
//     )
//   }
// }
// VisibleTodoList.contextTypes = {
//   store: React.PropTypes.object
// }

const TodoApp = () => (
  <div>
  <AddTodo />
  <VisibleTodoList />
  <Footer />
  </div>
)

let store = createStore(todoApp)

ReactDOM.render(
  <Provider store={store}>
    <TodoApp/>
  </Provider>,
  document.getElementById('root')
)














//A sample test for the app
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
