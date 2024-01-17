document.addEventListener('DOMContentLoaded', function () {
  const user = document.querySelector('#user');
  const form = document.querySelector('.form');

  const textareas = document.querySelectorAll('.textarea');

  const initButtons = document.querySelectorAll('.init_button');
  const endButtons = document.querySelectorAll('.end_button');

  let keyData = {};
  let isKeyCurrentlyPressed = false;

  const createJsonFile = (jsonContent, userId) => {
    const blob = new Blob([jsonContent], { type: 'application/json' });

    const link = document.createElement('a');
    link.download = `result_${userId}.json`;
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const blockCopy = (event) => {
    if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault();
      alert('Copiar não permitido!');
    }

    if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
      event.preventDefault();
      alert('Colar não permitido!');
    }
  };

  const handleKeyDown = (event) => {
    blockCopy(event);
    const { name } = event.target;
    
    const sequence = Object.keys(keyData[name].keys).length;
    
    if (!isKeyCurrentlyPressed) {
      keyData[name].pressed.push(event.key);
      keyData[name].keys[sequence] = { press: performance.now() };
    }

    isKeyCurrentlyPressed = true;
  };

  const handleKeyUp = (event) => {
    const { name } = event.target;

    const sequence = Object.keys(keyData[name].keys).length - 1;

    keyData[name].keys[sequence].release = performance.now();
    isKeyCurrentlyPressed = false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const userId = user.value.split(' ').join('_');

    const disabledTextareas = Array.from(textareas).every(
      (textarea) => textarea.disabled,
    );
    const emptyTextareas = Array.from(textareas).some(
      (textarea) => textarea.value === '',
    );

    if (!disabledTextareas || emptyTextareas)
      return alert('Todos os campos devem ser preenchidos e finalizados.');

    const result = {
      user_id: userId,
      key_data: keyData,
    };

    createJsonFile(JSON.stringify(result), userId);
  };

  const handleInitButton = (event) => {
    const { name, value } = event.target;

    const disabledTextareas = Array.from(textareas).every(
      (textarea) => textarea.disabled,
    );

    if (!disabledTextareas)
      return alert('Finalize o último campo preenchido para iniciar o próximo');

    event.target.disabled = true;
    event.target.nextElementSibling.disabled = false;

    const textarea = document.querySelector(`#${name}-${value}`);
    textarea.disabled = false;

    keyData = {
      ...keyData,
      [`${name}-${value}`]: {
        init: performance.now(),
        keys: {},
        pressed: [],
      },
    };
  };

  const handleEndButton = ({ target }) => {
    const { name, value } = target;

    const textarea = document.querySelector(`#${name}-${value}`);
    if (textarea.value === '')
      return alert(
        'Preencha a frase correta antes de finalizar o campo selecionado',
      );
    target.disabled = true;
    textarea.disabled = true;

    keyData[`${name}-${value}`].end = performance.now();
    keyData[`${name}-${value}`].content = textarea.value;
  };

  form.addEventListener('submit', handleSubmit);

  initButtons.forEach((button) => {
    button.addEventListener('click', handleInitButton);
  });

  endButtons.forEach((button) => {
    button.addEventListener('click', handleEndButton);
  });

  textareas.forEach((textarea) => {
    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('keyup', handleKeyUp);
  });
});
