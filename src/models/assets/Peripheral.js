import BaseInventoryAsset from './BaseInventoryAsset'

export default class Peripheral extends BaseInventoryAsset {

    static resource = '/Peripheral'

    peripheralmodels_id = null
    peripheraltypes_id = null

    brand = ''
    is_global = false

}