interface Sentence {
  text: string;
  misspelledWord: string;
  correctedWord: string;
}

interface GameSentences {
  [key: string]: Sentence[];
}

export const sentences: GameSentences = {
  en: [
    { text: "The cowboy road his horse into the sunset.", misspelledWord: "road", correctedWord: "rode" },
    { text: "The sheriff was looking for the theif.", misspelledWord: "theif", correctedWord: "thief" },
    { text: "The tumbleweed rolled accross the desert.", misspelledWord: "accross", correctedWord: "across" },
    { text: "The saloon was full of cowbois.", misspelledWord: "cowbois", correctedWord: "cowboys" },
    { text: "The gold was burried in the ground.", misspelledWord: "burried", correctedWord: "buried" },
    { text: "The bandit was hiding in the shaddows.", misspelledWord: "shaddows", correctedWord: "shadows" }
  ],
  es: [
    { text: "El vaquero montó su kavallo hacia el atardecer.", misspelledWord: "kavallo", correctedWord: "caballo" },
    { text: "El sheriff buscabba al ladrón.", misspelledWord: "buscabba", correctedWord: "buscaba" },
    { text: "El arbusto rodó atravez del desierto.", misspelledWord: "atravez", correctedWord: "través" },
    { text: "La cantina estaba llena de baqueros.", misspelledWord: "baqueros", correctedWord: "vaqueros" },
    { text: "El oro estaba enterrado en la tierra.", misspelledWord: "enterado", correctedWord: "enterrado" },
    { text: "El bandido se escondía en las sonbras.", misspelledWord: "sonbras", correctedWord: "sombras" }
  ]
}; 