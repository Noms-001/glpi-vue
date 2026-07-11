import BaseInventoryAsset from './BaseInventoryAsset'

export default class Computer extends BaseInventoryAsset {

    static resource = '/Computer'

    computermodels_id = null
    computertypes_id = null

    networks_id = null

    last_inventory_update = null
    last_boot = null

}