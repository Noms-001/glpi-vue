//@ts-nocheck

import { get, post } from "../api/backend-client"
import BaseInventoryAsset from "../models/assets/BaseInventoryAsset"
import ItemTicket from "../models/assistance/ItemTicket"
import Ticket from "../models/assistance/Ticket"
import TicketCost from "../models/assistance/TicketCost"
import TicketUser from "../models/assistance/TicketUser"
import {
    computerService,
    itilFollowupService,
    locationService,
    monitorService,
    phoneService,
    ticketCostService,
    ticketItemService,
    ticketService,
    ticketUserService,
    userService
} from "../services/BaseService"
import { getAllItems, items } from "./ItemManager"

// ============================================================================
// OPTIONS POUR LES FORMULAIRES
// ============================================================================

export const statusOptions = [
    { value: 1, label: 'Nouveau' },
    { value: 2, label: 'Assigné' },
    { value: 3, label: 'Planifié' },
    { value: 4, label: 'En attente' },
    { value: 5, label: 'Résolu' },
    { value: 6, label: 'Clos' },
    { value: 10, label: 'En attente d\'approbation' }
]

export const typeOptions = [
    { value: 1, label: 'Incident' },
    { value: 2, label: 'Demande' }
]

export const severityOptions = [
    { value: 1, label: 'Très faible' },
    { value: 2, label: 'Faible' },
    { value: 3, label: 'Moyen' },
    { value: 4, label: 'Élevé' },
    { value: 5, label: 'Très élevé' },
    { value: 6, label: 'Majeur/Critique' }
]

// ============================================================================
// MAPS D'ÉNUMÉRATION
// ============================================================================

export const ticketStates = new Map([
    [1, { id: 1, name: "Nouveau" }],
    [10, { id: 10, name: "Validation" }],
    [2, { id: 2, name: "En cours (Attribué)" }],
    [3, { id: 3, name: "En cours (Planifié)" }],
    [4, { id: 4, name: "En attente" }],
    [5, { id: 5, name: "Résolu" }],
    [6, { id: 6, name: "Clos" }]
])

export const ticketTypes = new Map([
    [1, { id: 1, name: "Incident" }],
    [2, { id: 2, name: "Demande" }]
])

export const ticketLevels = new Map([
    [1, { id: 1, name: "Très faible" }],
    [2, { id: 2, name: "Faible" }],
    [3, { id: 3, name: "Moyen" }],
    [4, { id: 4, name: "Élevé" }],
    [5, { id: 5, name: "Très élevé" }],
    [6, { id: 6, name: "Majeur" }]
])

export const getTicketStateById = id =>
    ticketStates.get(id) || null

export const getTicketTypeById = id =>
    ticketTypes.get(id) || null

export const getTicketLevelById = id =>
    ticketLevels.get(id) || null

export async function getAllRequesters() {
    return userService.getAll()
}

export async function getAllTicketItems() {
    return getAllItems()
}

export async function getAllTickets() {
    const [
        users,
        locations,
        tickets,
        itemTickets,
        ticketCosts,
        computers,
        monitors,
        phones
    ] = await Promise.all([
        userService.getAll(),
        locationService.getAll(),
        ticketService.getAll(),
        ticketItemService.getAll(),
        ticketCostService.getAll(),
        computerService.getAll(),
        monitorService.getAll(),
        phoneService.getAll()
    ])

    const usersMap = new Map(users.map(u => [u.id, u]))
    const locationsMap = new Map(locations.map(l => [l.id, l]))

    const itemsByTicket = new Map()
    const costsByTicket = new Map()

    const itemsMap = {
        Computer: new Map(computers.map(i => [i.id, i])),
        Monitor: new Map(monitors.map(i => [i.id, i])),
        Phone: new Map(phones.map(i => [i.id, i])),
    }

    for (const link of itemTickets) {
        const asset = itemsMap[link.itemtype]?.get(link.items_id) || null

        const enriched = {
            ...link,
            item: asset
        }

        if (!itemsByTicket.has(link.tickets_id)) {
            itemsByTicket.set(link.tickets_id, [])
        }

        itemsByTicket.get(link.tickets_id).push(enriched)
    }

    for (const cost of ticketCosts) {
        if (!costsByTicket.has(cost.tickets_id)) {
            costsByTicket.set(cost.tickets_id, [])
        }

        costsByTicket.get(cost.tickets_id).push(cost)
    }

    return tickets.map(ticket => ({
        ...ticket,

        typeObject: getTicketTypeById(ticket.type),

        statusObject: getTicketStateById(ticket.status),
        urgencyObject: getTicketLevelById(ticket.urgency),
        impactObject: getTicketLevelById(ticket.impact),
        priorityObject: getTicketLevelById(ticket.priority),

        locationObject: locationsMap.get(ticket.locations_id) || null,

        recipientObject: usersMap.get(ticket.users_id_recipient) || null,
        lastUpdaterObject: usersMap.get(ticket.users_id_lastupdater) || null,

        items: itemsByTicket.get(ticket.id) || [],
        costs: costsByTicket.get(ticket.id) || []
    }))
}

