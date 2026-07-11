// @ts-nocheck
import User from "../models/administration/User";
import BaseInventoryAsset from "../models/assets/BaseInventoryAsset";
import AssetModel from "../models/dropdowns/AssetModel"
import Location from "../models/dropdowns/Location";
import Manufacturer from "../models/dropdowns/Manufacturer";
import State from "../models/dropdowns/State";
import { certificateService, computerModelService, computerService, documentItemService, documentService, locationService, manufacturerService, monitorModelService, monitorService, networkEquipmentModelService, networkEquipmentService, peripheralModelService, peripheralService, phoneModelService, phoneService, printerModelService, printerService, softwareLicenseService, stateService, ticketCostService, ticketItemService, ticketService, ticketUserService, unmanagedService, userService } from "../services/BaseService";
import { getAssetService, getModelService } from "./ServiceHelper"
import Ticket from "../models/assistance/Ticket";
import ItemTicket from "../models/assistance/ItemTicket";
import TicketCost from "../models/assistance/TicketCost";
import { cancelLastSuperCost, closeTicket, handleMouvementTicket, saveCost } from "./TicketManager";
import { del, post } from "../api/backend-client";
export default class DataManager {
    /**
     * @param {File[]} files 
     * @param {(message: string) => void} addLog 
     * @param {(progress: number) => void} updateProgress 
     */

    modelMap = new Map();
    locationMap = new Map();
    manufacturerMap = new Map();
    userMap = new Map();
    stateMap = new Map();
    assetMap = new Map();
    ticketMap = new Map();
    BATCH_SIZE = 100

    async import(files, addLog, updateProgress) {
        /** @type {Asset[]} */
        const assets = []
        /** @type {TicketImport[]} */
        const tickets = []
        /** @type {TicketCostImport[]} */
        const ticketCosts = []

        addLog('Démarrage de l\'import des données...')

        let processedFiles = 0
        const totalFiles = files.length

        for (const file of files) {
            addLog(`Traitement du fichier : ${file.name}`)

            try {
                const rows = await this.parseCsv(file)
                updateProgress(5 + (processedFiles / totalFiles) * 80)

                if (!rows.length) {
                    addLog(`⚠️ Le fichier ${file.name} est vide, ignoré.`)
                    processedFiles++
                    continue
                }

                const headers = Object.keys(rows[0])

                if (this.isAssetFile(headers)) {
                    const cleanedAssets = this.cleanAssets(rows)
                    assets.push(...cleanedAssets)
                    addLog(`✅ ${cleanedAssets.length} actifs importés depuis ${file.name}`)
                } else if (this.isTicketFile(headers)) {
                    const cleanedTickets = this.cleanTickets(rows)
                    tickets.push(...cleanedTickets)
                    addLog(`✅ ${cleanedTickets.length} tickets importés depuis ${file.name}`)
                } else if (this.isTicketCostFile(headers)) {
                    const cleanedCosts = this.cleanTicketCosts(rows)
                    ticketCosts.push(...cleanedCosts)
                    addLog(`✅ ${cleanedCosts.length} coûts de tickets importés depuis ${file.name}`)
                } else {
                    addLog(`❌ Type de fichier inconnu : ${file.name}`)
                    console.warn(`Type de fichier inconnu : ${file.name}`)
                }
            } catch (error) {
                addLog(`❌ Erreur lors du traitement de ${file.name} : ${error.message}`)
                console.error(`Erreur avec le fichier ${file.name}:`, error)
                throw error
            }

            processedFiles++
        }

        updateProgress(2)
        addLog('- Import des Assets: ')
        try {
            await this.importAssets(assets, addLog, updateProgress)
        } catch (error) {
            addLog(`❌ Erreur lors de l'import des assets : ${error.message}`)
            console.error(`Erreur avec l'import des assets:`, error)
            throw error
        }
        addLog('- Import des Tickets: ')
        try {
            await this.importTickets(tickets, ticketCosts, addLog, updateProgress)
        } catch (error) {
            addLog(`❌ Erreur lors de l'import des tickets : ${error.message}`)
            console.error(`Erreur avec l'import des tickets:`, error)
            throw error
        }
        updateProgress(70)
        addLog('✅ Import des données terminé avec succès !')

        return {
            assets,
            tickets,
            ticketCosts,
            map: this.assetMap
        }
    }

