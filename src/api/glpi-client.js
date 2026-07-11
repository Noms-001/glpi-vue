// src/api/glpi-client.js

const GLPI_URL = import.meta.env.VITE_GLPI_URL
const APP_TOKEN = import.meta.env.VITE_GLPI_APP_TOKEN
const USER_TOKEN = import.meta.env.VITE_GLPI_USER_TOKEN

const STORAGE_KEY = 'glpi_session_token'

export async function initSession() {
    const response = await fetch(`${GLPI_URL}/initSession?profiles_id=4`, {
        method: 'GET',
        headers: {
            'App-Token': APP_TOKEN,
            'Authorization': `user_token ${USER_TOKEN}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            `Erreur GLPI (${response.status})`
        )
    }

    if (!data.session_token) {
        throw new Error('GLPI n\'a pas retourné de session_token')
    }

    localStorage.setItem(STORAGE_KEY, data.session_token)

    return data
}

export function getSessionToken() {
    return localStorage.getItem(STORAGE_KEY)
}

export function clearSession() {
    localStorage.removeItem(STORAGE_KEY)
}

export async function getOrCreateSession() {
    const sessionToken = getSessionToken()

    if (sessionToken) {
        return {
            session_token: sessionToken,
            fromCache: true
        }
    }

    return initSession()
}