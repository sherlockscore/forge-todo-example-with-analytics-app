import React, { useEffect, useState, Fragment } from 'react';
import { invoke } from '@forge/bridge';

// Atlaskit
import LoadingButton from '@atlaskit/button/loading-button';   
import { Checkbox } from '@atlaskit/checkbox';
import EditorCloseIcon from '@atlaskit/icon/glyph/editor/close';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import Textfield from '@atlaskit/textfield';
import Lozenge from '@atlaskit/lozenge';
import Spinner from '@atlaskit/spinner';
import Button from '@atlaskit/button';

// Custom Styles
import {
  Card, Row, Icon, IconContainer, Status, SummaryActions, SummaryCount, SummaryFooter,
  ScrollContainer, Form, LoadingContainer
} from './Styles';
import {
  group,
  identify,
  trackDeleteAll,
  trackTodoItemChecked,
  trackTodoItemCreated,
  trackTodoItemDeleted,
  trackTodoItemUnchecked
} from "./analytics/events";

function App() {
  const [todos, setTodos] = useState(null);
  const [input, setInput] = useState('');
  const [isFetched, setIsFetched] = useState(false);
  const [isDeleteAllShowing, setDeleteAllShowing] = useState(false);
  const [isDeletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    // Trigger identify and group analytics on load
    identify();
    group();
  }, []);

  if (!isFetched) {
    setIsFetched(true);
    invoke('get-all').then(setTodos);
  }

  const createTodo = async (label) => {
    trackTodoItemCreated();

    const newTodoList = [...todos, { label, isChecked: false, isSaving: true }];

    setTodos(newTodoList);
  }

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === id) {
          if (todo.isChecked) {
            trackTodoItemUnchecked();
          } else {
            trackTodoItemChecked();
          }

          return { ...todo, isChecked: !todo.isChecked, isSaving: true };
        }
        return todo;
      })
    )
  }

  const deleteTodo = (id) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === id) {
          trackTodoItemDeleted();

          return { ...todo, isDeleting: true };
        }
        return todo;
      })
    )
  }

  const deleteAllTodos = async () => {
    trackDeleteAll();

    setDeletingAll(true);

    await invoke('delete-all');

    setTodos([]);
    setDeleteAllShowing(false);
    setDeletingAll(false);
  }

  const onSubmit = (e) => {
    e.preventDefault();
    createTodo(input);
    setInput('');
  };

  useEffect(() => {
    if (!todos) return;
    if (!todos.find(todo => todo.isSaving || todo.isDeleting)) return;

    Promise.all(
      todos.map((todo) => {
        if (todo.isSaving && !todo.id) {
          return invoke('create', { label: todo.label, isChecked: false })
        }
        if (todo.isSaving && todo.id) {
          return invoke('update', { id: todo.id, label: todo.label, isChecked: todo.isChecked })
        }
        if (todo.isDeleting && todo.id) {
          return invoke('delete', { id: todo.id }).then(() => false);
        }
        return todo;
      })
    )
    .then(saved => saved.filter(a => a))
    .then(setTodos)
  }, [todos]);

  if (!todos) {
    return (
      <Card>
        <LoadingContainer>
          <Spinner size="large" />
        </LoadingContainer>
      </Card>
    );
  }

  const completedCount = todos.filter(todo => todo.isChecked).length;
  const totalCount = todos.length;

  const Rows = () => (
    <Fragment>
      {todos.map(({ id, label, isChecked, isSaving, isDeleting }, i) => {
        const isSpinnerShowing = isSaving || isDeleting;

        return (
          <Row isChecked={isChecked} key={label}>
            <Checkbox isChecked={isChecked} label={label} name={label} onChange={() => toggleTodo(id)} />
            <Status>
              {isSpinnerShowing ? <Spinner size="medium" /> : null}
              {isChecked ? <Lozenge appearance="success">Done</Lozenge> : null}
              <Button size="small" spacing="none" onClick={() => deleteTodo(id)}>
                <IconContainer>
                  <Icon>
                    <EditorCloseIcon />
                  </Icon>
                </IconContainer>
              </Button>
            </Status>
          </Row>
        );
      })}
    </Fragment>
  );

  const DeleteAll = () => isDeleteAllShowing ? (
    <LoadingButton
      appearance="danger"
      spacing="compact"
      isLoading={isDeletingAll}
      isDisabled={isDeletingAll}
      onClick={deleteAllTodos}
    >
      Delete All
    </LoadingButton>
  ) : (
    <LoadingButton appearance="subtle" spacing="none" onClick={() => setDeleteAllShowing(true)}>
      <IconContainer>
        <Icon>
          <TrashIcon />
        </Icon>
      </IconContainer>
    </LoadingButton>
  );

  const CompletedLozenge = () => <Lozenge>{completedCount}/{totalCount} Completed</Lozenge>;

  return (
    <Card>
      <ScrollContainer>
        <Rows />
        <Row isCompact>
          <Form onSubmit={onSubmit}>
            <Textfield
              appearance="subtle"
              placeholder="Add a todo +"
              value={input}
              onChange={({ target }) => setInput(target.value)}
            />
          </Form>
        </Row>
      </ScrollContainer>
      <SummaryFooter>
        <SummaryCount>
          <CompletedLozenge />
        </SummaryCount>
        <SummaryActions>
          <DeleteAll />
        </SummaryActions>
      </SummaryFooter>
    </Card>
  );
}

export default App;