    /**
     * @param {Asset[]} assets 
     */
    async importAssets(assets, addLog, updateProgress) {
        try {

            // =========================
            // PRÉPARATION DES DONNÉES UNIQUES
            // =========================

            // MODELS
            const uniqueModels = new Map()
            assets.forEach(a => {
                const key = `${a.model}$${a.itemType}`
                if (a.model && !uniqueModels.has(key)) {
                    uniqueModels.set(key, a)
                }
            })
            const modelsToCreate = [...uniqueModels.values()].map(a => ({ name: a.model }))

            // LOCATIONS
            const uniqueLocations = new Map()
            assets.forEach(a => {
                if (a.location && !uniqueLocations.has(a.location)) {
                    uniqueLocations.set(a.location, a)
                }
            })
            const locationsToCreate = [...uniqueLocations.values()].map(a => ({ name: a.location }))

            // MANUFACTURERS
            const uniqueManufacturers = new Map()
            assets.forEach(a => {
                if (a.manufacturer && !uniqueManufacturers.has(a.manufacturer)) {
                    uniqueManufacturers.set(a.manufacturer, a)
                }
            })
            const manufacturersToCreate = [...uniqueManufacturers.values()].map(a => ({ name: a.manufacturer }))

            // STATES
            const uniqueStates = new Map()
            assets.forEach(a => {
                if (a.status && !uniqueStates.has(a.status)) {
                    uniqueStates.set(a.status, a)
                }
            })
            const statesToCreate = [...uniqueStates.values()].map(a => ({ name: a.status }))

            // =========================
            // EXÉCUTION PARALLÈLE DES CRÉATIONS INDÉPENDANTES AVEC BATCHES
            // =========================

            const createInBatches = async (service, itemsToCreate, getOriginalItems, createFunction) => {
                if (!itemsToCreate || itemsToCreate.length === 0) return []

                const batches = []
                for (let i = 0; i < itemsToCreate.length; i += this.BATCH_SIZE) {
                    const batch = itemsToCreate.slice(i, i + this.BATCH_SIZE)
                    const originalBatch = getOriginalItems ? getOriginalItems().slice(i, i + this.BATCH_SIZE) : []
                    batches.push({ batch, originalBatch, startIndex: i })
                }

                const batchPromises = batches.map(async ({ batch, originalBatch, startIndex }) => {
                    const saved = await service.create(batch)
                    if (createFunction) {
                        createFunction(saved, originalBatch, startIndex)
                    }
                    return saved
                })

                const results = await Promise.all(batchPromises)
                return results.flat()
            }

            const getModelsList = () => [...uniqueModels.values()]
            const getLocationsList = () => [...uniqueLocations.values()]
            const getManufacturersList = () => [...uniqueManufacturers.values()]
            const getStatesList = () => [...uniqueStates.values()]

            const [
                savedModels,
                savedLocations,
                savedManufacturers,
                savedStates
            ] = await Promise.all([
                modelsToCreate.length > 0
                    ? createInBatches(
                        getModelService(assets[0]?.itemType),
                        modelsToCreate,
                        getModelsList,
                        (saved, originalBatch, startIndex) => {
                            saved.forEach((model, idx) => {
                                const originalAsset = originalBatch[idx]
                                this.modelMap.set(`${originalAsset.model}$${originalAsset.itemType}`, model.id)
                                addLog(`✅ Model ajouté: ${originalAsset.model}`)
                            })
                        }
                    )
                    : Promise.resolve([]),
                locationsToCreate.length > 0
                    ? createInBatches(
                        locationService,
                        locationsToCreate,
                        getLocationsList,
                        (saved, originalBatch) => {
                            saved.forEach((location, idx) => {
                                const originalAsset = originalBatch[idx]
                                this.locationMap.set(originalAsset.location, location.id)
                                addLog(`✅ Location ajoutée: ${originalAsset.location}`)
                            })
                        }
                    )
                    : Promise.resolve([]),
                manufacturersToCreate.length > 0
                    ? createInBatches(
                        manufacturerService,
                        manufacturersToCreate,
                        getManufacturersList,
                        (saved, originalBatch) => {
                            saved.forEach((manufacturer, idx) => {
                                const originalAsset = originalBatch[idx]
                                this.manufacturerMap.set(originalAsset.manufacturer, manufacturer.id)
                                addLog(`✅ Manufacturer ajouté: ${originalAsset.manufacturer}`)
                            })
                        }
                    )
                    : Promise.resolve([]),
                statesToCreate.length > 0
                    ? createInBatches(
                        stateService,
                        statesToCreate,
                        getStatesList,
                        (saved, originalBatch) => {
                            saved.forEach((state, idx) => {
                                const originalAsset = originalBatch[idx]
                                this.stateMap.set(originalAsset.status, state.id)
                                addLog(`✅ Status ajouté: ${originalAsset.status}`)
                            })
                        }
                    )
                    : Promise.resolve([])
            ])

            // =========================
            // CRÉATION DES USERS (dépend des locations)
            // =========================

            const uniqueUsers = new Map()
            assets.forEach(a => {
                if (a.user && !uniqueUsers.has(a.user)) {
                    uniqueUsers.set(a.user, a)
                }
            })

            const usersToCreate = [...uniqueUsers.values()].map(a => ({
                name: a.user,
                locations_id: this.locationMap.get(a.location)
            }))

            let savedUsers = []
            if (usersToCreate.length > 0) {
                const getUserList = () => [...uniqueUsers.values()]
                savedUsers = await createInBatches(
                    userService,
                    usersToCreate,
                    getUserList,
                    (saved, originalBatch) => {
                        saved.forEach((user, idx) => {
                            const originalAsset = originalBatch[idx]
                            this.userMap.set(originalAsset.user, user.id)
                            addLog(`✅ User ajouté: ${originalAsset.user}`)
                        })
                    }
                )
            }

            updateProgress(15)
            addLog('Import des références terminé')

            // =========================
            // ITEMS (ASSETS) - CRÉATION PAR TYPE EN PARALLÈLE AVEC BATCHES
            // =========================

            const itemsToCreate = assets.map(a => ({
                name: a.name,
                otherserial: a.inventoryNumber,
                locations_id: this.locationMap.get(a.location),
                users_id: this.userMap.get(a.user) || 0,
                states_id: this.stateMap.get(a.status),
                manufacturers_id: this.manufacturerMap.get(a.manufacturer),
                [`${String(a.itemType).toLocaleLowerCase()}models_id`]: this.modelMap.get(`${a.model}$${a.itemType}`)
            }))

            // Grouper par type d'asset
            const itemsByType = new Map()
            assets.forEach((a, index) => {
                if (!itemsByType.has(a.itemType)) {
                    itemsByType.set(a.itemType, [])
                }
                itemsByType.get(a.itemType).push({
                    item: itemsToCreate[index],
                    originalAsset: a
                })
            })

            // Exécution parallèle des insertions par type d'asset avec batches
            const insertionPromises = []
            for (const [itemType, items] of itemsByType) {
                const service = getAssetService(itemType)
                const itemsData = items.map(i => i.item)
                const originalAssets = items.map(i => i.originalAsset)

                if (itemsData.length > 0) {
                    // Créer les batches pour ce type d'asset
                    const batches = []
                    for (let i = 0; i < itemsData.length; i += this.BATCH_SIZE) {
                        const batch = itemsData.slice(i, i + this.BATCH_SIZE)
                        const originalBatch = originalAssets.slice(i, i + this.BATCH_SIZE)
                        batches.push({ batch, originalBatch })
                    }

                    // Exécuter les batches en parallèle
                    const batchPromises = batches.map(async ({ batch, originalBatch }) => {
                        const saved = await service.create(batch)
                        saved.forEach((item, idx) => {
                            const originalAsset = originalBatch[idx]
                            addLog(`✅ Items ajouté: ${originalAsset.name}`)
                            this.assetMap.set(originalAsset.name, { id: item.id, type: itemType })
                        })
                        return saved
                    })

                    insertionPromises.push(Promise.all(batchPromises))
                }
            }

            await Promise.all(insertionPromises)

            addLog('Import des items terminé')
            updateProgress(25)
        } catch (error) {
            addLog(`❌ Erreur lors de l'import des assets: ${error}`)
            console.error(error)
            throw error
        }
    }

