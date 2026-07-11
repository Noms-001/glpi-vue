import BaseModel from '../BaseModel'

export default class Location extends BaseModel {

    static resource = '/Location'

    id = 0

    name = ''
    completename = ''

    code = ''
    alias = ''

    comment = ''

    entities_id = null

    is_recursive = false

    parents_id = null

    level = 0

    room = ''
    building = ''

    address = ''
    town = ''
    postcode = ''

    state = ''
    country = ''

    latitude = ''
    longitude = ''
    altitude = ''

    date_creation = null
    date_mod = null
}