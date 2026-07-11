import BaseInventoryAsset from './BaseInventoryAsset'

export default class Printer extends BaseInventoryAsset {

    static resource = '/Printer'

    printermodels_id = null
    printertypes_id = null

    networks_id = null

    has_serial = false
    has_parallel = false
    has_usb = false
    has_wifi = false
    has_ethernet = false

    is_global = false

    sysdescr = ''

    snmpcredentials_id = null

    last_inventory_update = null

}