export async function getTicketById(id) {
    const [
        ticket,
        users,
        locations,
        itemTickets,
        ticketCosts,
        computers,
        monitors,
        phones
    ] = await Promise.all([
        ticketService.getById(id),
        userService.getAll(),
        locationService.getAll(),
        ticketItemService.getAll(),
        ticketCostService.getAll(),
        computerService.getAll(),
        monitorService.getAll(),
        phoneService.getAll()
    ])

    if (!ticket) {
        return null
    }

    const usersMap = new Map(users.map(u => [u.id, u]))
    const locationsMap = new Map(locations.map(l => [l.id, l]))

    const itemsByTicket = new Map()
    const costsByTicket = new Map()

    const itemsMap = {
        Computer: new Map(computers.map(i => [i.id, i])),
        Monitor: new Map(monitors.map(i => [i.id, i])),
        Phone: new Map(phones.map(i => [i.id, i])),
    }

    for (const link of itemTickets) {
        const asset = itemsMap[link.itemtype]?.get(link.items_id) || null

        const enriched = {
            ...link,
            item: asset
        }

        if (!itemsByTicket.has(link.tickets_id)) {
            itemsByTicket.set(link.tickets_id, [])
        }

        itemsByTicket.get(link.tickets_id).push(enriched)
    }

    for (const cost of ticketCosts) {
        if (!costsByTicket.has(cost.tickets_id)) {
            costsByTicket.set(cost.tickets_id, [])
        }

        costsByTicket.get(cost.tickets_id).push(cost)
    }

    return {
        ...ticket,

        typeObject: getTicketTypeById(ticket.type),

        statusObject: getTicketStateById(ticket.status),
        urgencyObject: getTicketLevelById(ticket.urgency),
        impactObject: getTicketLevelById(ticket.impact),
        priorityObject: getTicketLevelById(ticket.priority),

        locationObject: locationsMap.get(ticket.locations_id) || null,

        recipientObject: usersMap.get(ticket.users_id_recipient) || null,
        lastUpdaterObject: usersMap.get(ticket.users_id_lastupdater) || null,

        items: itemsByTicket.get(ticket.id) || [],
        costs: costsByTicket.get(ticket.id) || []
    }
}

export async function getTicketFollowups(ticketId) {
    const followups = await itilFollowupService.getAll()
    const allFollowups = Array.isArray(followups) ? followups : [followups]
    return allFollowups.filter(f => f.itemtype === 'Ticket' && Number(f.items_id) === Number(ticketId))
}

// ============================================================================
// FONCTIONS DE CRÉATION GRANULAIRES
// ============================================================================

/**
 * Crée un ticket
 * @param {any} payload
 * @returns {Promise<any>}
 */
export async function createTicket(payload) {
    const created = await ticketService.create(payload)
    const ticket = Array.isArray(created) ? created[0] : created

    if (!ticket?.id) {
        throw new Error('Impossible de récupérer l\'identifiant du ticket créé.')
    }

    return ticket
}

/**
 * Ajoute des items liés à un ticket
 * @param {number} ticketId
 * @param {any[]} selectedItems
 * @returns {Promise<void>}
 */
