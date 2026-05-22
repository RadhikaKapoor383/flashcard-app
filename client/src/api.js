import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// ====== DECKS ======
export const getDecks = () => api.get('/decks').then(r => r.data);
export const getDeck = (id) => api.get(`/decks/${id}`).then(r => r.data);
export const createDeck = (data) => api.post('/decks', data).then(r => r.data);
export const updateDeck = (id, data) => api.put(`/decks/${id}`, data).then(r => r.data);
export const deleteDeck = (id) => api.delete(`/decks/${id}`).then(r => r.data);

// ====== CARDS ======
export const getCards = (deckId) => api.get(`/cards/deck/${deckId}`).then(r => r.data);
export const getDueCards = (deckId) => api.get(`/cards/deck/${deckId}/due`).then(r => r.data);
export const createCard = (data) => api.post('/cards', data).then(r => r.data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data).then(r => r.data);
export const deleteCard = (id) => api.delete(`/cards/${id}`).then(r => r.data);
export const reviewCard = (id, quality) => api.post(`/cards/${id}/review`, { quality }).then(r => r.data);
