import BasePhysicalAsset from './BasePhysicalAsset'

export default class BaseInventoryAsset extends BasePhysicalAsset {

    uuid = ''

    autoupdatesystems_id = 0

    is_template = false
    template_name = ''

    ticket_tco = 0

    is_dynamic = false

}