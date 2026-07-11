import BasePhysicalAsset from './BasePhysicalAsset'

export default class Appliance extends BasePhysicalAsset {

    static resource = '/Appliance'

    appliancetypes_id = 0

    environments_id = 0
    externalid = ''
    is_helpdesk_visible = false

}