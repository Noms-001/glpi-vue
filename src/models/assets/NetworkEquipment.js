import BaseInventoryAsset from './BaseInventoryAsset'

export default class NetworkEquipment extends BaseInventoryAsset {

    static resource = '/NetworkEquipment'

    networkequipmentmodels_id = null
    networkequipmenttypes_id = null

    networks_id = null

    ram = 0
    cpu = 0

    sysdescr = ''

    snmpcredentials_id = null

    last_inventory_update = null
}