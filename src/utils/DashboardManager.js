//@ts-nocheck
import Ticket from "../models/assistance/Ticket";
import { ticketService } from "../services/BaseService";
import { items } from "./ItemManager";
import { ticketTypes } from "./TicketManager";

export async function getItemsStats() {
    const byType = await Promise.all(
        items.map(async ({ item, service }) => {
            const data = await service.getAll();

            console.log(item, item.name)

            return {
                name: item.name,
                count: data.length
            };
        })
    );

    return {
        total: byType.reduce((sum, item) => sum + item.count, 0),
        items: byType
    };
}

export async function getTicketStats() {
    /** @type {Ticket[]} */
    const tickets = await ticketService.getAll()

    /** @type {Record<number, number>} */
    const counts = {}

    for (const ticket of tickets) {
        const type = ticket.type

        counts[type] = (counts[type] || 0) + 1
    }

    return {
        total: tickets.length,
        items: [...ticketTypes.values()].map(t => ({
            name: t.name,
            count: counts[t.id] || 0
        }))
    }
}