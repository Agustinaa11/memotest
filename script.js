const board = document.getElementById('board');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const turnDisplay = document.getElementById('turn');

let turn = 1;
let scores = [0, 0];
let firstCard = null;
let secondCard = null;
let lockBoard = false;

async function getRandomPokemon(count) {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * 151) + 1);
  }

  const pokemons = await Promise.all(
    [...ids].map(id =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(data => ({
          name: data.name,
          image: data.sprites.front_default
        }))
    )
  );

  return pokemons;
}

function createCard(pokemon, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.name = pokemon.name;
  card.dataset.index = index;

  const img = document.createElement('img');
  img.src = pokemon.image;
  img.alt = pokemon.name;

  card.appendChild(img);

  card.addEventListener('click', () => {
    if (lockBoard || card.classList.contains('flipped') || card === firstCard) return;

    card.classList.add('flipped');

    if (!firstCard) {
      firstCard = card;
    } else {
      secondCard = card;
      checkMatch();
    }
  });

  return card;
}

function checkMatch() {
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    scores[turn - 1]++;
    updateScores();

    const playerClass = `player${turn}`;
    firstCard.classList.add(playerClass);
    secondCard.classList.add(playerClass);

    resetCards(true);
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      switchTurn();
      resetCards(false);
    }, 1000);
  }
}

function resetCards(keepFlipped) {
  if (!keepFlipped) {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
  }
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function updateScores() {
  score1.textContent = scores[0];
  score2.textContent = scores[1];
}

function switchTurn() {
  turn = turn === 1 ? 2 : 1;
  turnDisplay.textContent = turn;
}

async function initGame() {
  board.innerHTML = '';
  const pokemons = await getRandomPokemon(10);
  const cards = [...pokemons, ...pokemons]
    .map((p, i) => ({ ...p, id: i }))
    .sort(() => Math.random() - 0.5);

  cards.forEach((pokemon, index) => {
    const card = createCard(pokemon, index);
    board.appendChild(card);
  });
}

function resetGame() {
  board.innerHTML = '';
  scores = [0, 0];
  turn = 1;
  updateScores();
  turnDisplay.textContent = turn;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  initGame();
}

document.getElementById('resetBtn').addEventListener('click', resetGame);

initGame();
