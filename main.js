const data = {
  additions: []
};

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('search').addEventListener('click', search);

  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.keyCode === 13) {
      if (e.ctrlKey) {
        addText('OR');
      } else {
        search();
      }
    }
  });

  document.getElementById('searchForm').addEventListener('submit', e => e.preventDefault());

  data.additions = loadAdditions();
  initAdditions(data.additions);
  initSettings();
});

function search() {
  const inputElement = document.getElementById('searchInput');

  const input = inputElement.value.trim();

  if (input !== '') {
    const words = input.replace(/　/g, ' ').split(' ').filter(v => v.trim() !== '');

    const query = [];
    let isQuoted = false;

    for (let i = 0; i < words.length; i++) {
      if (isQuoted) {
        query[query.length - 1] += ' ' + words[i];

        if (words[i].indexOf('"') !== -1) {
          isQuoted = false;
        }
      } else {
        const isMinus = words[i].indexOf('-') === 0;
        const word = isMinus ? words[i].slice(1) : words[i];

        if (word.indexOf('"') === 0) {
          query.push(word);

          if (word.indexOf('"', 1) === -1) {
            isQuoted = true;
          }
        } else if (isOperator(word)) {
          query.push(word);
        } else {
          query.push(`"${word}"`);
        }

        if (isMinus) {
          query[query.length - 1] = '-' + query[query.length - 1];
        }
      }
    }

    window.open(
      `https://twitter.com/search?f=tweets&q=${encodeURIComponent(query.join(' '))} OR @${Date.now().toString()}`
    );
  }

  function isOperator(value) {
    const opts = [
      'OR', ':)', ':(', '?'
    ];

    const optPrefixes = [
      '#', '@', 'from:', 'to:', 'since:', 'until:',
      'filter:', 'lang:', 'source:', 'list:',
      'near:', 'within:', 'geocode:', 'include:', 'exclude:',
      'min_retweets:', 'min_faves:', 'min_replies:', 'card_name:'
    ];

    return opts.some(v => value === v) || optPrefixes.some(v => value.indexOf(v) === 0);
  }
}

function addText(value) {
  const inputElement = document.getElementById('searchInput');

  const text = inputElement.value;
  const pos = inputElement.selectionStart;

  inputElement.value = text.slice(0, pos) + ' ' + value + ' ' + text.slice(pos);
  inputElement.focus();
}

function loadAdditions() {
  const initialized = localStorage.getItem('initialized');

  if (initialized === null) {
    localStorage.setItem('initialized', '1');

    const initAdditions = ['lang:ja', 'filter:images'];
    localStorage.setItem('additions', JSON.stringify(initAdditions));
  }

  const additions = localStorage.getItem('additions');

  return JSON.parse(additions);
}

function saveAdditions(value) {
  localStorage.setItem('additions', JSON.stringify(value));
}

function showSettings() {
  updateInputs(data.additions);
  document.getElementById('additions').style.display = 'none';
  document.getElementById('settings').style.display = 'block';
}

function initAdditions(additions) {
  document.querySelector('#edit > a').addEventListener('click', e => {
    showSettings();
    e.preventDefault();
  });

  updateAdditions(additions);
}

function updateAdditions(additions) {
  const root = document.getElementById('additions');
  const edit = root.querySelector('#edit');
  root.innerHTML = '';
  root.appendChild(edit);

  additions.forEach(value => {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = value;
    a.addEventListener('click', e => {
      addText(value);
      e.preventDefault();
    });
    a.classList.add('button');

    const li = document.createElement('li');
    li.appendChild(a);

    root.insertBefore(li, edit);
  });
}

function createInput(value) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.spellcheck = false;
  input.classList.add('input-text');

  const li = document.createElement('li');
  li.appendChild(input);

  return li;
}

function initSettings() {
  const root = document.getElementById('settings');

  function close() {
    root.style.display = 'none';
    document.getElementById('additions').style.display = 'block';
  }

  document.getElementById('cancel').addEventListener('click', e => {
    close();
    e.preventDefault();
  });

  document.getElementById('save').addEventListener('click', e => {
    const inputs = Array.from(document.querySelectorAll('#settings input[type="text"]'));
    data.additions = inputs.map(v => v.value.trim()).filter(v => v !== '');

    saveAdditions(data.additions);
    updateAdditions(data.additions);

    close();
    e.preventDefault();
  });

  document.getElementById('add').addEventListener('click', e => {
    document.querySelector('#settings > ul').insertBefore(createInput(''), add);
    e.preventDefault();
  });
}

function updateInputs(additions) {
  const root = document.querySelector('#settings > ul');
  const add = document.getElementById('add');
  root.innerHTML = '';
  root.appendChild(add);

  additions.forEach(value => {
    root.insertBefore(createInput(value), add);
  });
}