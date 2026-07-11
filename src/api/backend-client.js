// src/api/backend-client.js
//@ts-nocheck
const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(
    endpoint,
    {
        method = 'GET',
        body = null,
        headers = {},
        json = true
    } = {}
) {

    const config = {
        method: method.toUpperCase(),
        headers
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

    const res = await fetch(
        `${API_URL}${endpoint}`,
        config
    )

    if (!res.ok) {

        const errorText =
            await res.text()

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

/** @return { Promise<{success: boolean, data: any, error: string}> }*/
export const get = (
    endpoint,
    headers = {}
) =>
    apiRequest(endpoint, {
        method: 'GET',
        headers
    })

/** @return { success: boolean, data: any, error: string }*/
export const post = (
    endpoint,
    body = {},
    headers = {}
) =>
    apiRequest(endpoint, {
        method: 'POST',
        body,
        headers
    })

/** @return { success: boolean, data: any, error: string }*/
export const put = (
    endpoint,
    body = {},
    headers = {}
) =>
    apiRequest(endpoint, {
        method: 'PUT',
        body,
        headers
    })

/** @return { success: boolean, data: any, error: string }*/
export const del = (
    endpoint,
    body = {},
    headers = {}
) =>
    apiRequest(endpoint, {
        method: 'DELETE',
        body,
        headers
    })