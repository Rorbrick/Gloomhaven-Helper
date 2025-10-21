export const API_URL = 'http://127.0.0.1:5000/api';

async function request(url, options) {
    const response = await fetch(`${API_URL}${url}`,{
        headers: {'Content-Type': 'application/json'},
        ...options,
    });
    if (!response.ok){
        const err = await response.text().catch(() => response.statusText)
        throw new Error(err || `HTTP ${response.status}`)
    }
    return response.status === 204 ? null : response.json();
}

export const api = {
    //Characters
    listCharacters: () => request(`/characters`),
    getCharacter: (id) => request(`/characters/${id}`),
    createCharacter: (data) => request('/characters', { method: 'POST', body: JSON.stringify(data) }),
    updateCharacter: (id,data) => request(`/characters/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteCharacter: (id) => request(`/characters/${id}`, { method: 'DELETE' }),
    listCharacterNotes: (id) => request(`/characters/${id}/notes`),
    createCharacterNote: (id,data) => request(`/characters/${id}/notes`, { method: 'POST', body: JSON.stringify(data)} ),
    deleteCharacterNote: (id,note_id) => request(`/characters/${id}/notes/${note_id}`, { method: 'DELETE' }),

    //Parties
    listParties: () => request(`/parties`),
    getParty: (id) => request(`/parties/${id}`),
    createParty: (data) => request(`/parties`, { method: 'POST', body: JSON.stringify(data) }),
    updateParty: (id,data) => request(`/parties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteParty: (id) => request(`/parties/${id}`, { method: 'DELETE' }),
    createPartyNote: (id,data) => request(`/parties/${id}/notes`, { method: 'POST', body: JSON.stringify(data) }),
    deletePartyNote: (id,note_id) => request(`/parties/${id}/notes/${note_id}`, { method: 'DELETE' }),

    //Retired Characters
    listRetiredCharacters: () => request(`/retiredcharacters`),

    //Classes
    listClasses: () => request(`/classes`),
    getClass: (id) => request(`/classes/${id}`)
};