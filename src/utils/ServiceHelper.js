import {
    computerService,
    monitorService,
    phoneService,
    computerModelService,
    monitorModelService,
    phoneModelService
} from '../services/BaseService'

const assetServiceMap = {
    Computer: computerService,
    Monitor: monitorService,
    Phone: phoneService
}

const modelServiceMap = {
    Computer: computerModelService,
    Monitor: monitorModelService,
    Phone: phoneModelService
}

/**
 * @param {keyof typeof assetServiceMap} name
 */
export function getAssetService(name) {
    const service = assetServiceMap[name]

    if (!service) {
        throw new Error(`AssetService not found for: ${name}`)
    }

    return service
}

/**
 * @param {keyof typeof modelServiceMap} name
 */
export function getModelService(name) {
    const service = modelServiceMap[name]

    if (!service) {
        throw new Error(`ModelService not found for: ${name}`)
    }

    return service
}