    /**
     * @param {TicketImport[]} tickets
     * @param {TicketCostImport[]} ticketCosts
     */
    async importTickets(tickets, ticketCosts, addLog, updateProgress) {
        try {

            const toGlpiDate = (dateStr, timeStr) => {
                if (!dateStr || !timeStr) return null
                const [day, month, year] = dateStr.split('/')
                const [hour, minute] = timeStr.split(':')
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`
            }

            const ticketStatus = {
                new: 1, assigned: 2, planned: 3,
                pending: 4, solved: 5, closed: 6
            }

            const ticketType = {
                incident: 1, request: 2
            }

            const level = {
                very_low: 1, low: 2, medium: 3,
                high: 4, very_high: 5, major: 6
            }

            const status = (name) => {
                const n = String(name).toLocaleLowerCase()
                let state = ticketStatus[n]
                if (!state) {
                    if (n.includes('assign')) return 2;
                    if (n.includes('plan')) return 3;
                    if (n.includes('pend')) return 4;
                    if (n.includes('solve')) return 5;
                    if (n.includes('close')) return 6;
                    if (n.includes('progress')) return 2;
                }
                return state || 1
            }

            // =========================
            // CRÉATION DES TICKETS EN BATCHES PARALLÈLES
            // =========================

            const closed = []
            const ticketsToCreate = tickets.map(t => {
                let state = Number(status(t.status))
                if (state === 6) {
                    closed.push({ ref: t.refTicket, status: 6, closedate: toGlpiDate(String(t.date), String(t.heure)) })
                    state = 1
                }
                return {
                    date: toGlpiDate(String(t.date), String(t.heure)),
                    status: state,
                    type: ticketType[String(t.type).toLocaleLowerCase()] || 2,
                    content: t.description,
                    name: t.titre,
                    priority: level[String(t.priority).toLocaleLowerCase().replace(' ', '_')],
                    externalid: t.refTicket
                }
            })

            // Créer les batches de tickets
            const ticketBatches = []
            for (let i = 0; i < ticketsToCreate.length; i += this.BATCH_SIZE) {
                const batch = ticketsToCreate.slice(i, i + this.BATCH_SIZE)
                const originalBatch = tickets.slice(i, i + this.BATCH_SIZE)
                ticketBatches.push({ batch, originalBatch, startIndex: i })
            }

            // Exécuter les batches en parallèle
            const ticketBatchPromises = ticketBatches.map(async ({ batch, originalBatch, startIndex }) => {
                const saved = await ticketService.create(batch)
                saved.forEach((ticket, idx) => {
                    const originalTicket = originalBatch[idx]
                    this.ticketMap.set(originalTicket.refTicket, ticket.id)
                    addLog(`✅ Ticket ajouté: ${originalTicket.refTicket}`)
                })
                return saved
            })

            const allSavedTickets = await Promise.all(ticketBatchPromises)
            const savedTickets = allSavedTickets.flat()

            closed.map(c => {
                const id = this.ticketMap.get(c.ref)
                c.id = id
            })

            updateProgress(40)
            addLog(`Import des tickets terminé (${savedTickets.length} tickets)`)

            // =========================
            // PRÉPARATION DES LIENS TICKET-ITEMS ET TICKET COSTS
            // =========================

            // Préparer tous les liens ticket-items
            const ticketItemsToCreate = []
            tickets.forEach((t) => {
                const items = String(t.items)
                    .replace(/[\[\]]/g, '')
                    .split(',')
                    .filter(i => i.trim())

                const ticketId = this.ticketMap.get(t.refTicket)

                items.forEach(itemName => {
                    const asset = this.assetMap.get(itemName.trim())
                    if (asset && ticketId) {
                        ticketItemsToCreate.push({
                            itemtype: asset.type,
                            items_id: asset.id,
                            tickets_id: ticketId
                        })
                    }
                })
            })

            // Préparer tous les ticket costs
            const ticketCostsToCreate = []
            ticketCosts.forEach((cost) => {
                const ticketId = this.ticketMap.get(cost.numTicket)
                if (ticketId) {
                    ticketCostsToCreate.push({
                        actiontime: cost.durationSecond,
                        cost_fixed: cost.fixedCost,
                        cost_time: cost.timeCost,
                        tickets_id: ticketId
                    })
                }
            })

            // =========================
            // CRÉATION PARALLÈLE DES BATCHES TICKET-ITEMS ET TICKET COSTS
            // =========================

            const creationPromises = []

            // Traitement des ticket-items par batches
            if (ticketItemsToCreate.length > 0) {
                const itemBatches = []
                for (let i = 0; i < ticketItemsToCreate.length; i += this.BATCH_SIZE) {
                    const batch = ticketItemsToCreate.slice(i, i + this.BATCH_SIZE)
                    itemBatches.push(batch)
                }

                // Créer une promesse pour chaque batch de ticket-items
                itemBatches.forEach((batch, index) => {
                    const promise = ticketItemService.create(batch).then(() => {
                        addLog(`✅ Batch ${index + 1}/${itemBatches.length}: ${batch.length} liens ticket-items ajoutés`)
                        return batch.length
                    })
                    creationPromises.push(promise)
                })
            }

            // Traitement des ticket costs par batches
            if (ticketCostsToCreate.length > 0) {
                const costBatches = []
                for (let i = 0; i < ticketCostsToCreate.length; i += this.BATCH_SIZE) {
                    const batch = ticketCostsToCreate.slice(i, i + this.BATCH_SIZE)
                    costBatches.push(batch)
                }

                // Créer une promesse pour chaque batch de ticket costs
                costBatches.forEach((batch, index) => {
                    const promise = ticketCostService.create(batch).then(() => {
                        addLog(`✅ Batch ${index + 1}/${costBatches.length}: ${batch.length} coûts de ticket ajoutés`)
                        return batch.length
                    })
                    creationPromises.push(promise)
                })
            }

            // Exécuter TOUS les batches (items ET costs) en parallèle
            if (creationPromises.length > 0) {
                const results = await Promise.all(creationPromises)
                const totalItems = results.reduce((sum, count) => sum + count, 0)
                addLog(`✅ Total créé: ${totalItems} éléments (liens + coûts)`)
            }

            if (closed.length > 0) {
                await closeTicket(closed)
            }

            addLog('Import des liens ticket-items et des coûts terminé')
            updateProgress(50)

        } catch (error) {
            addLog(`❌ Erreur lors de l'import des tickets: ${error}`)
            console.error(error)
            throw error
        }
    }

    /**
     * @param {string[]} headers 
     * @returns {string}
     */
    detectFileType(headers) {
        if (this.isAssetFile(headers)) return 'Actifs'
        if (this.isTicketFile(headers)) return 'Tickets'
        if (this.isTicketCostFile(headers)) return 'Coûts de tickets'
        return 'Inconnu'
    }

    /**
     * @param {File} file 
     * @returns {Promise<any[]>}
     */
    async parseCsv(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (event) => {
                try {
                    const text = event.target?.result
                    if (typeof text !== 'string') {
                        reject(new Error('Impossible de lire le fichier'))
                        return
                    }

                    const lines = text.split('\n')
                    if (lines.length < 2) {
                        resolve([])
                        return
                    }

                    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
                    const rows = []

                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue

                        const values = this.parseCsvLine(lines[i])
                        const row = {}

                        headers.forEach((header, index) => {
                            row[header] = values[index] || ''
                        })

                        rows.push(row)
                    }

                    resolve(rows)
                } catch (error) {
                    reject(error)
                }
            }

            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
            reader.readAsText(file, 'UTF-8')
        })
    }

    /**
     * @param {string} line 
     * @returns {string[]}
     */
    parseCsvLine(line) {
        const result = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }

        result.push(current.trim())
        return result
    }

    isAssetFile(headers) {
        return headers.includes('Inventory_Number')
    }

    isTicketFile(headers) {
        return headers.includes('Ref_Ticket')
    }

    isTicketCostFile(headers) {
        return headers.includes('Num_Ticket')
    }

    cleanAssets(rows) {
        return rows.map(row => {
            try {
                return Object.assign(new Asset(), {
                    name: row.Name?.trim(),
                    status: row.Status?.trim(),
                    location: row.Location?.trim(),
                    manufacturer: row.Manufacturer?.trim(),
                    itemType: row.Item_Type?.trim(),
                    model: row.Model?.trim(),
                    inventoryNumber: row.Inventory_Number?.trim(),
                    user: row.User?.trim() || null
                })
            } catch (error) {
                console.error(`Erreur lors du parsing du asset ${row.Name}:`, error)
                throw error
            }
        })
    }

    clearItems(items) {
        return String(items).replace('[', '').replace(']', '').split(',')
    }

    cleanTickets(rows) {
        return rows.map(row => {
            try {
                return Object.assign(new TicketImport(), {
                    refTicket: Number(row.Ref_Ticket),
                    date: row.Date,
                    heure: row.Heure,
                    type: row.Type,
                    titre: row.Titre,
                    description: row.Description,
                    status: row.Status,
                    priority: row.Priority,
                    items: this.clearItems(row.Items || '[]')
                })
            } catch (error) {
                console.error(`Erreur lors du parsing du ticket ${row.Ref_Ticket}:`, error)
                throw error
            }
        })
    }

    cleanTicketCosts(rows) {
        return rows.map(row => {
            try {
                return Object.assign(new TicketCostImport(), {
                    numTicket: Number(row.Num_Ticket),
                    durationSecond: Number(row.Duration_second),
                    timeCost: Number(String(row.Time_Cost).replace(',', '.')),
                    fixedCost: Number(String(row.Fixed_Cost).replace(',', '.'))
                })
            } catch (error) {
                console.error(`Erreur lors du parsing du ticket_cost ${row.Num_Ticket}:`, error)
                throw error
            }
        })

    }

    async reset(addLog, updateProgress) {
        addLog('⚠️ Initialisation de la réinitialisation...')

        await Promise.all([
            ticketUserService.deleteAll({ force: true, addLog }),
            documentItemService.deleteAll({ force: true, addLog }),
            ticketService.deleteAll({ force: true, addLog }),
            computerService.deleteAll({ force: true, addLog }),
            monitorService.deleteAll({ force: true, addLog }),
            networkEquipmentService.deleteAll({ force: true, addLog }),
            peripheralService.deleteAll({ force: true, addLog }),
            phoneService.deleteAll({ force: true, addLog }),
            printerService.deleteAll({ force: true, addLog }),
            unmanagedService.deleteAll({ force: true, addLog }),
            softwareLicenseService.deleteAll({ force: true, addLog }),
            certificateService.deleteAll({ force: true, addLog })
        ])
        addLog('Items et Tickets réinitialisés.')
        updateProgress(50)

        await Promise.all([
            documentService.deleteAll({ force: true, addLog }),
            computerModelService.deleteAll({ force: true, addLog }),
            monitorModelService.deleteAll({ force: true, addLog }),
            networkEquipmentModelService.deleteAll({ force: true, addLog }),
            peripheralModelService.deleteAll({ force: true, addLog }),
            phoneModelService.deleteAll({ force: true, addLog }),
            printerModelService.deleteAll({ force: true, addLog }),
            manufacturerService.deleteAll({ force: true, addLog }),
            locationService.deleteAll({ force: true, addLog }),
            stateService.deleteAll({ force: true, addLog }),
            userService.deleteAll({ from: 7, force: true, addLog })
        ])
        updateProgress(100)
        addLog('DropDowns reinitialisés.')
        addLog('✅ Base réinitialisée avec succès.')
    }

    async resetItemCost() {
        const response = await del('/item-cost/reset')
        if (response.success) {
            return response.data
        } else {
            throw new Error(response.error)
        }
    }

    /**
     * @param {{
     *   filesObject: any,
     *   tickets?: Ticket[]
     * }} params
     */
    async importMouvement(filesObject, tickets = null) {
        try {
            if (!tickets) tickets = await ticketService.getAll()
            const ticketItems = await ticketItemService.getAll()
            for (const object of filesObject) {
                /** @type {Ticket} */
                const ticket = tickets.find(t => t.externalid == object.ticket)
                await handleMouvementTicket(ticket.id, object.mouvement, object.valeur, object.mode, ticketItems)
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}



class Asset {
    name
    status
    location
    manufacturer
    itemType
    model
    inventoryNumber
    user
}

class TicketImport {
    refTicket
    date
    heure
    type
    titre
    description
    status
    priority
    items
}

class TicketCostImport {
    numTicket
    durationSecond
    timeCost
    fixedCost
}
