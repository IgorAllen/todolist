const tbody = document.querySelector('tbody');
const addForm = document.querySelector('.add-form');
const inputTask = document.querySelector('.input-task');

const API_URL = 'http://localhost:3333/tasks';

const fetchTasks = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  } catch (error) {
    console.error(error.message);
    alert('Error loading tasks. Please try again.');
    return [];
  }
};

const addTask = async (event) => {
  event.preventDefault();

  const title = inputTask.value.trim();
  if (!title) {
    alert('Task title cannot be empty.');
    return;
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    inputTask.value = '';
    loadTasks();
  } catch (error) {
    console.error(error.message);
    alert('Error adding task. Please try again.');
  }
};

const deleteTask = async (id) => {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (error) {
    console.error(error.message);
    alert('Error deleting task. Please try again.');
  }
};

const updateTask = async (task) => {
  try {
    await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    loadTasks();
  } catch (error) {
    console.error(error.message);
    alert('Error updating task. Please try again.');
  }
};

const formatDate = (dateUTC) => {
  return new Date(dateUTC).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
};

const createElement = (tag, options = {}) => {
  const { innerText = '', innerHTML = '', className = '' } = options;
  const element = document.createElement(tag);

  if (innerText) element.innerText = innerText;
  if (innerHTML) element.innerHTML = innerHTML;
  if (className) element.className = className;

  return element;
};

const createStatusSelect = (currentValue) => {
  const select = createElement('select', {
    innerHTML: `
      <option value="pending">Pending</option>
      <option value="in progress">In Progress</option>
      <option value="completed">Completed</option>
    `,
  });
  select.value = currentValue;
  return select;
};

const createRow = (task) => {
  const { id, title, created_at, status } = task;

  const tr = createElement('tr');
  const tdTitle = createElement('td', { innerText: title });
  const tdCreatedAt = createElement('td', { innerText: formatDate(created_at) });
  const tdStatus = createElement('td');
  const tdActions = createElement('td');


  const select = createStatusSelect(status);
  select.addEventListener('change', ({ target }) =>
    updateTask({ ...task, status: target.value })
  );

  const editButton = createElement('button', {
    innerHTML: '<span class="material-symbols-outlined">edit</span>',
    className: 'btn-action',
  });

  const deleteButton = createElement('button', {
    innerHTML: '<span class="material-symbols-outlined">delete</span>',
    className: 'btn-action',
  });

  const editForm = createElement('form');
  const editInput = createElement('input', { className: 'edit-input' });
  editInput.value = title;

  editForm.appendChild(editInput);

  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateTask({ id, title: editInput.value.trim(), status });
  });

  editButton.addEventListener('click', () => {
    tdTitle.innerHTML = '';
    tdTitle.appendChild(editForm);
  });

  deleteButton.addEventListener('click', () => deleteTask(id));


  tdStatus.appendChild(select);
  tdActions.append(editButton, deleteButton);

  tr.append(tdTitle, tdCreatedAt, tdStatus, tdActions);

  return tr;
};


const loadTasks = async () => {
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  const tasks = await fetchTasks();

  tbody.innerHTML = ''; // Clear before adding

  tasks.forEach((task) => {
    const tr = createRow(task);
    tbody.appendChild(tr);
  });
};


addForm.addEventListener('submit', addTask);
loadTasks();
