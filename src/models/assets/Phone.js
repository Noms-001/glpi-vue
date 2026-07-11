import BaseInventoryAsset from './BaseInventoryAsset'

export default class Phone extends BaseInventoryAsset {

    static resource = '/Phone'

    phonemodels_id = null
    phonetypes_id = null

    brand = ''

    powersupplies_id = null

    number_line = ''

    have_headset = false
    have_hp = false

    is_global = false

    last_inventory_update = null

}