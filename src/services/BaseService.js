// @ts-nocheck

import {
    get,
    post,
    put,
    del
} from '../api/http-client'
import User from '../models/administration/User'
import Appliance from '../models/assets/Appliance'
import Certificate from '../models/assets/Certificate'
import Computer from '../models/assets/Computer'
import Monitor from '../models/assets/Monitor'
import NetworkEquipment from '../models/assets/NetworkEquipment'
import Peripheral from '../models/assets/Peripheral'
import Phone from '../models/assets/Phone'
import Printer from '../models/assets/Printer'
import SoftwareLicense from '../models/assets/SoftwareLicense'
import Unmanaged from '../models/assets/Unmanaged'
import Ticket from '../models/assistance/Ticket'
import State from '../models/dropdowns/State'
import Location from '../models/dropdowns/Location'
import Manufacturer from '../models/dropdowns/Manufacturer'

import ComputerModel from '../models/dropdowns/ComputerModel'
import MonitorModel from '../models/dropdowns/MonitorModel'
import NetworkEquipmentModel from '../models/dropdowns/NetworkEquipmentModel'
import PeripheralModel from '../models/dropdowns/PeripheralModel'
import PhoneModel from '../models/dropdowns/PhoneModel'
import PrinterModel from '../models/dropdowns/PrinterModel'
import ItemTicket from '../models/assistance/ItemTicket'
import TicketCost from '../models/assistance/TicketCost'
import Document from '../models/dropdowns/Document'
import DocumentItem from '../models/dropdowns/DocumentItem'
import ITILFollowup from '../models/assistance/ITILFollowup'
import TicketUser from '../models/assistance/TicketUser'
import ProfileUser from '../models/administration/ProfileUser'

/**
 * @template T
 */
export default class BaseService {

    /**
     * @param {typeof import('../models/BaseModel').default & {
     *   resource: string,
     *   fromArray(data: any[]): T[]
     * }} Model
     */
    constructor(Model) {
        this.Model = Model
        this.resource = Model.resource
    }

    /**
     * @param {Object} [params={}]
     * @returns {Promise<T[]>}
     */
    async getAll(params = {}) {

        const query = Object.keys(params).length
            ? `?${new URLSearchParams(params).toString()}`
            : ''

        const data = await get(`${this.resource}${query}`)

        return this.Model.fromArray(data)
    }

    /**
     * @param {string|number} id
     * @returns {Promise<T>}
     */
    async getById(id) {

        if (!id) {
            throw new Error('ID is required')
        }

        const data = await get(`${this.resource}/${id}`)

        return Object.assign(new this.Model(), data)
    }

    /**
     * @param {object|T} data
     */
    async create(data) {

        const payload = Array.isArray(data)
            ? data
            : [data]

        if (payload.length === 0) {
            return []
        }

        return await post(this.resource, {
            input: payload
        })
    }

    /**
     * @param {string|number} id
     * @param {any} data
     */
    async update(id, data) {

        if (!id) {
            throw new Error('ID is required')
        }

        return await put(`${this.resource}/${id}`, {
            input: [data]
        })
    }

    /**
     * @param {string|number} id
     * @param {boolean} [force=false]
     * @param {{
     *   addLog?: (message: string) => void
     * }} [options={}]
     */
    async delete(id, force = false, { addLog } = {}) {

        if (!id) {

            addLog?.(
                `Error deleting ${id} in ${this.resource}: ID is required`
            )

            throw new Error('ID is required')
        }

        const deleted = await del(
            `${this.resource}/${id}?force_purge=${force}`
        )

        addLog?.(
            `ID ${id} deleted in ${this.resource}`
        )

        return deleted
    }

    /**
     * @param {{
     *   ids?: number[],
     *   from?: number|null,
     *   to?: number|null,
     *   force?: boolean,
     *   addLog?: (message: string) => void
     * }} params
     */
    async deleteAll({
        ids = [],
        from = null,
        to = null,
        force = false,
        addLog
    } = {}) {

        let targets = [...ids]

        const items = await this.getAll()

        if (from !== null || to !== null) {

            const filtered = items.filter(item => {

                if (from !== null && to !== null) {
                    return item.id >= from && item.id <= to
                }

                if (from !== null) {
                    return item.id >= from
                }

                if (to !== null) {
                    return item.id <= to
                }

                return false
            })

            targets.push(...filtered.map(item => item.id))
        } else {

            targets.push(...items.map(item => item.id))
        }

        targets = [...new Set(targets)]

        if (!targets.length) {

            addLog?.(
                `WARN: Aucun élément à supprimer dans ${this.resource}`
            )

            return []
        }

        const deleted = await del(
            `${this.resource}?force_purge=${force}`,
            {
                input: targets.map(id => ({ id }))
            }
        )

        addLog?.(
            `Tous les éléments supprimés dans ${this.resource}`
        )

        return deleted
    }
}

/** @type {BaseService<Appliance>} */
export const applianceService = new BaseService(Appliance)

/** @type {BaseService<Certificate>} */
export const certificateService = new BaseService(Certificate)

/** @type {BaseService<Computer>} */
export const computerService = new BaseService(Computer)

/** @type {BaseService<Monitor>} */
export const monitorService = new BaseService(Monitor)

/** @type {BaseService<NetworkEquipment>} */
export const networkEquipmentService = new BaseService(NetworkEquipment)

/** @type {BaseService<Peripheral>} */
export const peripheralService = new BaseService(Peripheral)

/** @type {BaseService<Phone>} */
export const phoneService = new BaseService(Phone)

/** @type {BaseService<Printer>} */
export const printerService = new BaseService(Printer)

/** @type {BaseService<SoftwareLicense>} */
export const softwareLicenseService = new BaseService(SoftwareLicense)

/** @type {BaseService<Unmanaged>} */
export const unmanagedService = new BaseService(Unmanaged)

/** @type {BaseService<Ticket>} */
export const ticketService = new BaseService(Ticket)

/** @type {BaseService<ItemTicket>} */
export const ticketItemService = new BaseService(ItemTicket)

/** @type {BaseService<TicketCost>} */
export const ticketCostService = new BaseService(TicketCost)

/** @type {BaseService<TicketUser>} */
export const ticketUserService = new BaseService(TicketUser)

/** @type {BaseService<ITILFollowup>} */
export const itilFollowupService = new BaseService(ITILFollowup)

/** @type {BaseService<User>} */
export const userService = new BaseService(User)

/** @type {BaseService<ProfileUser>} */
export const profileUserService = new BaseService(ProfileUser)

/** @type {BaseService<State>} */
export const stateService = new BaseService(State)

/** @type {BaseService<Location>} */
export const locationService = new BaseService(Location)

/** @type {BaseService<Manufacturer>} */
export const manufacturerService = new BaseService(Manufacturer)

/** @type {BaseService<ComputerModel>} */
export const computerModelService = new BaseService(ComputerModel)

/** @type {BaseService<MonitorModel>} */
export const monitorModelService = new BaseService(MonitorModel)

/** @type {BaseService<NetworkEquipmentModel>} */
export const networkEquipmentModelService = new BaseService(NetworkEquipmentModel)

/** @type {BaseService<PeripheralModel>} */
export const peripheralModelService = new BaseService(PeripheralModel)

/** @type {BaseService<PhoneModel>} */
export const phoneModelService = new BaseService(PhoneModel)

/** @type {BaseService<PrinterModel>} */
export const printerModelService = new BaseService(PrinterModel)

/** @type {BaseService<Document>} */
export const documentService = new BaseService(Document)

/** @type {BaseService<DocumentItem>} */
export const documentItemService = new BaseService(DocumentItem)