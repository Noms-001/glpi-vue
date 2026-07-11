import BasePhysicalAsset from './BasePhysicalAsset'

export default class SoftwareLicense extends BasePhysicalAsset {

    static resource = '/SoftwareLicense'

    softwarelicensetypes_id = null

    completename = ''
    level = 0

}