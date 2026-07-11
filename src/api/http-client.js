// src/api/http-client.js
// @ts-nocheck

import router from "../router"

import {
    getOrCreateSession,
    clearSession
} from "./glpi-client"

const GLPI_URL = import.meta.env.VITE_GLPI_URL
const APP_TOKEN = import.meta.env.VITE_GLPI_APP_TOKEN

export async function apiRequest(
    endpoint,
    {
        method = 'GET',
        body = null,
        headers = {},
        json = true
    } = {}
) {

    const { session_token } = await getOrCreateSession()

    const config = {
        method: method.toUpperCase(),
        headers: {
            'Accept-Language': 'en_GB',
            'App-Token': APP_TOKEN,
            'Session-Token': session_token,
            ...headers
        }
    }

    if (body) {
        config.body = json
            ? JSON.stringify(body)
            : body

        if (json) {
            config.headers['Content-Type'] =
                'application/json'
        }
    }

    if (endpoint === '/Document')
        console.log(headers)
    let res = await fetch(
        `${GLPI_URL}${endpoint}`,
        config
    )

    // Session expirée
    if (
        res.status === 401 ||
        res.status === 400
    ) {
        const text = await res.text()

        if (
            text.includes('ERROR_SESSION_TOKEN_INVALID')
        ) {

            clearSession()

            const newSession =
                await getOrCreateSession()

            config.headers['Session-Token'] =
                newSession.session_token

            res = await fetch(
                `${GLPI_URL}${endpoint}`,
                config
            )
        }
    }

    if (!res.ok) {
        const errorText = await res.text()

        throw new Error(
            `API Error ${res.status}: ${errorText}`
        )
    }

    const contentType =
        res.headers.get('content-type')

    if (
        contentType?.includes(
            'application/json'
        )
    ) {
        return res.json()
    }

    return res.text()
}

export const get = (
    endpoint,
    headers = {}
) => apiRequest(endpoint+'?range=0-500', {
    method: 'GET',
    headers
})

export const post = (
    endpoint,
    body = {},
    headers = {}
) => apiRequest(endpoint, {
    method: 'POST',
    body,
    headers
})

export const put = (
    endpoint,
    body = {},
    headers = {}
) => apiRequest(endpoint, {
    method: 'PUT',
    body,
    headers
})

export const del = (
    endpoint,
    body = {},
    headers = {}
) => apiRequest(endpoint, {
    method: 'DELETE',
    body,
    headers
})