export async function addTicketItems(ticketId, selectedItems) {
    if (!selectedItems.length) return

    const itemPayload = selectedItems.map(item => {
        let label = item.itemtype
        if (!label) {
            label = 'Phone'
            if (item.typeLabel === 'Ordinateur') label = 'Computer'
            if (item.typeLabel === 'Écran') label = 'Monitor'
        }
        return {
            tickets_id: ticketId,
            itemtype: label,
            items_id: item.id
        }
    })

    await ticketItemService.create(itemPayload)
}

/**
 * Ajoute des coûts à un ticket
 * @param {number} ticketId
 * @param {any[]} costs
 * @returns {Promise<void>}
 */
export async function addTicketCosts(ticketId, costs) {
    const validCosts = costs.filter(cost =>
        cost.name || cost.comment || cost.actiontime || cost.cost_time || cost.cost_fixed || cost.cost_material
    )

    if (!validCosts.length) return

    const costPayload = validCosts.map(cost => ({
        tickets_id: ticketId,
        name: cost.name,
        comment: cost.comment,
        actiontime: cost.actiontime,
        cost_time: cost.cost_time,
        cost_fixed: cost.cost_fixed,
        cost_material: cost.cost_material
    }))

    await ticketCostService.create(costPayload)
}


/**
 * Change le statut d'un ticket GLPI
 */

export async function setStatutTicket(ticketId, statusId, userId = 0, comment = '', closeDate = '') {
    if (!ticketId) return

    /** @type {Ticket} */
    const payload = {
        id: ticketId,
        status: statusId
    }
    if (userId) {
        const ticketUser = {
            users_id: userId || 0,
            tickets_id: ticketId || 0,
            type: 2
        }
        await ticketUserService.create(ticketUser)
    }
    // Résolu
    if (statusId === 5) {
        payload.solvedate = new Date().toISOString().slice(0, 19).replace('T', ' ')
    }

    // Clos
    if (statusId === 6) {
        payload.closedate = closeDate?.trim()
            ? closeDate
            : new Date().toISOString().slice(0, 19).replace('T', ' ')
    }

    await ticketService.update(ticketId, payload)

    const status = statusOptions.find(s => s.value == statusId)

    comment = 'Transiton vers le status ' + status.label + (comment ? ': ' : '.') + comment

    await itilFollowupService.create({
        itemtype: 'Ticket',
        items_id: ticketId,
        content: comment
    })
}

export async function closeTicket(tickets) {
    if (tickets.length === 0) return

    await Promise.all(tickets.map(async t => ticketService.update(t.id, { id: t.id, status: t.status, closedate: t.closedate })))

    const followups = tickets.map(t => ({
        itemtype: 'Ticket',
        items_id: t.id,
        content: 'Transiton vers le status Clos'
    }))

    await itilFollowupService.create(followups)
}

export async function saveCost(ticketId, type, value, mode, ticketItemsFetched = null) {
    try {
        if (!ticketItemsFetched) ticketItemsFetched = await ticketItemService.getAll()

        /** @type {ItemTicket[]} */
        const ticketItems = ticketItemsFetched.filter(t => t.tickets_id == ticketId)

        if (ticketItems.length < 1) {
            return
        }

        if (String(type).toLocaleUpperCase() === 'CLOSE')
            value /= ticketItems.length


        const payload = ticketItems.map(ticketItem => ({
            ticketId: ticketId,
            itemId: ticketItem.items_id,
            itemType: ticketItem.itemtype,
            type,
            value: value,
            mode: Number(mode)
        }))

        const response = await post('/item-cost/new', payload)
        if (!response.success)
            throw new Error("Echec d'enregistrement du superCost")

        return "Cost saved"

    } catch (error) {
        console.error(error)
    }
}

export async function cancelLastSuperCost(ticketId) {
    const response = await post(`/item-cost/cancel?ticketId=${ticketId}`)
    if (response.success) {
        return response.data
    } else {
        throw new Error(response.error)
    }
}

