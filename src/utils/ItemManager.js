//@ts-nocheck
import Computer from "../models/assets/Computer";
import Monitor from "../models/assets/Monitor";
import Phone from "../models/assets/Phone";
import {
    computerModelService,
    computerService,
    documentItemService,
    documentService,
    locationService,
    manufacturerService,
    monitorModelService,
    monitorService,
    phoneModelService,
    phoneService,
    stateService,
    userService
} from "../services/BaseService";

export const items = [
    {
        name: "Ordinateurs",
        item: Computer,
        service: computerService
    },
    {
        name: "Moniteurs",
        item: Monitor,
        service: monitorService
    },
    {
        name: "Téléphones",
        item: Phone,
        service: phoneService
    }
];

const itemModels = {
    Computer: computerModelService,
    Monitor: monitorModelService,
    Phone: phoneModelService
}

export async function getAllItems() {
    const [users, locations, manufacturers, states, documents, documentItems] = await Promise.all([
        userService.getAll(),
        locationService.getAll(),
        manufacturerService.getAll(),
        stateService.getAll(),
        documentService.getAll(),
        documentItemService.getAll()
    ])

    const usersMap = new Map(users.map(u => [u.id, u]))
    const locationsMap = new Map(locations.map(l => [l.id, l]))
    const manufacturersMap = new Map(manufacturers.map(m => [m.id, m]))
    const statesMap = new Map(states.map(s => [s.id, s]))
    const documentsMap = new Map(documents.map(d => [d.id, d]))

    const models = {}

    await Promise.all(
        Object.entries(itemModels).map(async ([type, service]) => {
            const data = await service.getAll()
            models[type] = new Map(data.map(m => [m.id, m]))
        })
    )

    const assets = await Promise.all(
        items.map(async ({ item, service }) => ({
            type: item.name,
            data: await service.getAll()
        }))
    )

    return assets.flatMap(({ type, data }) =>
        data.map(el => ({
            ...el,
            itemtype: type,

            userObject: usersMap.get(el.users_id) || null,
            locationObject: locationsMap.get(el.locations_id) || null,
            manufacturerObject: manufacturersMap.get(el.manufacturers_id) || null,
            stateObject: statesMap.get(el.states_id) || null,

            documents: documentItems
                .filter(di =>
                    di.itemtype === type &&
                    di.items_id === el.id
                )
                .map(di => documentsMap.get(di.documents_id))
                .filter(Boolean),

            modelObject: models[type]?.get(
                el.computermodels_id ??
                el.monitormodels_id ??
                el.networkequipmentmodels_id ??
                el.peripheralmodels_id ??
                el.phonemodels_id ??
                el.printermodels_id
            ) || null
        }))
    )
}