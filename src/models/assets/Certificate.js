import BasePhysicalAsset from './BasePhysicalAsset'

export default class Certificate extends BasePhysicalAsset {

    static resource = '/Certificate'

    certificatertypes_id = null

    template_name = ''
    is_template = false

    dns_name = ''
    dns_suffix = ''

    is_selfsign = false

    date_expiration = null

    command = ''
    certificate_request = ''
    certificate_item = ''

}