export async function getItemCosts() {
    /** @type {[TicketCost[], ItemTicket[]]} */
    const [ticketCostsFetched, ticketItemsFetched] = await Promise.all([
        ticketCostService.getAll(),
        ticketItemService.getAll()
    ])

    ticketCostsFetched.map(t =>
        t.cost_total = ((Number(t.actiontime || 0)) / 3600) * (Number(t.cost_time || 0)) + Number(t.cost_fixed || 0) + Number(t.cost_material || 0)
    )

    /** @type {Map<String, {cost_total: number, count_total: number}>} */
    const costByTicketMap = new Map()

    for (const t of ticketCostsFetched) {
        const key = t.tickets_id
        if (!costByTicketMap.has(key)) {
            costByTicketMap.set(key, {
                cost_total: 0,
                count_total: 0
            })
        }
        costByTicketMap.get(key).cost_total += t.cost_total
    }

    for (const i of ticketItemsFetched) {
        const key = i.tickets_id
        if (!costByTicketMap.has(key)) {
            costByTicketMap.set(key, {
                cost_total: 0,
                count_total: 0
            })
        }
        costByTicketMap.get(key).count_total++
    }

    ticketItemsFetched.map(i => i.cost_total = costByTicketMap.get(i.tickets_id).cost_total / costByTicketMap.get(i.tickets_id).count_total)

    return ticketItemsFetched
}

export async function getCostByItemType() {

    const ticketItemsFetched = await getItemCosts()

    const itemTypeCostMap = new Map()

    for (const i of ticketItemsFetched) {
        const key = i.itemtype
        if (!itemTypeCostMap.has(key)) {
            itemTypeCostMap.set(key, 0)
        }
        const cost = itemTypeCostMap.get(key)
        itemTypeCostMap.set(key, cost + i.cost_total)
    }
    return itemTypeCostMap;
}

export async function getSumCost() {
    try {
        const response = await get('/item-cost/sum')
        if (response.success) {
            const costs = await getCostByItemType()
            const data = []
            for (const [key, cost] of costs.entries()) {
                const d = response.data[key] || { openCost: 0, type: key, superCost: 0 }
                d.cost = cost
                d.total = cost + d.superCost + d.openCost
                data.push(d)
            }
            return data
        }
        throw new Error(response.error)
    } catch (error) {
        console.error(error)
        throw new Error(error)
    }
}

export async function getDetailsByItemType(itemType) {
    const itemService = items.filter(i => i.item.name === itemType)[0]
    const [itemsFetched, itemsCostsFetched, response] = await Promise.all([
        itemService.service.getAll(),
        getItemCosts(),
        get(`/item-cost?itemType=${itemType}`)
    ])

    const itemsCosts = itemsCostsFetched.filter(i => i.itemtype === itemType)

    const details = []
    if (response.success) {
        const costItemsFetched = response.data

        const sumByItemId = itemsCosts.reduce((acc, item) => {
            acc[item.items_id] = (acc[item.items_id] || 0) + item.cost_total
            return acc
        }, {})

        for (const item of itemsFetched) {
            const costItem = costItemsFetched.find(c => c.itemId == item.id)
            const costTotal = Number(sumByItemId[item.id])
            const superCost = costItem ? Number(costItem.superCost) : 0
            const openCost = costItem ? Number(costItem.openCost) : 0
            const total = costTotal + openCost + superCost

            if (total) {
                details.push({
                    name: item.name,
                    cost: costTotal,
                    superCost: superCost,
                    openCost: openCost,
                    total: total
                })
            }
        }
    }

    return details
}

export async function handleMouvementTicket(ticketId, mouvement, valeur, mode, ticketItems = null) {
    try {
        let statutId = 0
        if (mouvement === "OPEN") {
            await saveCost(ticketId, mouvement, valeur, mode, ticketItems)
            statutId = 2
        } else if (mouvement === "CLOSE") {
            await saveCost(ticketId, mouvement, valeur, null, ticketItems)
            statutId = 6
        } else if (mouvement === "CANCEL") {
            await cancelLastSuperCost(ticketId)
            statutId = 2
        }
        await setStatutTicket(ticketId, statutId)
    } catch (error) {
        console.error(error)
        throw error
    }
}