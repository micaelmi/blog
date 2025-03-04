export function generateUsername() {
  const adjectives = [
    "Quick",
    "Happy",
    "Bright",
    "Cool",
    "Lazy",
    "Smart",
    "Bold",
    "Brave",
    "Swift",
    "Silent",
    "Clever",
    "Loyal",
    "Fierce",
    "Witty",
    "Sharp",
    "Energetic",
    "Mighty",
    "Vivid",
    "Charming",
    "Dynamic",
    "Epic",
    "Gentle",
  ];

  const nouns = [
    "Tiger",
    "Panda",
    "Eagle",
    "Fox",
    "Lion",
    "Bear",
    "Shark",
    "Wolf",
    "Falcon",
    "Dragon",
    "Hawk",
    "Cheetah",
    "Leopard",
    "Owl",
    "Panther",
    "Phoenix",
    "Raven",
    "Viper",
    "Cobra",
    "Otter",
    "Lynx",
    "Giraffe",
    "Penguin",
    "Zebra",
    "Badger",
  ];

  // Símbolos opcionais entre palavras
  const symbols = ["", "_", "-", ".", ""];

  // Função para obter um elemento aleatório de um array
  const getRandomElement = (array: string[]) =>
    array[Math.floor(Math.random() * array.length)];

  // Gerar partes do nome
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  const symbol = getRandomElement(symbols);
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Números de 1000 a 9999

  return `${adjective}${symbol}${noun}${randomNumber}`;
}
