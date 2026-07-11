// src/api/auth.js
// @ts-nocheck
import {
    getOrCreateSession,
    getSessionToken,
    clearSession
} from './glpi-client'

export async function login() {
    return await getOrCreateSession()
}

export function logout(router) {
    clearSession()

    if (router) {
        router.push('/backoffice/login')
    }
}

export function getToken() {
    return getSessionToken()
}

export function isAuthenticated() {
    return !!getSessionToken()
}

export async function getValidToken(router) {
    try {
        const session = await getOrCreateSession()
        return session.session_token
    } catch (error) {
        logout(router)
        return null
    }
}