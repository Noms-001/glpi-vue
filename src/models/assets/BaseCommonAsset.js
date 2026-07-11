import BaseModel from '../BaseModel'

export default class BaseAsset extends BaseModel {

    id = null
    name = ''
    comment = ''

    states_id = 0
    entities_id = 0

    is_recursive = false

    manufacturers_id = 0
    users_id = 0
    users_id_tech = 0

    groups_id = 0
    groups_id_tech = 0

    contact = ''
    contact_num = ''

    serial = ''
    otherserial = ''

    is_deleted = false

    date_creation = null
    date_mod = null

}