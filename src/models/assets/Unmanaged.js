import BaseCommonAsset from './BaseCommonAsset'

export default class Unmanaged extends BaseCommonAsset {

    static resource = '/Unmanaged'

    networks_id = null

    autoupdatesystems_id = null

    is_dynamic = false

    sysdescr = ''

    agents_id = null

    itemtype = ''

    accepted = false
    is_hub = false

    ip = ''

    snmpcredentials_id = null

    last_inventory_update = null

}