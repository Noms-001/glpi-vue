import BaseModel from '../BaseModel'

export default class Manufacturer extends BaseModel {

    static resource = '/Manufacturer'

    id = 0

    name = ''
    comment = ''

    date_creation = null
    date_mod = null
}